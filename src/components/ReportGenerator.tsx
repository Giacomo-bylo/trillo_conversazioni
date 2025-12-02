import { useState } from 'react';
import { FileText, X, Copy, Check } from 'lucide-react';
import { Call } from '@/types';

interface ReportGeneratorProps {
  calls: Call[];
  isOpen: boolean;
  onClose: () => void;
}

export const ReportGenerator = ({ calls, isOpen, onClose }: ReportGeneratorProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const [includeTranscript, setIncludeTranscript] = useState(true);

  if (!isOpen) return null;

  const toggleCall = (id: string) => {
    setSelectedCalls(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedCalls.length === calls.length) {
      setSelectedCalls([]);
    } else {
      setSelectedCalls(calls.map(c => c.id));
    }
  };

  const generateReport = () => {
    const selected = calls.filter(c => selectedCalls.includes(c.id));
    
    const totalCalls = selected.length;
    const qualified = selected.filter(c => c.esito_qualificazione === 'qualificato').length;
    const notQualified = selected.filter(c => c.esito_qualificazione === 'non_qualificato').length;
    const callback = selected.filter(c => c.esito_qualificazione === 'callback_richiesto').length;
    
    let report = `# Report Chiamate Chiara
Generato il: ${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}

## Metriche Aggregate
- **Chiamate analizzate:** ${totalCalls}
- **Qualificati:** ${qualified} (${totalCalls ? Math.round((qualified/totalCalls)*100) : 0}%)
- **Non qualificati:** ${notQualified} (${totalCalls ? Math.round((notQualified/totalCalls)*100) : 0}%)
- **Callback richiesti:** ${callback} (${totalCalls ? Math.round((callback/totalCalls)*100) : 0}%)

---

## Chiamate Selezionate

`;

    selected.forEach((call, index) => {
      report += `### Chiamata ${index + 1}: ${call.lead_nome || 'Lead sconosciuto'}
- **Data:** ${new Date(call.created_at).toLocaleDateString('it-IT')}
- **Durata:** ${Math.floor((call.durata_chiamata || 0) / 60)}m ${(call.durata_chiamata || 0) % 60}s
- **Esito:** ${call.esito_qualificazione || 'N/A'}
- **Urgenza cliente:** ${call.urgenza_cliente || 'N/A'}
- **Sentiment:** ${call.sentiment_cliente || 'N/A'}
`;

      if (call.riepilogo_chiamata) {
        report += `- **Riepilogo:** ${call.riepilogo_chiamata}\n`;
      }
      if (call.stato_immobile) {
        report += `- **Stato immobile:** ${call.stato_immobile}\n`;
      }
      if (call.problematiche_immobile) {
        report += `- **Problematiche:** ${call.problematiche_immobile}\n`;
      }
      if (call.obiezioni_cliente) {
        report += `- **Obiezioni:** ${call.obiezioni_cliente}\n`;
      }
      if (call.callback_orario) {
        report += `- **Callback richiesto:** ${call.callback_orario} (${call.callback_motivo || 'motivo non specificato'})\n`;
      }
      if (call.note_aggiuntive) {
        report += `- **Note:** ${call.note_aggiuntive}\n`;
      }

      if (includeTranscript && call.transcript) {
        const transcriptList = Array.isArray(call.transcript) 
          ? call.transcript 
          : typeof call.transcript === 'string' && call.transcript.startsWith('[')
            ? JSON.parse(call.transcript)
            : [];
        
        if (transcriptList.length > 0) {
          report += `\n**Transcript:**\n\`\`\`\n`;
          transcriptList.forEach((msg: { role: string; content: string }) => {
            report += `[${msg.role === 'agent' ? 'Chiara' : 'Cliente'}]: ${msg.content}\n`;
          });
          report += `\`\`\`\n`;
        }
      }

      report += `\n---\n\n`;
    });

    report += `## Prompt Attuale di Chiara

\`\`\`
# Personality
Sei Chiara, assistente virtuale di Bilo. Italiana, tono caldo e professionale.
Dai sempre del Lei. Frasi brevi e naturali.

# Goal
Raccogliere due informazioni per completare la valutazione:
1. L'immobile ha problematiche? (lavori da fare, questioni legali, situazioni particolari)
2. Il cliente ha fretta di andare al rogito o può aspettare qualche mese?

Se il cliente può aspettare per il rogito → fissa appuntamento con consulente.
Se il cliente ha urgenza inequivocabile → chiudi con cortesia.

# Conversation Flow

## Dopo il messaggio di benvenuto
Se il cliente risponde sì o acconsente, procedi con la domanda sull'immobile.

Se risponde no o è occupato:
"Nessun problema. A che ora preferisce che la richiami?"
Conferma l'orario e chiudi con cortesia.

## Domanda 1 — Immobile (UNA SOLA DOMANDA)
"C'è qualcosa che devo sapere sull'immobile? Problemi, lavori da fare, situazioni particolari?"

Questa è l'unica domanda sull'immobile. Qualunque cosa risponda il cliente, accetta la risposta e passa alla domanda successiva. Non fare domande di approfondimento, non chiedere "c'è altro?", non chiedere dettagli.

## Domanda 2 — Tempi
"Come dicevo, siamo quasi pronti con la valutazione del suo immobile. Il preliminare lo firmiamo in tempi rapidi — e lì riceve già un anticipo — mentre il rogito, cioè il saldo finale, arriva qualche mese dopo. Per lei il rogito può essere tra qualche mese, o ha bisogno di tempi più brevi?"

## Dopo la risposta sui tempi

### Se il cliente PUÒ aspettare (qualificato)
Frasi che indicano che può aspettare:
- "Sì, posso aspettare"
- "Qualche mese va bene"
- "Non c'è problema"
- "Ok"
- "Appena possibile" / "Prima è meglio è" / "Il prima possibile" / "Preferirei presto" — queste NON sono urgenza, il cliente è qualificato

Rispondi:
"Perfetto. La faccio ricontattare da un nostro consulente per approfondire insieme la sua situazione. Buona giornata!"

### Se il cliente ha urgenza inequivocabile (non qualificato)
Solo frasi che esprimono urgenza chiara e non negoziabile:
- "Ho bisogno dei soldi entro un mese"
- "Devo pagare un debito urgente"
- "Non posso assolutamente aspettare"
- "È una questione di emergenza"
- "Devo vendere subito, non ho alternative"

Rispondi:
"Perfetto, grazie mille per le informazioni. Riceverà a breve la valutazione del suo immobile. Buona giornata!"

### Nel dubbio → il cliente è qualificato
Se la risposta è ambigua o non sei sicura, considera il cliente qualificato e proponi l'appuntamento.

## Se il cliente chiede di essere richiamato
"Certamente. A che ora preferisce che la richiami?"
Conferma l'orario: "Perfetto, la richiamerò [orario]. Buona giornata!"

# Guardrails
- Mai parlare di prezzi o tempistiche precise
- Mai dire che il caso non è adatto a Bilo
- Mai suggerire esempi specifici nelle domande
- Mai fare due domande nella stessa frase
- Mai chiedere approfondimenti sulla domanda dell'immobile — una domanda, una risposta, si va avanti
- Aspetta sempre la risposta prima di procedere
- Se il cliente è irritato o occupato, proponi di richiamare
- Nel dubbio sulla qualificazione, il cliente è sempre qualificato
\`\`\`

---

## Domande per Claude

Analizza queste chiamate e rispondi:
1. Dove Chiara sbaglia o potrebbe migliorare?
2. Ci sono pattern ricorrenti nei problemi?
3. Come posso modificare il prompt per migliorare?
`;

    return report;
  };

  const handleCopy = async () => {
    const report = generateReport();
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Genera Report per Claude</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Seleziona le chiamate da includere nel report. Il report generato può essere copiato e incollato direttamente in Claude per analisi.
          </p>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={includeTranscript}
                onChange={(e) => setIncludeTranscript(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Includi transcript
            </label>
            <button 
              onClick={selectAll}
              className="text-sm text-primary hover:text-primary-hover"
            >
              {selectedCalls.length === calls.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
            </button>
          </div>

          {/* Call List */}
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {calls.map(call => (
              <label 
                key={call.id} 
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
              >
                <input 
                  type="checkbox"
                  checked={selectedCalls.includes(call.id)}
                  onChange={() => toggleCall(call.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {call.lead_nome || 'Lead sconosciuto'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(call.created_at).toLocaleDateString('it-IT')} — {call.esito_qualificazione}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="text-sm text-gray-500">
            {selectedCalls.length} chiamate selezionate
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annulla
          </button>
          <button 
            onClick={handleCopy}
            disabled={selectedCalls.length === 0}
            className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check size={16} /> Copiato!
              </>
            ) : (
              <>
                <Copy size={16} /> Copia Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};