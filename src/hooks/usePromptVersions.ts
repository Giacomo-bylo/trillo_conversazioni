import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { PromptVersion } from '@/types';
import { MOCK_VERSIONS } from '@/constants';

export function usePromptVersions() {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<PromptVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, []);

  async function fetchVersions() {
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
        setVersions(MOCK_VERSIONS);
        setActiveVersion(MOCK_VERSIONS.find(v => v.is_active) || null);
        setLoading(false);
        return;
    }

    const { data } = await supabase
      .from('prompt_versions')
      .select('*')
      .order('version_number', { ascending: false });

    setVersions(data || []);
    setActiveVersion(data?.find((v: PromptVersion) => v.is_active) || null);
    setLoading(false);
  }

  return { versions, activeVersion, loading, refetch: fetchVersions };
}
