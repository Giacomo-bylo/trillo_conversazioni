import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Call } from '@/types';
import { MOCK_CALLS } from '@/constants';

export function useCalls(filters?: {
  outcome?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: string;
  endDate?: string;
}) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
  }, [filters?.outcome]);

  async function fetchCalls() {
    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        let mockData = [...MOCK_CALLS];
        if (filters?.outcome && filters.outcome !== 'all') {
            mockData = mockData.filter(c => c.esito_qualificazione === filters.outcome);
        }
        setCalls(mockData);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('calls')
        .select(`
          *,
          score:call_scores(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.outcome && filters.outcome !== 'all') {
        query = query.eq('esito_qualificazione', filters.outcome);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCalls(data || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Errore caricamento');
    } finally {
      setLoading(false);
    }
  }

  return { calls, loading, error, refetch: fetchCalls };
}

export function useCall(id: string | undefined) {
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchCall();
  }, [id]);

  async function fetchCall() {
    setLoading(true);
    
    if (!isSupabaseConfigured || !supabase) {
        const found = MOCK_CALLS.find(c => c.id === id);
        setCall(found || null);
        setLoading(false);
        return;
    }

    try {
        const { data, error } = await supabase
        .from('calls')
        .select(`*, score:call_scores(*)`)
        .eq('id', id)
        .single();
        
        if (error) throw error;
        setCall(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }

  return { call, loading };
}
