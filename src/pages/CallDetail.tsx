import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Download, ThumbsUp, ThumbsDown, AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import { useCall } from '@/hooks/useCalls';
import { cn, formatDuration, formatDate } from '@/lib/utils';
import { CallOutcome } from '@/types';

export const CallDetail = () => {
  const { id } = useParams();
  const { call, loading } = useCall(id);

  if (loading) return <div className="p-10 text-center">Caricamento chiamata...</div>;
  if (!call) return <div className="p-10 text-center">Chiamata non trovata</div>;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600";
    if (score >= 6) return "text-amber-600";
    return "text-red-600";
  };

  const transcriptList = Array.isArray(call.transcript) 
      ? call.transcript 
      : typeof call.transcript === 'string' && call.transcript.startsWith('[')
        ? JSON.parse(call.transcript)
        : [];

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col md:overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{call.lead_nome}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{formatDate(call.created_at)}</span>
              <span>•</span>
              <span>{call.lead_telefono}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            call.esito_qualificazione === CallOutcome.QUALIFIED ? "bg-emerald-50 text-emerald-700" :
            call.esito_qualificazione === CallOutcome.NOT_QUALIFIED ? "bg-red-50 text-red-700" :
            "bg-amber-50 text-amber-700"
          )}>
            {call.esito_qualificazione === CallOutcome.QUALIFIED ? "Qualificato" : 
             call.esito_qualificazione === CallOutcome.NOT_QUALIFIED ? "Non Qualificato" : "Da richiamare"}
          </span>
          <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-300 rounded-md">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Transcript & Player */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 bg-white">
          {/* Audio Player Mock */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
             <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover shrink-0">
                   <Play size={20} fill="currentColor" />
                </button>
                <div className="flex-1">
                   <div className="h-8 flex items-center gap-1">
                      {[...Array(40)].map((_, i) => (
                         <div key={i} 
                            className={cn("w-1 rounded-full", i < 15 ? "bg-primary" : "bg-gray-200")} 
                            style={{ height: `${Math.random() * 24 + 4}px` }} 
                         />
                      ))}
                   </div>
                </div>
                <div className="text-xs font-mono text-gray-500 shrink-0">
                   01:15 / {formatDuration(call.durata_chiamata)}
                </div>
             </div>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {transcriptList.length > 0 ? (
                transcriptList.map((msg: { role: string; content: string }, idx: number) => (
                <div key={idx} className={cn("flex gap-4 max-w-3xl", msg.role === 'agent' ? "flex-row" : "flex-row-reverse self-end ml-auto")}>
                    <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                    msg.role === 'agent' ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-600"
                    )}>
                    {msg.role === 'agent' ? 'AI' : 'U'}
                    </div>
                    <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'agent' 
                        ? "bg-gray-50 text-gray-900 rounded-tl-none border border-gray-100" 
                        : "bg-primary text-white rounded-tr-none shadow-sm"
                    )}>
                    {msg.content}
                    </div>
                </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Trascrizione non disponibile per questa chiamata.</p>
                </div>
            )}
          </div>
        </div>

        {/* Right: Analysis & Scoring */}
        <div className="w-full md:w-96 overflow-y-auto bg-gray-50 p-6 space-y-6 shrink-0">
            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Quality Score</h3>
                <div className={cn("text-5xl font-bold mb-2", getScoreColor(call.score?.quality_score || 0))}>
                    {call.score?.quality_score || '-'}
                </div>
                {call.score && (
                  <div className="flex justify-center gap-4 text-sm mt-4">
                      <div className={cn("flex items-center gap-1 px-2 py-1 rounded", call.score.sentiment === 'positive' ? "text-emerald-600 bg-emerald-50" : "text-gray-600 bg-gray-50")}>
                          {call.score.sentiment === 'positive' ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />} 
                          {call.score.sentiment === 'positive' ? "Positivo" : "Neutro/Neg"}
                      </div>
                  </div>
                )}
            </div>

            {/* Sub-Scores */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Dettaglio Punteggi</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Completezza Info', val: call.score?.completeness_score },
                        { label: 'Naturalezza', val: call.score?.naturalness_score },
                        { label: 'Gestione Obiezioni', val: call.score?.objection_handling_score },
                    ].map((item, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{item.label}</span>
                                <span className="font-medium">{Math.round((item.val || 0) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary rounded-full" 
                                    style={{ width: `${(item.val || 0) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Issues Identified */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Problemi Rilevati</h3>
                </div>
                <ul className="space-y-2">
                    {call.score?.identified_issues && call.score.identified_issues.length > 0 ? (
                        call.score.identified_issues.map((issue, i) => (
                            <li key={i} className="text-sm text-gray-700 bg-amber-50 border border-amber-100 p-2 rounded-md flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                {issue}
                            </li>
                        ))
                    ) : (
                        <li className="text-sm text-gray-500 italic">Nessun problema critico rilevato.</li>
                    )}
                </ul>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                        <Clock size={14} /> Durata
                    </span>
                    <span className="font-medium text-gray-900">{formatDuration(call.durata_chiamata)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Modello Claude</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {call.score?.claude_model || 'N/A'}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
