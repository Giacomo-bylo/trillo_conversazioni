# Trillo - AI Agent Analytics

Dashboard per analizzare le chiamate dell'agente vocale Retell, ottimizzare i prompt con Claude, e gestire A/B test.

## Stack Tecnologico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Automazione**: n8n webhooks
- **AI**: Claude API per scoring automatico
- **Hosting**: Vercel

## Quick Start

### 1. Clone e Installazione

```bash
git clone https://github.com/TUREPO/trillo-conversazioni.git
cd trillo-conversazioni
npm install
```

### 2. Configurazione Environment

Copia `.env.example` in `.env`:

```bash
cp .env.example .env
```

Configura le variabili:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook
```

### 3. Avvio Development

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

## Modalità Demo

Senza configurare Supabase, l'app funziona con dati mock per testare l'interfaccia.

---

## Setup Supabase (Produzione)

### 1. Crea Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) → New Project
2. Nome: `trillo-conversazioni`
3. Region: `eu-central-1` (Frankfurt)
4. Copia Project URL e anon key

### 2. Database Schema

Esegui questo SQL nel SQL Editor di Supabase:

```sql
-- Tenants (per multi-tenancy futuro)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  retell_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chiamate
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  retell_call_id TEXT UNIQUE NOT NULL,
  lead_nome TEXT,
  lead_telefono TEXT,
  transcript JSONB,
  esito_qualificazione TEXT,
  durata_chiamata INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  flagged BOOLEAN DEFAULT FALSE
);

-- Scoring chiamate
CREATE TABLE call_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  quality_score NUMERIC(3,1),
  completeness_score NUMERIC(3,2),
  naturalness_score NUMERIC(3,2),
  objection_handling_score NUMERIC(3,2),
  duration_score NUMERIC(3,2),
  sentiment TEXT,
  identified_issues TEXT[],
  analysis_status TEXT DEFAULT 'pending',
  claude_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Versioni prompt
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  version_number INTEGER NOT NULL,
  prompt_text TEXT NOT NULL,
  change_reason TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'archived',
  performance_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Tests
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  test_name TEXT NOT NULL,
  prompt_a_id UUID REFERENCES prompt_versions(id),
  prompt_b_id UUID REFERENCES prompt_versions(id),
  target_calls INTEGER DEFAULT 30,
  calls_a INTEGER DEFAULT 0,
  calls_b INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  winner_prompt_id UUID REFERENCES prompt_versions(id),
  metrics_comparison JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indici per performance
CREATE INDEX idx_calls_tenant ON calls(tenant_id);
CREATE INDEX idx_calls_created ON calls(created_at DESC);
CREATE INDEX idx_call_scores_call ON call_scores(call_id);
CREATE INDEX idx_prompt_versions_active ON prompt_versions(is_active) WHERE is_active = TRUE;
```

### 3. Row Level Security (RLS)

Per ora disabilitiamo RLS per development:

```sql
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests DISABLE ROW LEVEL SECURITY;
```

---

## Deploy su Vercel

### 1. Push su GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUREPO/trillo-conversazioni.git
git push -u origin main
```

### 2. Collega a Vercel

1. Vai su [vercel.com](https://vercel.com) → New Project
2. Import da GitHub
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`

### 3. Environment Variables

In Vercel Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
VITE_N8N_WEBHOOK_BASE_URL=https://xxx.n8n.cloud/webhook
```

### 4. Custom Domain

In Vercel Settings → Domains:
- Aggiungi `conversazioni.bylo.it`
- Configura DNS su Webflow:
  - Tipo: CNAME
  - Nome: conversazioni
  - Valore: cname.vercel-dns.com

---

## n8n Webhooks

Configura questi webhook in n8n:

### POST /analyze-batch

Riceve chiamate da analizzare e genera nuovo prompt.

**Request:**
```json
{
  "call_ids": ["uuid1", "uuid2"],
  "instructions": "Rendi l'agente più empatico",
  "current_prompt": "..."
}
```

**Response:**
```json
{
  "new_prompt": "...",
  "explanation": "Ho modificato...",
  "diff": []
}
```

### POST /deploy

Aggiorna il prompt su Retell.

**Request:**
```json
{
  "prompt_version_id": "uuid",
  "action": "deploy" | "rollback"
}
```

---

## Struttura Progetto

```
src/
├── components/
│   └── Layout.tsx          # Sidebar + Layout principale
├── pages/
│   ├── Dashboard.tsx       # Metriche + tabella chiamate
│   ├── CallDetail.tsx      # Transcript + scoring dettagliato
│   ├── PromptOptimizer.tsx # Analisi + generazione prompt
│   ├── ABTesting.tsx       # Gestione A/B test
│   └── PromptHistory.tsx   # Cronologia versioni
├── hooks/
│   ├── useCalls.ts         # Fetch chiamate
│   ├── usePromptVersions.ts # Fetch versioni prompt
│   └── useABTests.ts       # Fetch A/B tests
├── lib/
│   ├── supabase.ts         # Client Supabase
│   ├── n8n.ts              # Webhook helpers
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript types
├── constants.ts            # Mock data
├── App.tsx
└── main.tsx
```

## Funzionalità

1. **Dashboard Chiamate**: Metriche real-time, grafico trend, tabella chiamate filtrabili
2. **Dettaglio Chiamata**: Transcript, scoring dettagliato, problemi identificati
3. **Prompt Optimizer**: Selezione chiamate, quick actions, diff viewer, deploy diretto/A/B test
4. **A/B Testing**: Progress tracking, metriche comparative, determinazione vincitore
5. **Storico Versioni**: Dettaglio versioni, metriche performance, rollback

## License

MIT
