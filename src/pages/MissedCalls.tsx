import { useState, useEffect } from 'react';
import { PhoneMissed, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cn, formatDate } from '@/lib/utils';

interface MissedCall {
  id: string;
  tenant_id: string;
  retell_call_id: string;
  lead_nome: string | null;
  lead_telefono: string | null;
  lead_email: string | null;
  lead_indirizzo: string | null;
  tentativo_n: number;
  created_at: string;
  richiamato: boolean;
  wait_minutes: number | null;
}

export const MissedCalls = () => {
  const [missedCalls, setMissedCalls] = useState<MissedCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissedCalls = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      // Mock data
      setMissedCalls([
        {
          id: 'mc1',
          tenant_id: '38afda6d-2b2e-4276-8d2d-946520316f0e',
          retell_call_id: 'call_missed_1',
          lead_nome: 'Francesco Russo',
          lead_telefono: '+39 333 1112233',
          lead_email: 'f.russo@email.com',
          lead_indirizzo: 'Via Roma 10, Roma',
          tentativo_n: 2,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          richiamato: false,
          wait_minutes: 60,
        },
        {
          id: 'mc2',
          tenant_id: '38afda6d-2b2e-4276-8d2d-946520316f0e',
          retell_call_id: 'call_missed_2',
          lead_nome: 'Sara Conti',
          lead_telefono: '+39 333 4445566',
          lead_email: null,
          lead_indirizzo: 'Via Napoli 25, Roma',
          tentativo_n: 1,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          richiamato: true,
          wait_minutes: null,
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('missed_calls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissedCalls(data || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Errore caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissedCalls();
  }, []);

  if (loading) return <div className="p-10 flex items-center justify-center">Caricamento chiamate mancate...</div>;
  if (error) return <div className="p-10 flex items-center justify-center text-red-500">Errore: {error}</div>;

  const pendingCount = missedCalls.filter(c => !c.richiamato).length;
  const completedCount = missedCalls.filter(c => c.richiamato).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Chiamate Mancate</h1>
          <p className="text-sm text-gray-500 mt-1">Lead che non hanno risposto alla chiamata</p>
        </div>
        <button 
          onClick={fetchMissedCalls}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw size={16} /> Aggiorna
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Totale</div>
          <div className="text-2xl font-bold text-gray-900">{missedCalls.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Da richiamare</div>
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Richiamati</div>
          <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indirizzo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tentativo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {missedCalls.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  <PhoneMissed size={32} className="mx-auto mb-2 text-gray-300" />
                  Nessuna chiamata mancata
                </td>
              </tr>
            ) : (
              missedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(call.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{call.lead_nome || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{call.lead_telefono || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {call.lead_indirizzo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      call.tentativo_n >= 3 ? "bg-red-50 text-red-700" :
                      call.tentativo_n === 2 ? "bg-amber-50 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {call.tentativo_n}/3
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.richiamato ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Richiamato
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        In attesa
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};