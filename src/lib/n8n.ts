const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || '';

export async function analyzeBatch(callIds: string[], instructions: string, currentPrompt: string) {
  // Mock response if no URL configured
  if (!N8N_BASE_URL) {
    console.warn('VITE_N8N_WEBHOOK_BASE_URL not set. Returning mock analysis.');
    return new Promise(resolve => setTimeout(() => resolve({
      new_prompt: `# Personality\nSei Chiara, assistente vocale di Bilo...\n\n# Goal\n[OTTIMIZZATO] ${instructions}...\n`,
      explanation: "Ho modificato il tono per essere più empatico e aggiunto guardrails per gestire meglio le obiezioni.",
      diff: []
    }), 1500));
  }

  const response = await fetch(`${N8N_BASE_URL}/analyze-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      call_ids: callIds,
      instructions,
      current_prompt: currentPrompt
    })
  });

  if (!response.ok) throw new Error('Errore analisi');
  return response.json();
}

export async function deployPrompt(versionId: string, action: 'deploy' | 'rollback') {
  if (!N8N_BASE_URL) {
    console.warn('VITE_N8N_WEBHOOK_BASE_URL not set. Mocking deploy.');
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  }

  const response = await fetch(`${N8N_BASE_URL}/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt_version_id: versionId,
      action
    })
  });

  if (!response.ok) throw new Error('Errore deploy');
  return response.json();
}
