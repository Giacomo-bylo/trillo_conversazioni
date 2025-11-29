import React, { useState } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, 
  Filter, Search, ChevronRight, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCalls } from '@/hooks/useCalls';
import { cn, formatDuration, formatDate } from '@/lib/utils';
import { CallOutcome } from '@/types';

const MetricCard = ({ title, value, trend, trendLabel, icon: Icon }: { 
  title: string; 
  value: string | number; 
  trend?: number; 
  trendLabel: string; 
  icon: React.ElementType 
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon className="text-gray-500" size={20} />
      </div>
      {trend !== undefined && (
        <div className={cn(
          "flex items-center text-xs font-medium px-2 py-1 rounded-full",
          trend > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        )}>
          {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-500">{trendLabel}</div>
  </div>
);

const CHART_DATA = [
  { day: 'Lun', score: 6.5, conversion: 12 },
  { day: 'Mar', score: 6.8, conversion: 15 },
  { day: 'Mer', score: 7.2, conversion: 18 },
  { day: 'Gio', score: 7.0, conversion: 16 },
  { day: 'Ven', score: 7.5, conversion: 22 },
  { day: 'Sab', score: 7.8, conversion: 25 },
  { day: 'Dom', score: 7.4, conversion: 20 },
];

export const Dashboard = () => {
  const [filter, setFilter] = useState('all');
  const { calls, loading, error } = useCalls({ outcome: filter === 'all' ? undefined : filter });

  const totalCalls = calls.length;
  const qualifiedCount = calls.filter(c => c.esito_qualificazione === CallOutcome.QUALIFIED).length;
  const conversionRate = totalCalls ? ((qualifiedCount / totalCalls) * 100).toFixed(1) : 0;
  
  const avgDuration = totalCalls 
    ? Math.round(calls.reduce((sum, c) => sum + c.durata_chiamata, 0) / totalCalls)
    : 0;

  const callsWithScore = calls.filter(c => c.score);
  const avgScore = callsWithScore.length
    ? (callsWithScore.reduce((sum, c) => sum + (c.score?.quality_score || 0), 0) / callsWithScore.length).toFixed(1)
    : 0;
  
  const criticalIssuesCount = calls.reduce((acc, call) => acc + (call.score?.identified_issues?.length || 0), 0);

  const getOutcomeBadge = (outcome: string) => {
    switch(outcome) {
      case CallOutcome.QUALIFIED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Qualificato</span>;
      case CallOutcome.CALLBACK:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Da richiamare</span>;
      case CallOutcome.NOT_QUALIFIED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Non qualificato</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{outcome}</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600";
    if (score >= 6) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) return <div className="p-10 flex items-center justify-center">Caricamento dashboard...</div>;
  if (error) return <div className="p-10 flex items-center justify-center text-red-500">Errore: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Report
          </button>
          <Link to="/optimizer" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium shadow-sm transition-colors flex items-center">
            Analisi Rapida
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Conversion Rate" 
          value={`${conversionRate}%`} 
          trend={2.4}
          trendLabel="vs. settimana prec."
          icon={CheckCircle2}
        />
        <MetricCard 
          title="Avg. Quality Score" 
          value={avgScore} 
          trend={-0.5}
          trendLabel="Target: 8.0"
          icon={Sparkles} 
        />
        <MetricCard 
          title="Avg. Duration" 
          value={formatDuration(avgDuration)} 
          trend={1.2}
          trendLabel="Target: 5-7 min"
          icon={Clock}
        />
        <MetricCard 
          title="Critical Issues" 
          value={criticalIssuesCount} 
          trend={-5}
          trendLabel="vs. settimana prec."
          icon={AlertCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Trend Qualità & Conversione</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4361EE" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4361EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#4361EE" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
                <AlertCircle size={32} />
            </div>
            <div>
                <h4 className="text-lg font-medium text-gray-900">Ottimizza Prompt</h4>
                <p className="text-sm text-gray-500 mt-1">
                    L'IA ha rilevato {criticalIssuesCount} problemi critici.
                </p>
            </div>
            <Link to="/optimizer" className="w-full">
                <button className="w-full py-2 px-4 border border-primary text-primary hover:bg-primary/5 rounded-md font-medium transition-colors">
                    Vai all'Optimizer
                </button>
            </Link>
        </div>
      </div>

      {/* Recent Calls Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Chiamate Recenti</h3>
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
                 <option value={CallOutcome.CALLBACK}>Da richiamare</option>
                 <option value={CallOutcome.NOT_QUALIFIED}>Non qualificato</option>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durata</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problemi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(call.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{call.lead_nome}</div>
                  <div className="text-xs text-gray-500">{call.lead_telefono}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getOutcomeBadge(call.esito_qualificazione)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDuration(call.durata_chiamata)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn("text-lg font-semibold", getScoreColor(call.score?.quality_score || 0))}>
                    {call.score?.quality_score || '-'}
                  </span>
                  <span className="text-xs text-gray-400">/10</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {call.score?.identified_issues.map((issue, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {issue}
                      </span>
                    ))}
                    {!call.score?.identified_issues.length && <span className="text-gray-400 text-xs italic">Nessun problema</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/calls/${call.id}`} className="text-primary hover:text-primary-hover inline-flex items-center">
                    Dettagli <ChevronRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
