import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Clock, MessageSquare, User, Home, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { useCall } from '@/hooks/useCalls';
import { cn, formatDuration, formatDate } from '@/lib/utils';
import { CallOutcome } from '@/types';

export const CallDetail = () => {
  const { id } = useParams();
  const { call, loading } = useCall(id);

  if (loading) return <div className="p-10 text-center">Caricamento chiamata...</div>;
  if (!call) return <div className="p-10 text-center">Chiamata non trovata</div>;

  const getOutcomeStyle = (outcome: string) => {
    switch(outcome) {
      case CallOutcome.QUALIFIED:
        return "bg-emerald-50 text-emerald-700";
      case CallOutcome.NOT_QUALIFIED:
        return "bg-red-50 text-red-700";
      case CallOutcome.CALLBACK:
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    switch(outcome) {
      case CallOutcome.QUALIFIED:
        return "Qualificato";
      case CallOutcome.NOT_QUALIFIED:
        return "Non Qualificato";
      case CallOutcome.CALLBACK:
        return "Da richiamare";
      case CallOutcome.NO_ANSWER:
        return "Non risponde";
      case CallOutcome.REFUSED:
        return "Rifiuta";
      default:
        return outcome || 'N/A';
    }
  };

  const getSentimentStyle = (sentiment: string | undefined) => {
    switch(sentiment) {
      case 'positivo':
        return "bg-emerald-50 text-emerald-700";
      case 'neutro':
        return "bg-gray-100 text-gray-700";
      case 'negativo':
        return "bg-amber-50 text-amber-700";
      case 'ostile':
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getUrgencyStyle = (urgency: string | undefined) => {
    switch(urgency) {
      case 'alta':
        return "bg-red-50 text-red-700";
      case 'media':
        return "bg-amber-50 text-amber-700";
      case 'bassa':
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const transcriptList = Array.isArray(call.transcript) 
      ? call.transcript 
      : typeof call.transcript === 'string' && call.transcript.startsWith('[')
        ? JSON.parse(call.transcript)
        : [];

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col md:overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/calls" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{call.lead_nome || 'Lead sconosciuto'}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{formatDate(call.created_at)}</span>
              <span>•</span>
              <span>{call.lead_telefono}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            getOutcomeStyle(call.esito_qualificazione)
          )}>
            {getOutcomeLabel(call.esito_qualificazione)}
          </span>
          <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-300 rounded-md">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Transcript */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 bg-white">
          {/* Transcript */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {transcriptList.length > 0 ? (
                transcriptList.map((msg: { role: string; content: string }, idx: number) => (
                <div key={idx} className={cn("flex gap-4 max-w-3xl", msg.role === 'agent' ? "flex-row" : "flex-row-reverse self-end ml-auto")}>
                    <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                    msg.role === 'agent' ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-600"
                    )}>
                    {msg.role === 'agent' ? 'AI' : 'U'}
                    </div>
                    <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'agent' 
                        ? "bg-gray-50 text-gray-900 rounded-tl-none border border-gray-100" 
                        : "bg-primary text-white rounded-tr-none shadow-sm"
                    )}>
                    {msg.content}
                    </div>
                </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Trascrizione non disponibile per questa chiamata.</p>
                </div>
            )}
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="w-full md:w-96 overflow-y-auto bg-gray-50 p-6 space-y-4 shrink-0">
            
            {/* Riepilogo */}
            {call.riepilogo_chiamata && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-primary" />
                  <h3 className="text-sm font-semibold text-gray-900">Riepilogo</h3>
                </div>
                <p className="text-sm text-gray-700">{call.riepilogo_chiamata}</p>
              </div>
            )}

            {/* Info Lead */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <User size={18} className="text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900">Informazioni Lead</h3>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Nome</span>
                        <span className="text-gray-900 font-medium">{call.lead_nome || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Telefono</span>
                        <span className="text-gray-900">{call.lead_telefono || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Sentiment</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getSentimentStyle(call.sentiment_cliente))}>
                          {call.sentiment_cliente || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Immobile */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Home size={18} className="text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900">Immobile</h3>
                </div>
                <div className="space-y-2 text-sm">
                    {call.stato_immobile && (
                      <div>
                          <span className="text-gray-500 block mb-1">Stato</span>
                          <span className="text-gray-900">{call.stato_immobile}</span>
                      </div>
                    )}
                    {call.problematiche_immobile && (
                      <div>
                          <span className="text-gray-500 block mb-1">Problematiche</span>
                          <span className="text-gray-900">{call.problematiche_immobile}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2">
                        <span className="text-gray-500">Urgenza cliente</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getUrgencyStyle(call.urgenza_cliente))}>
                          {call.urgenza_cliente || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Esito */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar size={18} className="text-primary" />
                    <h3 className="text-sm font-semibold text-gray-900">Esito</h3>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Qualificazione</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getOutcomeStyle(call.esito_qualificazione))}>
                          {getOutcomeLabel(call.esito_qualificazione)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Appuntamento</span>
                        <span className="text-gray-900">{call.appuntamento_fissato ? 'Sì' : 'No'}</span>
                    </div>
                    {call.callback_orario && (
                      <div className="flex justify-between">
                          <span className="text-gray-500">Callback richiesto</span>
                          <span className="text-gray-900">{call.callback_orario}</span>
                      </div>
                    )}
                    {call.callback_motivo && (
                      <div className="flex justify-between">
                          <span className="text-gray-500">Motivo callback</span>
                          <span className="text-gray-900">{call.callback_motivo}</span>
                      </div>
                    )}
                </div>
            </div>

            {/* Obiezioni */}
            {call.obiezioni_cliente && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={18} className="text-amber-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Obiezioni</h3>
                  </div>
                  <p className="text-sm text-gray-700">{call.obiezioni_cliente}</p>
              </div>
            )}

            {/* Note */}
            {call.note_aggiuntive && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                      <FileText size={18} className="text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-900">Note</h3>
                  </div>
                  <p className="text-sm text-gray-700">{call.note_aggiuntive}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                        <Clock size={14} /> Durata
                    </span>
                    <span className="font-medium text-gray-900">{formatDuration(call.durata_chiamata)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};