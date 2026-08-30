import React from 'react';
import { 
  Bot, 
  Activity, 
  Search, 
  Cpu, 
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  Languages
} from 'lucide-react';
import type { Incident, UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  incidents: Incident[];
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser,
  onSwitchUser,
  incidents, 
  onSearchChange,
  onTabChange,
  onOpenAuthModal,
  onLogout
}) => {
  const pendingApprovalsCount = incidents.filter(i => i.status === 'AWAITING_APPROVAL').length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'EMPLOYEE': return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'TECHNICIAN': return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'IT_MANAGER': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'ADMINISTRATOR': return 'bg-rose-950 text-rose-300 border-rose-800';
    }
  };

  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#080b11]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange(currentUser.role === 'EMPLOYEE' ? 'employee-portal' : 'incidents')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-glow-cyan">
            <Bot className="w-6 h-6 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#080b11] rounded-full pulse-active" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">
                {t('appTitle')}
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                v1.0 enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span>RBAC ACTIVE</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline" /> Persona: {currentUser.role}
              </span>
            </p>
          </div>
        </div>

        {/* Center: Live Telemetry Ticker */}
        <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Ingestion: <strong className="text-white">1.2k events/s</strong></span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Monitored Hosts: <strong className="text-white">412 Hosts</strong></span>
          </div>
        </div>

        {/* Right: Quick Search, Language Switcher, Notifications, Auth Modal & Persona Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search */}
          <div className="relative hidden sm:block w-36 lg:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder={t('searchPlaceholder')}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full glass-input text-xs pl-9 pr-3 py-1.5 rounded-lg border-slate-700/80 placeholder:text-slate-500"
            />
          </div>

          {/* Pending Approvals Notification Pill */}
          {pendingApprovalsCount > 0 && currentUser.role !== 'EMPLOYEE' && (
            <button 
              onClick={() => onTabChange('incidents')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/20 transition-all animate-pulse"
              title={`${pendingApprovalsCount} script actions pending approval (${criticalCount} critical)`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{pendingApprovalsCount} {t('approvalsNeeded')}</span>
            </button>
          )}

          {/* Language Toggle Button (English ↔ Arabic) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shrink-0 font-mono shadow-glow-purple"
            title={language === 'en' ? 'Switch to Arabic (العربية)' : 'Switch to English'}
          >
            <Languages className="w-4 h-4 text-purple-400" />
            <span>{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {/* Sign In / Register Modal Opener Button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shrink-0 font-mono"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          )}

          {/* Log Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shrink-0 font-mono"
              title="Sign out of your account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}

          {/* Interactive Role Switcher Selector */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0">
              {currentUser.avatar}
            </div>

            <div className="flex flex-col text-left">
              <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
              
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const targetUser = MOCK_USERS.find(u => u.id === e.target.value);
                  if (targetUser) onSwitchUser(targetUser);
                }}
                className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold cursor-pointer bg-slate-900 ${getRoleBadgeColor(currentUser.role)}`}
              >
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>Switch to {u.role}: {u.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
