import React, { useState, useEffect } from 'react';
import type { UserProfile, UserRole, AuditLogEntry } from '../types';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Settings, 
  Key, 
  Database, 
  FileLock, 
  CheckCircle2
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

interface AdminControlCenterProps {
  currentUser: UserProfile;
  auditTrail: AuditLogEntry[];
  users: UserProfile[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onAddUser: (name: string, email: string, role: UserRole, department: string, title: string) => void;
  initialTab?: 'users' | 'settings' | 'audit';
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  currentUser,
  auditTrail,
  users,
  onUpdateUserRole,
  onAddUser,
  initialTab = 'users'
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'audit'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('TECHNICIAN');
  const [newDepartment, setNewDepartment] = useState('IT Operations');
  const [newTitle, setNewTitle] = useState('Systems Engineer');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    onAddUser(newName, newEmail, newRole, newDepartment, newTitle);
    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            <h2 className="text-lg font-extrabold text-slate-100 font-mono">
              SYSTEM ADMINISTRATION & RBAC CONTROL CENTER
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Administrator: <strong className="text-rose-300">{currentUser.name}</strong> ({currentUser.title}). Manage global enterprise tenant settings, user directory roles, and audit compliance logging.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs shadow-glow-rose hover:opacity-90 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> {t('userControl')} ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" /> {t('systemSettings')}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileLock className="w-4 h-4" /> {t('auditLogs')} ({auditTrail.length})
        </button>
      </div>

      {/* User Directory Tab */}
      {activeTab === 'users' && (
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 font-mono">
              USER ROLES & PERMISSION MANAGEMENT DIRECTORY
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Live RBAC Role Modifications</span>
          </div>

          <div className="space-y-3">
            {users.map((usr) => (
              <div key={usr.id} className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-sm text-cyan-400">
                    {usr.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{usr.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">({usr.email})</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{usr.title} • {usr.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 font-mono">Role:</span>
                  <select
                    value={usr.role}
                    onChange={(e) => onUpdateUserRole(usr.id, e.target.value as UserRole)}
                    className="glass-input text-xs px-3 py-1.5 rounded-xl border-slate-700 font-bold text-rose-300 bg-slate-900 font-mono"
                  >
                    <option value="EMPLOYEE">Standard User (Ticket Submissions Only)</option>
                    <option value="TECHNICIAN">Developer / Technician (Full Console Access)</option>
                    <option value="IT_MANAGER">IT Manager</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" /> SSO & SAML IDENTITY PROVIDER
            </h4>
            <p className="text-xs text-slate-400">Configure Azure AD / Entra ID single sign-on integration.</p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>Status: Azure Entra ID Connected</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" /> RAG VECTOR STORE CONFIGURATION
            </h4>
            <p className="text-xs text-slate-400">Pinecone / Qdrant vector index embedding model selection.</p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
              <span>Model: text-embedding-3-large (1536d)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      )}

      {/* System Audit Stream Tab */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 font-mono">
            GLOBAL SYSTEM COMPLIANCE & SECURITY AUDIT STREAM
          </h3>

          <div className="bg-[#05080f] p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 max-h-80 overflow-y-auto">
            {auditTrail.map((log) => (
              <div key={log.id} className="py-1 border-b border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold">[{log.actionType}]</span>
                  <span className="text-slate-200 ml-2">{log.details}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-[#0d131f] border border-rose-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <UserPlus className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-100">Provision New Enterprise User</h3>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. David Chen"
                required
                className="w-full glass-input text-xs px-3 py-2 rounded-xl border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. david.chen@corp.internal"
                required
                className="w-full glass-input text-xs px-3 py-2 rounded-xl border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Assign Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full glass-input text-xs px-3 py-2 rounded-xl border-slate-700 text-slate-200"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="IT_MANAGER">IT_MANAGER</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full glass-input text-xs px-3 py-2 rounded-xl border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Job Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full glass-input text-xs px-3 py-2 rounded-xl border-slate-700"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-extrabold shadow-glow-rose"
              >
                Provision User
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
