import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ABTest } from '@/types';

export function useABTests() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
        setTests([]);
        setLoading(false);
        return;
    }

    const { data } = await supabase
      .from('ab_tests')
      .select('*')
      .order('started_at', { ascending: false });

    setTests(data || []);
    setLoading(false);
  }

  async function createTest(promptAId: string, promptBId: string, name: string) {
    if (!isSupabaseConfigured || !supabase) return { data: null, error: 'No backend' };

    const { data, error } = await supabase
      .from('ab_tests')
      .insert({
        test_name: name,
        prompt_a_id: promptAId,
        prompt_b_id: promptBId,
        target_calls: 30,
        status: 'running'
      })
      .select()
      .single();

    if (!error) fetchTests();
    return { data, error };
  }

  async function completeTest(testId: string, winnerId: string) {
    if (!isSupabaseConfigured || !supabase) return;

    await supabase
      .from('ab_tests')
      .update({ 
        status: 'completed', 
        winner_prompt_id: winnerId,
        completed_at: new Date().toISOString()
      })
      .eq('id', testId);

    fetchTests();
  }

  return { tests, loading, createTest, completeTest, refetch: fetchTests };
}
