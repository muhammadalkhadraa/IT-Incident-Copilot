import React from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Bot, 
  Users, 
  Plus
} from 'lucide-react';
import type { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  currentRole: UserRole;
  activeView: string;
  onNavigate: (view: string, filter?: string) => void;
  incidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeView,
  onNavigate,
  incidentsCount
}) => {
  const { t } = useLanguage();
  const isDeveloperOrAdmin = currentRole === 'TECHNICIAN' || currentRole === 'IT_MANAGER' || currentRole === 'ADMINISTRATOR';

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0 min-h-screen text-xs font-sans">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-slate-950 shadow-glow-cyan">
          <Bot className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="font-extrabold text-sm text-slate-100 tracking-wide">{t('appTitle')}</div>
          <div className="text-[10px] text-cyan-400 font-mono">
            {isDeveloperOrAdmin ? 'Support Team' : 'User Help Desk'}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        <div className="px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Main Menu</div>

        {/* 1. All Tickets */}
        <button
          onClick={() => onNavigate('incidents')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
            activeView === 'incidents' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' 
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span>{isDeveloperOrAdmin ? t('allTickets') : t('myReportedIncidents')}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700">
            {incidentsCount}
          </span>
        </button>

        {/* 2. Create Ticket */}
        <button
          onClick={() => onNavigate('employee-portal')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
            activeView === 'employee-portal' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' 
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>{t('raiseNewTicket')}</span>
        </button>

        {/* 3. Dashboard */}
        <button
          onClick={() => onNavigate('analytics')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
            activeView === 'analytics' || activeView === 'dashboard'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-purple-400" />
          <span>{t('dashboard')}</span>
        </button>

        {/* 4. Users / Team */}
        {isDeveloperOrAdmin && (
          <button
            onClick={() => onNavigate('users')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
              activeView === 'users' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-rose-400" />
            <span>{t('userControl')}</span>
          </button>
        )}
      </div>

    </aside>
  );
};
