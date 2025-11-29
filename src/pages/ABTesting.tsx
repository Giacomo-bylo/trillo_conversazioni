import { useABTests } from '@/hooks/useABTests';
import { usePromptVersions } from '@/hooks/usePromptVersions';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ABTesting = () => {
  const { tests, loading, completeTest } = useABTests();
  const { versions } = usePromptVersions();

  const getVersionName = (id: string) => {
    const v = versions.find(ver => ver.id === id);
    return v ? `v${v.version_number}` : 'N/A';
  };

  const runningTests = tests.filter(t => t.status === 'running');
  const completedTests = tests.filter(t => t.status !== 'running');

  if (loading) return <div className="p-6">Caricamento test...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <GitBranch className="text-primary" /> A/B Testing
          </h1>
          <p className="text-sm text-gray-500 mt-1">Confronta versioni del prompt con dati reali</p>
        </div>
      </div>

      {/* Test Attivi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-900">Test Attivi</h3>
        </div>
        
        {runningTests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nessun test attivo. Crea un test dal Prompt Optimizer.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {runningTests.map(test => (
              <div key={test.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{test.test_name}</h4>
                    <p className="text-sm text-gray-500">
                      {getVersionName(test.prompt_a_id)} vs {getVersionName(test.prompt_b_id)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    In corso
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{test.calls_a + test.calls_b} / {test.target_calls} chiamate</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${((test.calls_a + test.calls_b) / test.target_calls) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Metriche Comparative */}
                {test.metrics_comparison && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Prompt A (attuale)</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {test.metrics_comparison.score_a.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {test.calls_a} chiamate
                      </div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="text-sm text-gray-500 mb-1">Prompt B (nuovo)</div>
                      <div className="text-2xl font-bold text-primary">
                        {test.metrics_comparison.score_b.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {test.calls_b} chiamate
                      </div>
                    </div>
                  </div>
                )}

                {/* Azioni */}
                {(test.calls_a + test.calls_b) >= test.target_calls && (
                  <div className="mt-4 flex gap-3">
                    <button 
                      onClick={() => completeTest(test.id, test.prompt_b_id)}
                      className="flex-1 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                    >
                      Deploy Prompt B
                    </button>
                    <button 
                      onClick={() => completeTest(test.id, test.prompt_a_id)}
                      className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Mantieni Prompt A
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Completati */}
      {completedTests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900">Test Completati</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varianti</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vincitore</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedTests.map(test => (
                <tr key={test.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{test.test_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getVersionName(test.prompt_a_id)} vs {getVersionName(test.prompt_b_id)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-emerald-600 font-medium">
                      {getVersionName(test.winner_prompt_id || '')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      test.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {test.status === 'completed' ? 'Completato' : 'Annullato'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
