export enum CallOutcome {
  QUALIFIED = 'qualificato',
  CALLBACK = 'callback_richiesto',
  NOT_QUALIFIED = 'non_qualificato',
  NO_ANSWER = 'non_risponde',
  REFUSED = 'rifiuta_parlare',
}

export interface CallScore {
  id: string;
  call_id: string;
  quality_score: number;
  completeness_score: number;
  naturalness_score: number;
  objection_handling_score: number;
  duration_score: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  identified_issues: string[];
  analysis_status: 'completed' | 'pending' | 'failed' | 'pending_retry';
  claude_model?: string;
}

export interface Call {
  id: string;
  tenant_id?: string;
  retell_call_id: string;
  lead_nome: string;
  lead_telefono: string;
  transcript: string | Array<{ role: 'agent' | 'user'; content: string }>;
  esito_qualificazione: string;
  durata_chiamata: number;
  created_at: string;
  flagged?: boolean;
  // Nuovi campi Post-Call Analysis
  riepilogo_chiamata?: string;
  chiamata_completata?: boolean;
  stato_immobile?: string;
  problematiche_immobile?: string;
  urgenza_cliente?: 'alta' | 'media' | 'bassa';
  appuntamento_fissato?: boolean;
  callback_orario?: string;
  callback_motivo?: string;
  sentiment_cliente?: 'positivo' | 'neutro' | 'negativo' | 'ostile';
  obiezioni_cliente?: string;
  note_aggiuntive?: string;
  // Score (relazione)
  score?: CallScore;
}

export interface PromptVersion {
  id: string;
  version_number: number;
  prompt_text: string;
  change_reason: string;
  created_at: string;
  performance_metrics?: {
    avg_score: number;
    conversion_rate: number;
  };
  is_active: boolean;
  status?: 'active' | 'testing' | 'archived';
}

export interface DashboardMetrics {
  totalCalls: number;
  conversionRate: number;
  avgDuration: number;
  avgQualityScore: number;
  conversionTrend: number;
  scoreTrend: number;
}