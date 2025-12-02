import { useState, useEffect } from 'react';
import { PhoneCall, RefreshCw, Clock } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cn, formatDate } from '@/lib/utils';

interface Callback {
  id: string;
  tenant_id: string;
  retell_call_id: string;
  lead_nome: string | null;
  lead_telefono: string | null;
  lead_email: string | null;
  lead_indirizzo: string | null;
  callback_orario: string | null;
  callback_motivo: string | null;
  scheduled_at: string | null;
  completato: boolean;
  created_at: string;
  wait_minutes: number | null;
}

export const Callbacks = () => {
  const [callbacks, setCallbacks] = useState<Callback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCallbacks = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      // Mock data
      setCallbacks([
        {
          id: 'cb1',
          tenant_id: '38afda6d-2b2e-4276-8d2d-946520316f0e',
          retell_call_id: 'call_cb_1',
          lead_nome: 'Marco Bellini',
          lead_telefono: '+39 333 7778899',
          lead_email: 'm.bellini@email.com',
          lead_indirizzo: 'Via Veneto 15, Roma',
          callback_orario: 'dopo le 18',
          callback_motivo: 'occupato al lavoro',
          scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          completato: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
          wait_minutes: 120,
        },
        {
          id: 'cb2',
          tenant_id: '38afda6d-2b2e-4276-8d2d-946520316f0e',
          retell_call_id: 'call_cb_2',
          lead_nome: 'Elena Ferri',
          lead_telefono: '+39 333 2223344',
          lead_email: null,
          lead_indirizzo: 'Via Milano 8, Roma',
          callback_orario: 'domani mattina',
          callback_motivo: 'in riunione',
          scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
          completato: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          wait_minutes: null,
        },
        {
          id: 'cb3',
          tenant_id: '38afda6d-2b2e-4276-8d2d-946520316f0e',
          retell_call_id: 'call_cb_3',
          lead_nome: 'Giovanni Ricci',
          lead_telefono: '+39 333 9990011',
          lead_email: 'g.ricci@email.com',
          lead_indirizzo: 'Via Torino 22, Roma',
          callback_orario: 'alle 15',
          callback_motivo: 'stava guidando',
          scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          completato: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          wait_minutes: null,
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('callbacks')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setCallbacks(data || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Errore caricamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallbacks();
  }, []);

  if (loading) return <div className="p-10 flex items-center justify-center">Caricamento callback...</div>;
  if (error) return <div className="p-10 flex items-center justify-center text-red-500">Errore: {error}</div>;

  const pendingCount = callbacks.filter(c => !c.completato).length;
  const completedCount = callbacks.filter(c => c.completato).length;

  const formatScheduledTime = (isoString: string | null) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) {
      return `${Math.abs(diffMins)} min fa`;
    } else if (diffMins < 60) {
      return `tra ${diffMins} min`;
    } else if (diffMins < 1440) {
      return `tra ${Math.round(diffMins / 60)} ore`;
    } else {
      return formatDate(isoString);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Callback Richiesti</h1>
          <p className="text-sm text-gray-500 mt-1">Lead che hanno chiesto di essere richiamati</p>
        </div>
        <button 
          onClick={fetchCallbacks}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw size={16} /> Aggiorna
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Totale</div>
          <div className="text-2xl font-bold text-gray-900">{callbacks.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Da chiamare</div>
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Completati</div>
          <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indirizzo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orario richiesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedulato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {callbacks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  <PhoneCall size={32} className="mx-auto mb-2 text-gray-300" />
                  Nessun callback in programma
                </td>
              </tr>
            ) : (
              callbacks.map((cb) => (
                <tr key={cb.id} className={cn(
                  "hover:bg-gray-50 transition-colors",
                  !cb.completato && cb.scheduled_at && new Date(cb.scheduled_at) < new Date() && "bg-amber-50"
                )}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cb.lead_nome || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{cb.lead_telefono || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cb.lead_indirizzo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cb.callback_orario || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cb.callback_motivo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock size={14} className="text-gray-400" />
                      <span className={cn(
                        !cb.completato && cb.scheduled_at && new Date(cb.scheduled_at) < new Date() 
                          ? "text-amber-600 font-medium" 
                          : "text-gray-500"
                      )}>
                        {formatScheduledTime(cb.scheduled_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cb.completato ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completato
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Da chiamare
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