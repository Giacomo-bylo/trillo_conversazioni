import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ChevronRight } from 'lucide-react';
import { useCalls } from '@/hooks/useCalls';
import { cn, formatDuration, formatDate } from '@/lib/utils';
import { CallOutcome } from '@/types';
import { ReportGenerator } from '@/components/ReportGenerator';

export const CallsList = () => {
  const [filter, setFilter] = useState('all');
  const [reportOpen, setReportOpen] = useState(false);
  const { calls, loading, error } = useCalls({ outcome: filter === 'all' ? undefined : filter });

  const getOutcomeBadge = (outcome: string) => {
    switch(outcome) {
      case CallOutcome.QUALIFIED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Qualificato</span>;
      case CallOutcome.CALLBACK:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Da richiamare</span>;
      case CallOutcome.NOT_QUALIFIED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Non qualificato</span>;
      case CallOutcome.NO_ANSWER:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Non risponde</span>;
      case CallOutcome.REFUSED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Rifiuta</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{outcome || 'N/A'}</span>;
    }
  };

  if (loading) return <div className="p-10 flex items-center justify-center">Caricamento chiamate...</div>;
  if (error) return <div className="p-10 flex items-center justify-center text-red-500">Errore: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Tutte le Chiamate</h1>
        <button 
          onClick={() => setReportOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium shadow-sm transition-colors"
        >
          Genera Report
        </button>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{calls.length} chiamate</h3>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cerca lead..." 
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary w-64"
                />
             </div>
             <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <select 
                 className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary appearance-none bg-white"
                 value={filter}
                 onChange={(e) => setFilter(e.target.value)}
               >
                 <option value="all">Tutti gli esiti</option>
                 <option value={CallOutcome.QUALIFIED}>Qualificato</option>
                 <option value={CallOutcome.NOT_QUALIFIED}>Non qualificato</option>
                 <option value={CallOutcome.CALLBACK}>Da richiamare</option>
                 <option value={CallOutcome.NO_ANSWER}>Non risponde</option>
                 <option value={CallOutcome.REFUSED}>Rifiuta</option>
               </select>
             </div>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Esito</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgenza</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durata</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calls.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  Nessuna chiamata trovata
                </td>
              </tr>
            ) : (
              calls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(call.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{call.lead_nome || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{call.lead_telefono || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getOutcomeBadge(call.esito_qualificazione)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.urgenza_cliente ? (
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        call.urgenza_cliente === 'alta' ? "bg-red-50 text-red-700" :
                        call.urgenza_cliente === 'media' ? "bg-amber-50 text-amber-700" :
                        "bg-emerald-50 text-emerald-700"
                      )}>
                        {call.urgenza_cliente}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {call.sentiment_cliente ? (
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        call.sentiment_cliente === 'positivo' ? "bg-emerald-50 text-emerald-700" :
                        call.sentiment_cliente === 'negativo' ? "bg-red-50 text-red-700" :
                        call.sentiment_cliente === 'ostile' ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {call.sentiment_cliente}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(call.durata_chiamata || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/calls/${call.id}`} className="text-primary hover:text-primary-hover inline-flex items-center">
                      Dettagli <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report Generator Modal */}
      <ReportGenerator 
        calls={calls} 
        isOpen={reportOpen} 
        onClose={() => setReportOpen(false)} 
      />
    </div>
  );
};