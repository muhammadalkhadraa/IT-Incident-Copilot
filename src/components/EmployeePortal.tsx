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

interface EmployeePortalProps {
  user: UserProfile;
  incidents: Incident[];
  onReportIncident: (title: string, category: string, description: string, attachmentName?: string) => void;
  onAddComment: (incidentId: string, commentText: string) => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  user,
  incidents,
  onReportIncident,
  onAddComment
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(incidents[0]?.id || null);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Hardware & Monitors');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [attachmentFileName, setAttachmentFileName] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim() || !newTicketDesc.trim()) return;

    onReportIncident(newTicketTitle, newTicketCategory, newTicketDesc, attachmentFileName);
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
      <div className="p-6 rounded-2xl glass-panel border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg font-extrabold text-slate-100 font-mono">
              EMPLOYEE SELF-SERVICE IT PORTAL
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <strong className="text-cyan-300">{user.name}</strong> ({user.department}). Report IT issues, track resolution progress, and message your assigned technician.
          </p>
        </div>

        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold text-xs shadow-glow-cyan hover:opacity-90 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report New IT Issue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: My Tickets List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
            My Reported Incidents ({incidents.length})
          </h3>

          {incidents.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl border-slate-800 text-xs text-slate-500">
              You currently have no open IT tickets.
            </div>
          ) : (
            incidents.map((incident) => {
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

                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                      incident.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      incident.status === 'AWAITING_APPROVAL' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 line-clamp-1">{incident.title}</h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>Tech: {incident.assignedTechnician || 'Auto-Dispatch'}</span>
                    <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Ticket Detail & IT Communication Stream */}
        <div className="lg:col-span-2">
          {selectedIncident ? (
            <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-6">
              
              {/* Ticket Header */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                    {selectedIncident.ticketNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Assigned Tech: <strong className="text-slate-200">{selectedIncident.assignedTechnician || 'Tier-2 Desk'}</strong></span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-100">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Attachments Section */}
              {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 font-mono uppercase flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" /> Attached Files ({selectedIncident.attachments.length})
                  </h4>

                  <div className="flex flex-wrap gap-3">
                    {selectedIncident.attachments.map((att) => (
                      <div key={att.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2 text-slate-300 font-mono">
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

              {/* Communication Stream */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  COMMUNICATION STREAM WITH IT SERVICE DESK
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
                          <span>{cmt.authorName} ({cmt.authorRole})</span>
                          <span>{cmt.timestamp}</span>
                        </div>
                        <p>{cmt.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handleSendComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Type a message to your assigned IT Technician..."
                    className="flex-1 glass-input text-xs px-4 py-2.5 rounded-xl border-slate-700/80"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold text-xs shadow-glow-cyan hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center glass-panel rounded-2xl border-slate-800 text-xs text-slate-500">
              Select an incident from the left to view IT updates and communications.
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitTicket} className="bg-[#0d131f] border border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Plus className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-100">Submit New IT Incident</h3>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Problem Title</label>
              <input
                type="text"
                value={newTicketTitle}
                onChange={(e) => setNewTicketTitle(e.target.value)}
                placeholder="e.g. Monitor display flashing on Dell Workstation"
                required
                className="w-full glass-input text-xs px-3 py-2 rounded-xl border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
              <select
                value={newTicketCategory}
                onChange={(e) => setNewTicketCategory(e.target.value)}
                className="w-full glass-input text-xs px-3 py-2 rounded-xl border-slate-700 text-slate-200"
              >
                <option value="Hardware & Monitors">Hardware & Monitors</option>
                <option value="Software & Apps">Software & Applications</option>
                <option value="Network & VPN">Network & VPN Access</option>
                <option value="Printer Services">Printer Services</option>
                <option value="Account & SSO">Account & SSO Access</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Detailed Description</label>
              <textarea
                value={newTicketDesc}
                onChange={(e) => setNewTicketDesc(e.target.value)}
                rows={3}
                placeholder="Describe what happened, error popups, and urgency..."
                required
                className="w-full glass-input text-xs p-3 rounded-xl border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Simulate File Attachment</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={attachmentFileName}
                  onChange={(e) => setAttachmentFileName(e.target.value)}
                  placeholder="e.g. error_screenshot.png"
                  className="flex-1 glass-input text-xs px-3 py-2 rounded-xl border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-xs font-extrabold shadow-glow-cyan"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
