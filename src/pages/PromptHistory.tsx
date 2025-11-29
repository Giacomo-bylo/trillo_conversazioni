import { useState } from 'react';
import { usePromptVersions } from '@/hooks/usePromptVersions';
import { deployPrompt } from '@/lib/n8n';
import { History, RotateCcw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PromptHistory = () => {
  const { versions, loading, refetch } = usePromptVersions();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const handleRollback = async (versionId: string) => {
    if (!confirm('Sei sicuro di voler ripristinare questa versione?')) return;
    
    try {
      await deployPrompt(versionId, 'rollback');
      alert('Rollback completato!');
      refetch();
    } catch (e) {
      alert('Errore durante il rollback');
    }
  };

  const selected = versions.find(v => v.id === selectedVersion);

  if (loading) return <div className="p-6">Caricamento storico...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <History className="text-primary" /> Storico Versioni
        </h1>
        <p className="text-sm text-gray-500 mt-1">Cronologia di tutte le versioni del prompt</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista Versioni */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 font-medium text-sm text-gray-700">
            Tutte le versioni
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {versions.map(version => (
              <div 
                key={version.id}
                onClick={() => setSelectedVersion(version.id)}
                className={cn(
                  "p-4 cursor-pointer transition-colors",
                  selectedVersion === version.id ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-gray-50"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      v{version.version_number}
                      {version.is_active && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
                          Attiva
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(version.created_at).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {version.performance_metrics && (
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {version.performance_metrics.avg_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">score</div>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {version.change_reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dettaglio Versione */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-gray-400 p-12">
              <div className="text-center">
                <Eye size={48} className="mx-auto mb-4 opacity-20" />
                <p>Seleziona una versione per vedere i dettagli</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">Versione {selected.version_number}</h3>
                  <p className="text-sm text-gray-500">{selected.change_reason}</p>
                </div>
                {!selected.is_active && (
                  <button
                    onClick={() => handleRollback(selected.id)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <RotateCcw size={16} /> Rollback
                  </button>
                )}
              </div>

              {/* Metriche */}
              {selected.performance_metrics && (
                <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Avg Quality Score</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selected.performance_metrics.avg_score.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Conversion Rate</div>
                    <div className="text-2xl font-bold text-primary">
                      {selected.performance_metrics.conversion_rate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt Text */}
              <div className="p-6 overflow-y-auto max-h-[400px]">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Contenuto Prompt
                </h4>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono">
                  {selected.prompt_text}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
