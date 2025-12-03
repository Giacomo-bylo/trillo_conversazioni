import { useState, useEffect } from 'react';
import { PhoneMissed, RefreshCw, Trash2 } from 'lucide-react';
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [callToDelete, setCallToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (id: string) => {
    setCallToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!callToDelete) return;
    
    setDeleting(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('missed_calls')
          .delete()
          .eq('id', callToDelete);
        
        if (error) throw error;
      } else {
        // Mock: rimuovi dalla lista locale
        setMissedCalls(prev => prev.filter(c => c.id !== callToDelete));
      }
      
      setDeleteModalOpen(false);
      setCallToDelete(null);
      if (isSupabaseConfigured && supabase) {
        fetchMissedCalls();
      }
    } catch (err) {
      console.error('Errore eliminazione:', err);
      alert('Errore durante l\'eliminazione');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCallToDelete(null);
  };

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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {missedCalls.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Nessuna chiamata mancata
                </td>
              </tr>
            ) : (
              missedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 transition-colors group">
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Tentativo {call.tentativo_n}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.richiamato ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Richiamato
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Da richiamare
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteClick(call.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Elimina"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conferma eliminazione</h3>
              <p className="text-gray-600">Sei sicuro di voler eliminare?</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={deleting}
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                disabled={deleting}
              >
                <Trash2 size={16} />
                {deleting ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};