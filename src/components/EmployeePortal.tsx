import React, { useState } from 'react';
import type { Incident, UserProfile } from '../types';
import { 
  Plus, 
  Paperclip, 
  MessageSquare, 
  Send, 
  FileText,
  LifeBuoy
} from 'lucide-react';

import { apiService } from '../services/apiService';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_USERS } from '../data/mockUsers';

interface EmployeePortalProps {
  user: UserProfile;
  incidents: Incident[];
  onReportIncident: (
    title: string,
    category: string,
    description: string,
    attachmentName?: string,
    hostname?: string,
    ipAddress?: string,
    macAddress?: string,
    assignedTechnician?: string
  ) => void;
  onAddComment: (incidentId: string, commentText: string) => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  user,
  incidents,
  onReportIncident,
  onAddComment
}) => {
  const { t } = useLanguage();
  // Filter tickets created by or belonging to this specific user
  const myIncidents = incidents.filter(i => {
    if (!i.reporter) return false;
    const rep = i.reporter.toLowerCase();
    const uName = user.name.toLowerCase();
    const uFirstName = uName.split(' ')[0];
    return (i.reporterId && i.reporterId === user.id) || rep === uName || (uFirstName.length > 2 && rep.includes(uFirstName));
  });

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Hardware & Devices');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('Alex Thorne');
  const [developerUsers, setDeveloperUsers] = useState<UserProfile[]>([]);
  const [attachmentFileName, setAttachmentFileName] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  // Load registered developer users
  React.useEffect(() => {
    async function loadDevelopers() {
      try {
        const allUsers = await apiService.fetchUsers();
        const devs = allUsers.filter(u => u.role === 'TECHNICIAN' || u.role === 'IT_MANAGER' || u.role === 'ADMINISTRATOR');
        if (devs.length > 0) {
          setDeveloperUsers(devs);
          setAssignedTechnician(devs[0].name);
          return;
        }
      } catch {}
      const fallbackDevs = MOCK_USERS.filter(u => u.role === 'TECHNICIAN' || u.role === 'IT_MANAGER' || u.role === 'ADMINISTRATOR');
      setDeveloperUsers(fallbackDevs);
      if (fallbackDevs.length > 0) setAssignedTechnician(fallbackDevs[0].name);
    }
    loadDevelopers();
  }, []);

  const selectedIncident = myIncidents.find(i => i.id === selectedIncidentId) || myIncidents[0] || null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim() || !newTicketDesc.trim()) return;

    onReportIncident(
      newTicketTitle,
      newTicketCategory,
      newTicketDesc,
      attachmentFileName,
      'MY-WORKSTATION-PC',
      '192.168.1.105',
      '00:1A:2B:7C:8D:9E',
      assignedTechnician
    );

    setNewTicketTitle('');
    setNewTicketDesc('');
    setAttachmentFileName('');
    setShowNewForm(false);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !commentInput.trim()) return;

    onAddComment(selectedIncident.id, commentInput);
    setCommentInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <LifeBuoy className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-slate-100">
              {t('employeePortalBanner')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome, <strong className="text-cyan-300">{user.name}</strong>. Submit your ticket below and our support team will help you right away.
          </p>
        </div>

        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('reportNewIssue')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: My Tickets List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('myReportedIncidents')} ({myIncidents.length})
          </h3>

          {myIncidents.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl border-slate-800 text-xs text-slate-500">
              {t('noTickets')}
            </div>
          ) : (
            myIncidents.map((incident) => {
              const isSelected = selectedIncidentId === incident.id;

              return (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncidentId(incident.id)}
                  className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer space-y-2 ${
                    isSelected ? 'border-cyan-500 bg-slate-900/90 shadow-glow-cyan' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {incident.ticketNumber}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      incident.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {incident.status === 'RESOLVED' ? 'Resolved' : 'Open'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{incident.title}</h4>
                  <p className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                    {incident.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Assigned: {incident.assignedTechnician || 'Support Team'}</span>
                    <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Ticket Detail & Replies Thread */}
        <div className="lg:col-span-2">
          {selectedIncident ? (
            <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-6">
              
              {/* Ticket Header */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                    {selectedIncident.ticketNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Assigned Support Agent: <strong className="text-slate-200">{selectedIncident.assignedTechnician || 'Support Desk'}</strong></span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-100">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Attachments Section */}
              {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" /> Attached Files ({selectedIncident.attachments.length})
                  </h4>

                  <div className="flex flex-wrap gap-3">
                    {selectedIncident.attachments.map((att) => (
                      <div key={att.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-bold text-slate-200">{att.filename}</div>
                          <div className="text-[10px] text-slate-500">{att.filesize} • Uploaded by {att.uploadedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Replies Thread */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  {t('communicationStream')}
                </h4>

                <div className="bg-[#05080f] rounded-xl p-4 border border-slate-800 space-y-3 max-h-72 overflow-y-auto">
                  {selectedIncident.comments.map((cmt) => (
                    <div key={cmt.id} className={`flex items-start gap-3 text-xs ${cmt.authorRole === 'EMPLOYEE' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3.5 rounded-xl max-w-lg leading-relaxed ${
                        cmt.authorRole === 'EMPLOYEE'
                          ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}>
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-mono mb-1">
                          <span>{cmt.authorName}</span>
                          <span>{cmt.timestamp}</span>
                        </div>
                        <p>{cmt.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Reply Input */}
                <form onSubmit={handleSendComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={t('typeMessage')}
                    className="flex-1 glass-input text-xs px-4 py-2.5 rounded-xl border-slate-700/80 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>{t('send')}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center glass-panel rounded-2xl border-slate-800 text-xs text-slate-500">
              Select a ticket from the left to view updates and messages.
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Form Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitTicket} className="bg-[#0d131f] border border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-sans">
            <div className="flex items-center gap-2 text-cyan-400">
              <Plus className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-100">{t('reportNewIssue')}</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('problemTitle')}</label>
              <input
                type="text"
                value={newTicketTitle}
                onChange={(e) => setNewTicketTitle(e.target.value)}
                placeholder="e.g. Cannot connect to office Wi-Fi"
                required
                className="w-full glass-input text-xs px-3 py-2.5 rounded-xl border-slate-700 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('category')}</label>
              <select
                value={newTicketCategory}
                onChange={(e) => setNewTicketCategory(e.target.value)}
                className="w-full glass-input text-xs px-3 py-2.5 rounded-xl border-slate-700 text-slate-200 focus:outline-none"
              >
                <option value="Internet & Network">Internet & Network</option>
                <option value="Password & Account">Password & Account</option>
                <option value="Hardware & Devices">Hardware & Devices</option>
                <option value="Software & Apps">Software & Apps</option>
                <option value="General Support">General Support</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Support Agent</label>
              <select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full glass-input text-xs px-3 py-2.5 rounded-xl border-slate-700 text-slate-200 focus:outline-none"
              >
                {developerUsers.map(dev => (
                  <option key={dev.id} value={dev.name}>
                    👤 {dev.name} ({dev.department || 'Support Desk'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('description')}</label>
              <textarea
                value={newTicketDesc}
                onChange={(e) => setNewTicketDesc(e.target.value)}
                rows={3}
                placeholder="Describe your issue in detail..."
                required
                className="w-full glass-input text-xs p-3 rounded-xl border-slate-700 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Attach File (Optional)</label>
              <input
                type="text"
                value={attachmentFileName}
                onChange={(e) => setAttachmentFileName(e.target.value)}
                placeholder="e.g. screenshot.png"
                className="w-full glass-input text-xs px-3 py-2.5 rounded-xl border-slate-700"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow-glow-cyan"
              >
                {t('submitTicket')}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
