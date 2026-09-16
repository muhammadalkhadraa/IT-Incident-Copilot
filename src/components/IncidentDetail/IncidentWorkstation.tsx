import React, { useState } from 'react';
import type { Incident, PlaybookAction, IncidentStatus, UserProfile } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/apiService';

interface IncidentWorkstationProps {
  incident: Incident;
  currentUser?: UserProfile;
  onBack: () => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus, reopenReason?: string) => void;
  onExecutePlaybook?: (action: PlaybookAction, approverName?: string) => Promise<void>;
  onReRunDiagnostics?: () => void;
}

export const IncidentWorkstation: React.FC<IncidentWorkstationProps> = ({
  incident,
  currentUser,
  onBack,
  onUpdateStatus,
}) => {
  const { t } = useLanguage();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(incident.comments || []);

  const isDeveloperOrAdmin = currentUser?.role === 'TECHNICIAN' || currentUser?.role === 'IT_MANAGER' || currentUser?.role === 'ADMINISTRATOR';

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isDeveloperOrAdmin) return;

    const authorName = currentUser?.name || 'Support Agent';
    const authorRole = currentUser?.role || 'TECHNICIAN';

    const newCommentDto = await apiService.addComment(incident.id, commentText, authorName, authorRole);

    const newComment = {
      id: newCommentDto.id || `cmt-${Date.now()}`,
      incidentId: incident.id,
      authorId: currentUser?.id || 'usr-agent',
      authorName: authorName,
      authorRole: authorRole as any,
      authorAvatar: authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'SA',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: commentText
    };

    setComments(prev => [...prev, newComment]);
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
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
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

          {/* Status Update Buttons (Restricted to Support Agents & Administrators ONLY) */}
          {isDeveloperOrAdmin && (
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
          )}
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

      {/* Discussion & Replies Thread */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{t('communicationStream')}</h2>

        <div className="bg-[#05080f] rounded-xl p-4 border border-slate-800 space-y-3 max-h-80 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No replies yet.
            </div>
          ) : (
            comments.map((cmt) => (
              <div key={cmt.id} className={`flex items-start gap-3 text-xs ${cmt.authorRole === 'TECHNICIAN' || cmt.authorRole === 'ADMINISTRATOR' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-xl max-w-lg leading-relaxed ${
                  cmt.authorRole === 'TECHNICIAN' || cmt.authorRole === 'ADMINISTRATOR'
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

        {/* Reply Form (Restricted to Administrators & Support Agents ONLY) */}
        {isDeveloperOrAdmin ? (
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
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-medium text-center">
            🔒 Support Agents & Administrators will post updates and replies here.
          </div>
        )}
      </div>

    </div>
  );
};
