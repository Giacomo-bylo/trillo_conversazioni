import { useState } from 'react';
import { Sparkles, Check, Wand2, GitCompare, X, Clock, Phone, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useCalls } from '@/hooks/useCalls';
import { usePromptVersions } from '@/hooks/usePromptVersions';
import { analyzeBatch, deployPrompt } from '@/lib/n8n';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cn, formatDuration, formatDate } from '@/lib/utils';
import { Call } from '@/types';

const QUICK_ACTIONS = [
  "Più empatica con indecisi",
  "Più diretta sui tempi",
  "Gestire meglio obiezione 'Prezzo alto'",
  "Ridurre ripetizioni",
  "Tono più caldo"
];

// Componente Modal per visualizzare il transcript completo
const TranscriptModal = ({ call, onClose }: { call: Call; onClose: () => void }) => {
  const transcriptList = Array.isArray(call.transcript) 
    ? call.transcript 
    : typeof call.transcript === 'string' && call.transcript.startsWith('[')
      ? JSON.parse(call.transcript)
      : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{call.lead_nome || 'Lead sconosciuto'}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDate(call.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {formatDuration(call.durata_chiamata || 0)}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                call.esito_qualificazione === 'qualified' ? "bg-emerald-50 text-emerald-700" :
                call.esito_qualificazione === 'not_qualified' ? "bg-red-50 text-red-700" :
                "bg-amber-50 text-amber-700"
              )}>
                {call.esito_qualificazione || 'N/A'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {transcriptList.length > 0 ? (
            transcriptList.map((msg: { role: string; content: string }, idx: number) => (
              <div key={idx} className={cn("flex gap-3", msg.role === 'agent' ? "flex-row" : "flex-row-reverse")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                  msg.role === 'agent' ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-600"
                )}>
                  {msg.role === 'agent' ? 'AI' : 'U'}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm max-w-[80%]",
                  msg.role === 'agent' 
                    ? "bg-gray-100 text-gray-900 rounded-tl-none" 
                    : "bg-primary text-white rounded-tr-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              Transcript non disponibile per questa chiamata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Card per ogni chiamata
const CallCard = ({ 
  call, 
  isSelected, 
  onToggle, 
  onViewTranscript 
}: { 
  call: Call; 
  isSelected: boolean; 
  onToggle: () => void;
  onViewTranscript: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const transcriptList = Array.isArray(call.transcript) 
    ? call.transcript 
    : typeof call.transcript === 'string' && call.transcript.startsWith('[')
      ? JSON.parse(call.transcript)
      : [];
  
  // Prendi le prime 2 righe del transcript come anteprima
  const previewMessages = transcriptList.slice(0, 3);

  return (
    <div 
      className={cn(
        "rounded-lg mb-2 border transition-all",
        isSelected 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "border-gray-200 hover:border-gray-300 bg-white"
      )}
    >
      {/* Header - sempre visibile */}
      <div 
        className="p-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900 truncate">
                {call.lead_nome || 'Lead sconosciuto'}
              </span>
              {isSelected && <Check size={16} className="text-primary shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span>{formatDate(call.created_at)}</span>
              <span>•</span>
              <span>{formatDuration(call.durata_chiamata || 0)}</span>
            </div>
          </div>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2",
            call.esito_qualificazione === 'qualified' ? "bg-emerald-50 text-emerald-700" :
            call.esito_qualificazione === 'not_qualified' ? "bg-red-50 text-red-700" :
            call.esito_qualificazione === 'non_adatto' ? "bg-red-50 text-red-700" :
            "bg-amber-50 text-amber-700"
          )}>
            {call.esito_qualificazione || 'N/A'}
          </span>
        </div>

        {/* Score e Issues */}
        <div className="flex items-center gap-2 mt-2">
          {call.score?.quality_score && (
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded",
              call.score.quality_score >= 8 ? "bg-emerald-100 text-emerald-700" :
              call.score.quality_score >= 6 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            )}>
              {call.score.quality_score}/10
            </span>
          )}
          {call.score?.identified_issues?.slice(0, 2).map((issue, i) => (
            <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded truncate max-w-[100px]">
              {issue}
            </span>
          ))}
        </div>
      </div>

      {/* Anteprima Transcript - espandibile */}
      {previewMessages.length > 0 && (
        <div className="border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-full px-3 py-2 flex items-center justify-between text-xs text-gray-500 hover:bg-gray-50"
          >
            <span>Anteprima conversazione</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {isExpanded && (
            <div className="px-3 pb-3 space-y-2">
              {previewMessages.map((msg: { role: string; content: string }, idx: number) => (
                <div key={idx} className="text-xs">
                  <span className={cn(
                    "font-semibold",
                    msg.role === 'agent' ? "text-primary" : "text-gray-600"
                  )}>
                    {msg.role === 'agent' ? 'Chiara: ' : 'Lead: '}
                  </span>
                  <span className="text-gray-600 line-clamp-2">{msg.content}</span>
                </div>
              ))}
              {transcriptList.length > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewTranscript();
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  <Eye size={12} />
                  Vedi conversazione completa
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const PromptOptimizer = () => {
  const { calls } = useCalls();
  const { activeVersion, refetch } = usePromptVersions();
  
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const [instruction, setInstruction] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proposedPrompt, setProposedPrompt] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [viewingCall, setViewingCall] = useState<Call | null>(null);

  const toggleCall = (id: string) => {
    setSelectedCalls(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async () => {
    if (!activeVersion) {
        alert("Nessuna versione attiva trovata su cui basare l'ottimizzazione.");
        return;
    }
    
    setIsAnalyzing(true);
    try {
        const result = await analyzeBatch(
            selectedCalls,
            instruction,
            activeVersion.prompt_text
        );
        setProposedPrompt(result.new_prompt);
        setExplanation(result.explanation);
    } catch (err) {
        console.error(err);
        alert("Errore durante l'analisi. Controlla la console.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleDeploy = async (mode: 'direct' | 'ab') => {
    if (!proposedPrompt || !activeVersion) return;
    
    if (!isSupabaseConfigured || !supabase) {
        alert(`Deploy simulato in modalità ${mode === 'direct' ? 'diretta' : 'A/B test'}.`);
        setProposedPrompt(null);
        return;
    }

    try {
        const { data: newVersion, error } = await supabase
            .from('prompt_versions')
            .insert({
                version_number: activeVersion.version_number + 1,
                prompt_text: proposedPrompt,
                change_reason: instruction,
                is_active: mode === 'direct'
            })
            .select()
            .single();
        
        if (error) throw error;

        if (mode === 'direct') {
             await supabase
                .from('prompt_versions')
                .update({ is_active: false })
                .neq('id', newVersion.id);

             await deployPrompt(newVersion.id, 'deploy');
        } else {
             await supabase.from('ab_tests').insert({
                test_name: `Test v${activeVersion.version_number} vs v${newVersion.version_number}`,
                prompt_a_id: activeVersion.id,
                prompt_b_id: newVersion.id,
                status: 'running',
                target_calls: 30
             });
        }

        alert(mode === 'direct' ? 'Deploy completato!' : 'A/B Test avviato!');
        setProposedPrompt(null);
        setExplanation(null);
        refetch();
    } catch (e) {
        console.error(e);
        alert('Errore durante il deploy');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      {/* Modal per transcript */}
      {viewingCall && (
        <TranscriptModal call={viewingCall} onClose={() => setViewingCall(null)} />
      )}

      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
           <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
             <Sparkles className="text-primary" /> Prompt Optimizer
           </h1>
           <p className="text-sm text-gray-500 mt-1">Migliora il prompt analizzando le chiamate reali con Claude.</p>
        </div>
        
        {proposedPrompt && (
          <div className="flex gap-3">
             <button onClick={() => setProposedPrompt(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Annulla
             </button>
             <button 
                onClick={() => handleDeploy('ab')}
                className="px-4 py-2 bg-white border border-primary text-primary rounded-md hover:bg-gray-50 shadow-sm"
             >
                Avvia A/B Test
             </button>
             <button 
                onClick={() => handleDeploy('direct')}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover shadow-sm"
             >
                Deploy Diretto
             </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Step 1: Select Context */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-gray-200 bg-gray-50">
             <div className="font-medium text-gray-700">1. Seleziona Chiamate di Riferimento</div>
             {selectedCalls.length > 0 && (
               <div className="text-xs text-primary mt-1">{selectedCalls.length} chiamate selezionate</div>
             )}
           </div>
           <div className="overflow-y-auto flex-1 p-2">
             {calls.length === 0 ? (
               <div className="text-center text-gray-400 py-8 text-sm">
                 Nessuna chiamata disponibile.
               </div>
             ) : (
               calls.map(call => (
                 <CallCard
                   key={call.id}
                   call={call}
                   isSelected={selectedCalls.includes(call.id)}
                   onToggle={() => toggleCall(call.id)}
                   onViewTranscript={() => setViewingCall(call)}
                 />
               ))
             )}
           </div>
        </div>

        {/* Step 2: Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
           <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-700">
             2. Istruzioni di Ottimizzazione
           </div>
           <div className="p-4 flex-1 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Quick Actions</label>
                <div className="flex flex-wrap gap-2">
                   {QUICK_ACTIONS.map((action) => (
                      <button 
                        key={action}
                        onClick={() => setInstruction(action)}
                        className={cn(
                          "text-xs px-3 py-1.5 border rounded-full transition-colors",
                          instruction === action 
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-gray-300 hover:border-primary hover:text-primary"
                        )}
                      >
                        {action}
                      </button>
                   ))}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Istruzioni Custom</label>
                 <textarea 
                    className="w-full flex-1 p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm resize-none"
                    placeholder="Es. 'Rendi l'agente meno insistente quando il cliente dice che deve pensarci...'"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                 />
              </div>

              <button 
                disabled={isAnalyzing || !instruction || selectedCalls.length === 0}
                onClick={handleAnalyze}
                className="w-full py-3 bg-gray-900 text-white rounded-md hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                 {isAnalyzing ? (
                   <>Generazione in corso...</>
                 ) : (
                   <>
                     <Wand2 size={18} /> Genera Versione Ottimizzata
                   </>
                 )}
              </button>
              {selectedCalls.length === 0 && (
                <p className="text-xs text-amber-600 text-center">Seleziona almeno una chiamata</p>
              )}
           </div>
        </div>

        {/* Step 3: Diff Viewer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-700 flex justify-between items-center">
             <span>3. Revisione Modifiche</span>
             {proposedPrompt && <GitCompare size={16} className="text-gray-500" />}
           </div>
           <div className="flex-1 overflow-y-auto p-0 text-xs font-mono relative">
              {!proposedPrompt ? (
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 p-6 text-center">
                    Seleziona chiamate e istruzioni per generare una proposta.
                 </div>
              ) : (
                 <div className="grid grid-cols-2 h-full divide-x divide-gray-200">
                    <div className="p-4 bg-red-50/30 overflow-y-auto">
                       <h4 className="font-bold text-gray-500 mb-2 sticky top-0 bg-red-50/90 py-1">ORIGINALE (v{activeVersion?.version_number})</h4>
                       <pre className="whitespace-pre-wrap text-gray-600">{activeVersion?.prompt_text}</pre>
                    </div>
                    <div className="p-4 bg-green-50/30 overflow-y-auto">
                       <h4 className="font-bold text-emerald-600 mb-2 sticky top-0 bg-green-50/90 py-1">PROPOSTA</h4>
                       <div className="mb-2 p-2 bg-green-100 text-green-800 rounded text-xs italic border border-green-200">
                            {explanation}
                       </div>
                       <pre className="whitespace-pre-wrap text-gray-800">{proposedPrompt}</pre>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
