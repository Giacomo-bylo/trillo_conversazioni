import { Call, PromptVersion } from '@/types';

export const MOCK_CALLS: Call[] = [
  {
    id: 'c1',
    retell_call_id: 'call_123abc',
    lead_nome: 'Mario Rossi',
    lead_telefono: '+39 333 1234567',
    esito_qualificazione: 'qualified',
    durata_chiamata: 420,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    flagged: false,
    transcript: [
      { role: 'agent', content: "Pronto? Parlo con il signor Mario Rossi?" },
      { role: 'user', content: "Sì, sono io. Chi parla?" },
      { role: 'agent', content: "Buongiorno, sono Chiara di Bilo. La chiamo riguardo l'immobile in via Roma. Ha un minuto?" },
      { role: 'user', content: "Sì, dica pure." },
      { role: 'agent', content: "Mi racconta la situazione dell'immobile? Ha bisogno di lavori?" },
      { role: 'user', content: "Beh, è un po' vecchio, gli impianti sono da rifare." },
      { role: 'agent', content: "Capisco. Ci sono altre problematiche da segnalare, come umidità o problemi strutturali?" },
      { role: 'user', content: "No, strutturalmente è a posto. Solo finiture e impianti." },
      { role: 'agent', content: "Perfetto. Per quanto riguarda i tempi, qualora trovassimo un accordo, avrebbe flessibilità o preferisce concludere rapidamente?" },
      { role: 'user', content: "Non ho fretta, l'importante è realizzare il giusto." },
      { role: 'agent', content: "Perfetto, la sua situazione è proprio quella in cui lavoriamo meglio. Fissiamo una breve chiamata con un nostro consulente. Preferisce domani mattina alle 10:00 o dopodomani alle 15:00?" },
      { role: 'user', content: "Domani mattina va bene." },
    ],
    score: {
      id: 's1',
      call_id: 'c1',
      quality_score: 9,
      completeness_score: 0.9,
      naturalness_score: 0.85,
      objection_handling_score: 0.9,
      duration_score: 1.0,
      sentiment: 'positive',
      identified_issues: [],
      analysis_status: 'completed',
    },
  },
  {
    id: 'c2',
    retell_call_id: 'call_456def',
    lead_nome: 'Giulia Bianchi',
    lead_telefono: '+39 333 9876543',
    esito_qualificazione: 'not_qualified',
    durata_chiamata: 120,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    flagged: true,
    transcript: [
      { role: 'agent', content: "Buongiorno, parlo con Giulia Bianchi?" },
      { role: 'user', content: "Sì, ma non ho tempo ora." },
      { role: 'agent', content: "Sarò brevissima, chiamo per l'immobile. Volevo sapere se..." },
      { role: 'user', content: "Vi ho già detto che voglio 200mila euro, punto." },
      { role: 'agent', content: "Ok, arrivederci." }
    ],
    score: {
      id: 's2',
      call_id: 'c2',
      quality_score: 4,
      completeness_score: 0.4,
      naturalness_score: 0.6,
      objection_handling_score: 0.2,
      duration_score: 0.3,
      sentiment: 'negative',
      identified_issues: ['Interruzione brusca', 'Mancata gestione obiezione prezzo'],
      analysis_status: 'completed',
    },
  },
  {
    id: 'c3',
    retell_call_id: 'call_789ghi',
    lead_nome: 'Luca Verdi',
    lead_telefono: '+39 333 1122334',
    esito_qualificazione: 'callback',
    durata_chiamata: 240,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    flagged: false,
    transcript: [],
    score: {
      id: 's3',
      call_id: 'c3',
      quality_score: 6,
      completeness_score: 0.7,
      naturalness_score: 0.8,
      objection_handling_score: 0.5,
      duration_score: 0.8,
      sentiment: 'neutral',
      identified_issues: ['Cliente indeciso', 'Agente troppo incalzante'],
      analysis_status: 'completed',
    },
  },
  {
    id: 'c4',
    retell_call_id: 'call_101jkl',
    lead_nome: 'Anna Neri',
    lead_telefono: '+39 333 5566778',
    esito_qualificazione: 'qualified',
    durata_chiamata: 380,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    flagged: false,
    transcript: [],
    score: {
      id: 's4',
      call_id: 'c4',
      quality_score: 8,
      completeness_score: 1,
      naturalness_score: 0.9,
      objection_handling_score: 0.8,
      duration_score: 1.0,
      sentiment: 'positive',
      identified_issues: [],
      analysis_status: 'completed',
    },
  }
];

export const MOCK_VERSIONS: PromptVersion[] = [
  {
    id: 'v1',
    version_number: 1,
    prompt_text: `# Personality
Sei Chiara, assistente vocale di Bilo. Italiana, tono caldo e professionale.
Dai sempre del Lei. Frasi brevi e naturali.

# Goal
Capire due cose:
1. L'immobile ha problematiche? (da ristrutturare, questioni da sistemare, ecc.)
2. Il cliente ha fretta di incassare o può aspettare?

Se l'immobile ha problematiche e il cliente non ha fretta di incassare → fissa appuntamento.
Se l'immobile è in ottime condizioni o il cliente ha fretta di incassare → chiudi con garbo.

# Conversation Flow

## Qualificazione
Chiedi una domanda alla volta, aspetta la risposta, poi passa alla successiva:
1. "Mi racconta la situazione dell'immobile? Ha bisogno di lavori?"
2. "Ci sono altre problematiche da segnalare?"
3. "Per quanto riguarda i tempi, qualora trovassimo un accordo, avrebbe flessibilità sui tempi di pagamento o preferisce concludere rapidamente?"

Mai fare due domande nella stessa frase. Aspetta sempre la risposta prima di procedere.
Mai suggerire esempi specifici di problematiche. Lascia che sia il cliente a specificare.

## Se adatto
"Perfetto, la sua situazione è proprio quella in cui lavoriamo meglio. Fissiamo una breve chiamata con un nostro consulente. Preferisce mattina o pomeriggio?"

## Se non adatto
"Grazie mille per la chiarezza. Al momento il nostro servizio non è la soluzione più adatta alla sua situazione. Se qualcosa cambia, ci ricontatti su bilo.it. Le auguro buona giornata."

# Guardrails
- Mai parlare di prezzi o tempistiche precise
- Mai fissare appuntamento se il cliente ha fretta di incassare
- Mai suggerire esempi specifici nelle domande
- Se il cliente è irritato: "Preferisce essere richiamato con più calma?"`,
    change_reason: 'Initial Deployment',
    created_at: '2024-10-01T10:00:00Z',
    is_active: true,
    status: 'active',
    performance_metrics: { avg_score: 7.2, conversion_rate: 18.5 }
  },
  {
    id: 'v0',
    version_number: 0,
    prompt_text: `Sei un assistente immobiliare. Chiedi se vogliono vendere.`,
    change_reason: 'Alpha Test',
    created_at: '2024-09-20T10:00:00Z',
    is_active: false,
    status: 'archived',
    performance_metrics: { avg_score: 4.5, conversion_rate: 5.2 }
  }
];
