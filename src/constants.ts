import { Call, PromptVersion, CallOutcome } from '@/types';

export const MOCK_CALLS: Call[] = [
  {
    id: 'c1',
    retell_call_id: 'call_123abc',
    lead_nome: 'Mario Rossi',
    lead_telefono: '+39 333 1234567',
    esito_qualificazione: CallOutcome.QUALIFIED,
    durata_chiamata: 180,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    flagged: false,
    riepilogo_chiamata: 'Il cliente ha un immobile da ristrutturare e non ha fretta di vendere. Fissato appuntamento.',
    stato_immobile: 'Da ristrutturare, impianti vecchi',
    problematiche_immobile: 'Impianti da rifare, finiture datate',
    urgenza_cliente: 'bassa',
    sentiment_cliente: 'positivo',
    appuntamento_fissato: true,
    transcript: [
      { role: 'agent', content: "Buongiorno, sono Chiara, l'assistente virtuale di Bilo. Stiamo preparando la valutazione del suo immobile e avrei bisogno di un paio di informazioni. Ha un minuto?" },
      { role: 'user', content: "Sì, dica pure." },
      { role: 'agent', content: "C'è qualcosa che devo sapere sull'immobile? Problemi, lavori da fare, situazioni particolari?" },
      { role: 'user', content: "Beh, è un po' vecchio, gli impianti sono da rifare." },
      { role: 'agent', content: "Come dicevo, siamo quasi pronti con la valutazione del suo immobile. Il preliminare lo firmiamo in tempi rapidi — e lì riceve già un anticipo — mentre il rogito, cioè il saldo finale, arriva qualche mese dopo. Per lei il rogito può essere tra qualche mese, o ha bisogno di tempi più brevi?" },
      { role: 'user', content: "No, non ho fretta. Qualche mese va bene." },
      { role: 'agent', content: "Perfetto. La faccio ricontattare da un nostro consulente per approfondire insieme la sua situazione. Buona giornata!" },
    ],
  },
  {
    id: 'c2',
    retell_call_id: 'call_456def',
    lead_nome: 'Giulia Bianchi',
    lead_telefono: '+39 333 9876543',
    esito_qualificazione: CallOutcome.NOT_QUALIFIED,
    durata_chiamata: 90,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    flagged: false,
    riepilogo_chiamata: 'Il cliente ha urgenza di vendere per pagare un debito. Non qualificato.',
    stato_immobile: 'Buone condizioni',
    urgenza_cliente: 'alta',
    sentiment_cliente: 'neutro',
    appuntamento_fissato: false,
    obiezioni_cliente: 'Ha bisogno dei soldi entro un mese',
    transcript: [
      { role: 'agent', content: "Buongiorno, sono Chiara, l'assistente virtuale di Bilo. Stiamo preparando la valutazione del suo immobile e avrei bisogno di un paio di informazioni. Ha un minuto?" },
      { role: 'user', content: "Sì, velocemente." },
      { role: 'agent', content: "C'è qualcosa che devo sapere sull'immobile? Problemi, lavori da fare, situazioni particolari?" },
      { role: 'user', content: "No, l'appartamento è in buone condizioni." },
      { role: 'agent', content: "Come dicevo, siamo quasi pronti con la valutazione del suo immobile. Il preliminare lo firmiamo in tempi rapidi — e lì riceve già un anticipo — mentre il rogito, cioè il saldo finale, arriva qualche mese dopo. Per lei il rogito può essere tra qualche mese, o ha bisogno di tempi più brevi?" },
      { role: 'user', content: "No, ho bisogno dei soldi entro un mese. Devo pagare un debito." },
      { role: 'agent', content: "Perfetto, grazie mille per le informazioni. Riceverà a breve la valutazione del suo immobile. Buona giornata!" },
    ],
  },
  {
    id: 'c3',
    retell_call_id: 'call_789ghi',
    lead_nome: 'Luca Verdi',
    lead_telefono: '+39 333 1122334',
    esito_qualificazione: CallOutcome.CALLBACK,
    durata_chiamata: 45,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    flagged: false,
    riepilogo_chiamata: 'Il cliente era occupato, ha chiesto di essere richiamato dopo le 18.',
    callback_orario: 'dopo le 18',
    callback_motivo: 'occupato al lavoro',
    sentiment_cliente: 'neutro',
    transcript: [
      { role: 'agent', content: "Buongiorno, sono Chiara, l'assistente virtuale di Bilo. Stiamo preparando la valutazione del suo immobile e avrei bisogno di un paio di informazioni. Ha un minuto?" },
      { role: 'user', content: "No guardi, sono al lavoro adesso. Mi può richiamare dopo?" },
      { role: 'agent', content: "Certamente. A che ora preferisce che la richiami?" },
      { role: 'user', content: "Dopo le 18 va bene." },
      { role: 'agent', content: "Perfetto, la richiamerò dopo le 18. Buona giornata!" },
    ],
  },
  {
    id: 'c4',
    retell_call_id: 'call_101jkl',
    lead_nome: 'Anna Neri',
    lead_telefono: '+39 333 5566778',
    esito_qualificazione: CallOutcome.QUALIFIED,
    durata_chiamata: 150,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    flagged: false,
    riepilogo_chiamata: 'Immobile con successione in corso. Cliente disponibile ad aspettare. Qualificato.',
    stato_immobile: 'Abitabile ma datato',
    problematiche_immobile: 'Successione in corso, alcuni documenti da sistemare',
    urgenza_cliente: 'bassa',
    sentiment_cliente: 'positivo',
    appuntamento_fissato: true,
    transcript: [],
  }
];

export const MOCK_VERSIONS: PromptVersion[] = [
  {
    id: 'v1',
    version_number: 2,
    prompt_text: `# Personality
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

Questa è l'unica domanda sull'immobile. Qualunque cosa risponda il cliente, accetta la risposta e passa alla domanda successiva.

## Domanda 2 — Tempi
"Come dicevo, siamo quasi pronti con la valutazione del suo immobile. Il preliminare lo firmiamo in tempi rapidi — e lì riceve già un anticipo — mentre il rogito, cioè il saldo finale, arriva qualche mese dopo. Per lei il rogito può essere tra qualche mese, o ha bisogno di tempi più brevi?"

## Chiusura
Se qualificato: "Perfetto. La faccio ricontattare da un nostro consulente per approfondire insieme la sua situazione. Buona giornata!"
Se non qualificato: "Perfetto, grazie mille per le informazioni. Riceverà a breve la valutazione del suo immobile. Buona giornata!"`,
    change_reason: 'Flusso semplificato con 2 domande',
    created_at: new Date().toISOString(),
    is_active: true,
    status: 'active',
    performance_metrics: { avg_score: 8.2, conversion_rate: 45 }
  },
  {
    id: 'v0',
    version_number: 1,
    prompt_text: `# Personality
Sei Chiara, assistente vocale di Bilo...`,
    change_reason: 'Versione iniziale',
    created_at: '2024-10-01T10:00:00Z',
    is_active: false,
    status: 'archived',
    performance_metrics: { avg_score: 6.5, conversion_rate: 18 }
  }
];