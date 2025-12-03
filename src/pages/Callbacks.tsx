import { useState, useEffect } from 'react';
import { PhoneCall, RefreshCw, Clock, Trash2 } from 'lucide-react';
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [callToDelete, setCallToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          wait_minutes: 1080,
        },
        {
          id: 'cb3',
          tenant_id: '38afda6d-2b2e-4276-8d2d-946520316f0e',
          retell_call_id: 'call_cb_3',
          lead_nome: 'Giovanni Verdi',
          lead_telefono: '+39 333 5556677',
          lead_email: 'g.verdi@email.com',
          lead_indirizzo: 'Via Torino 30, Roma',
          callback_orario: 'tra 30 minuti',
          callback_motivo: 'a pranzo',
          scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          completato: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
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
        .order('created_at', { ascending: false });

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
          .from('callbacks')
          .delete()
          .eq('id', callToDelete);
        
        if (error) throw error;
      } else {
        // Mock: rimuovi dalla lista locale
        setCallbacks(prev => prev.filter(c => c.id !== callToDelete));
      }
      
      setDeleteModalOpen(false);
      setCallToDelete(null);
      if (isSupabaseConfigured && supabase) {
        fetchCallbacks();
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

  if (loading) return <div className="p-10 flex items-center justify-center">Caricamento callback...</div>;
  if (error) return <div className="p-10 flex items-center justify-center text-red-500">Errore: {error}</div>;

  const pendingCount = callbacks.filter(c => !c.completato).length;
  const completedCount = callbacks.filter(c => c.completato).length;

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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {callbacks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  Nessun callback richiesto
                </td>
              </tr>
            ) : (
              callbacks.map((callback) => (
                <tr key={callback.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{callback.lead_nome || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{callback.lead_telefono || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {callback.lead_indirizzo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {callback.callback_orario || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {callback.callback_motivo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {callback.scheduled_at ? (
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" />
                        {formatDate(callback.scheduled_at)}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {callback.completato ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completato
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Da chiamare
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteClick(callback.id)}
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