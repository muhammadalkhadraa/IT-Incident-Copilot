import React, { useState } from 'react';
import type { Incident, PlaybookAction, IncidentStatus } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface IncidentWorkstationProps {
  incident: Incident;
  onBack: () => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus, reopenReason?: string) => void;
  onExecutePlaybook: (action: PlaybookAction, approverName?: string) => Promise<void>;
  onReRunDiagnostics: () => void;
}

export const IncidentWorkstation: React.FC<IncidentWorkstationProps> = ({
  incident,
  onBack,
  onUpdateStatus,
}) => {
  const { t } = useLanguage();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(incident.comments || []);
  const [showAiAdvice, setShowAiAdvice] = useState(false);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `cmt-${Date.now()}`,
      incidentId: incident.id,
      authorId: 'usr-agent',
      authorName: 'Support Agent',
      authorRole: 'TECHNICIAN' as const,
      authorAvatar: 'SA',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: commentText
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const getPriorityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs">Urgent</span>;
      case 'HIGH':
        return <span className="px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs">High Priority</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-xs">Medium Priority</span>;
      default:
        return <span className="px-3 py-1 rounded-md bg-slate-700/40 text-slate-300 border border-slate-600 font-bold text-xs">Low Priority</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs font-bold">Open</span>;
      case 'DIAGNOSING':
      case 'AWAITING_APPROVAL':
      case 'REMEDIATING':
        return <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-xs font-bold">In Progress</span>;
      case 'RESOLVED':
        return <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold">Resolved</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-xs font-bold">Closed</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Back to Tickets"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-800">
                  {incident.ticketNumber}
                </span>
                {getPriorityBadge(incident.severity)}
                {getStatusBadge(incident.status)}
              </div>
              <h1 className="text-xl font-extrabold text-slate-100 mt-2">{incident.title}</h1>
            </div>
          </div>

          {/* Quick 1-Click Status Update Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {incident.status !== 'NEW' && (
              <button
                onClick={() => onUpdateStatus(incident.id, 'NEW')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700"
              >
                Mark Open
              </button>
            )}
            {incident.status !== 'DIAGNOSING' && (
              <button
                onClick={() => onUpdateStatus(incident.id, 'DIAGNOSING')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-all border border-amber-500/40"
              >
                Mark In Progress
              </button>
            )}
            {incident.status !== 'RESOLVED' && (
              <button
                onClick={() => onUpdateStatus(incident.id, 'RESOLVED')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-glow-emerald"
              >
                Mark Resolved
              </button>
            )}
          </div>
        </div>

        {/* Ticket Details Summary Bar */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Created By</span>
            <span className="font-semibold text-slate-200">{incident.reporter}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
            <span className="font-semibold text-slate-200">{incident.category || incident.affectedService}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Agent</span>
            <span className="font-semibold text-cyan-300">{incident.assignedTechnician || 'Support Desk'}</span>
          </div>
        </div>
      </div>

      {/* Description Box */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Ticket Description</h2>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed">
          {incident.description}
        </div>
      </div>

      {/* AI Troubleshooting Assistant Button */}
      <div className="p-6 rounded-2xl glass-panel border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
              ✨
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-200">{t('aiDiagnosis')}</h3>
              <p className="text-xs text-slate-400">Get instant 1-click troubleshooting advice in plain English</p>
            </div>
          </div>

          <button
            onClick={() => setShowAiAdvice(!showAiAdvice)}
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all shadow-glow-purple"
          >
            {showAiAdvice ? 'Hide Advice' : '✨ Show AI Advice'}
          </button>
        </div>

        {showAiAdvice && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/30 space-y-3 text-xs text-slate-200 animate-fadeIn">
            <div className="font-bold text-purple-300 flex items-center gap-2">
              <span>Suggested Solution Steps:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 leading-relaxed">
              <li>Check hardware cables and confirm device power is ON.</li>
              <li>Restart the application or service on your device.</li>
              <li>If the issue continues, request assistance from the assigned support agent.</li>
            </ul>
            {incident.aiAnalysis?.primaryHypothesis?.recommendedFix && (
              <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/50 text-purple-200 mt-2">
                <strong>Specific Advice:</strong> {incident.aiAnalysis.primaryHypothesis.recommendedFix}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discussion & Replies Thread */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{t('communicationStream')}</h2>

        <div className="bg-[#05080f] rounded-xl p-4 border border-slate-800 space-y-3 max-h-80 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No replies yet. Type a message below to post an update.
            </div>
          ) : (
            comments.map((cmt) => (
              <div key={cmt.id} className={`flex items-start gap-3 text-xs ${cmt.authorRole === 'TECHNICIAN' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-xl max-w-lg leading-relaxed ${
                  cmt.authorRole === 'TECHNICIAN'
                    ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 font-mono mb-1">
                    <span>{cmt.authorName}</span>
                    <span>{cmt.timestamp}</span>
                  </div>
                  <p>{cmt.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Reply Form */}
        <form onSubmit={handleSendComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('typeMessage')}
            className="flex-1 glass-input text-xs px-4 py-3 rounded-xl border-slate-700/80 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all shrink-0"
          >
            {t('send')}
          </button>
        </form>
      </div>

    </div>
  );
};
