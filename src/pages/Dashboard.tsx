import React, { useState } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, 
  Phone, PhoneCall
} from 'lucide-react';
import { useCalls } from '@/hooks/useCalls';
import { cn, formatDuration } from '@/lib/utils';
import { CallOutcome } from '@/types';
import { ReportGenerator } from '@/components/ReportGenerator';

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
          trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        )}>
          {trend >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-500">{trendLabel}</div>
  </div>
);

export const Dashboard = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const { calls, loading, error } = useCalls();

  const totalCalls = calls.length;
  const qualifiedCount = calls.filter(c => c.esito_qualificazione === CallOutcome.QUALIFIED).length;
  const callbackCount = calls.filter(c => c.esito_qualificazione === CallOutcome.CALLBACK).length;
  
  const conversionRate = totalCalls ? ((qualifiedCount / totalCalls) * 100).toFixed(1) : 0;
  
  const avgDuration = totalCalls 
    ? Math.round(calls.reduce((sum, c) => sum + (c.durata_chiamata || 0), 0) / totalCalls)
    : 0;

  if (loading) return <div className="p-10 flex items-center justify-center">Caricamento dashboard...</div>;
  if (error) return <div className="p-10 flex items-center justify-center text-red-500">Errore: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button 
          onClick={() => setReportOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium shadow-sm transition-colors"
        >
          Genera Report
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Totale Chiamate" 
          value={totalCalls} 
          trendLabel="Questa settimana"
          icon={Phone}
        />
        <MetricCard 
          title="Qualificati" 
          value={qualifiedCount}
          trend={totalCalls ? Math.round((qualifiedCount / totalCalls) * 100) : 0}
          trendLabel={`${conversionRate}% conversion`}
          icon={CheckCircle2}
        />
        <MetricCard 
          title="Da richiamare" 
          value={callbackCount}
          trendLabel="Callback richiesti"
          icon={PhoneCall}
        />
        <MetricCard 
          title="Durata Media" 
          value={formatDuration(avgDuration)} 
          trendLabel="Target: 2-3 min"
          icon={Clock}
        />
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