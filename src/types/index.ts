export enum CallOutcome {
  QUALIFIED = 'qualified',
  CALLBACK = 'callback',
  NOT_QUALIFIED = 'not_qualified',
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
  score?: CallScore;
  flagged?: boolean;
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

export interface ABTest {
  id: string;
  test_name: string;
  prompt_a_id: string;
  prompt_b_id: string;
  target_calls: number;
  calls_a: number;
  calls_b: number;
  status: 'running' | 'completed' | 'cancelled';
  winner_prompt_id?: string;
  metrics_comparison?: {
    score_a: number;
    score_b: number;
    conversion_a: number;
    conversion_b: number;
  };
  started_at: string;
  completed_at?: string;
}

export interface DashboardMetrics {
  totalCalls: number;
  conversionRate: number;
  avgDuration: number;
  avgQualityScore: number;
  conversionTrend: number;
  scoreTrend: number;
}
