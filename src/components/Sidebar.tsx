import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  SlidersHorizontal, 
  Bot, 
  // BookOpen, 
  // Zap, 
  Users, 
  Settings, 
  ShieldCheck,
  // Server,
  TrendingUp,
  // Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Send
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
  const [incidentsOpen, setIncidentsOpen] = useState(true);
  const { t } = useLanguage();

  const isDeveloperOrAdmin = currentRole === 'TECHNICIAN' || currentRole === 'IT_MANAGER' || currentRole === 'ADMINISTRATOR';

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0 min-h-screen text-xs font-mono">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center font-black text-slate-950 shadow-glow-cyan">
          <Bot className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="font-extrabold text-sm text-slate-100 font-sans tracking-wide">{t('appTitle')}</div>
          <div className="text-[10px] text-cyan-400 font-mono">
            {isDeveloperOrAdmin ? t('developerConsole') : t('userPortal')}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        
        {/* Standard User / Employee Dedicated Navigation */}
        {!isDeveloperOrAdmin && (
          <div className="space-y-2">
            <div className="px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('userPortal')}</div>
            
            <button
              onClick={() => onNavigate('employee-portal')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                activeView === 'employee-portal' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>{t('reportNewIssue')}</span>
            </button>

            <button
              onClick={() => onNavigate('incidents')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                activeView === 'incidents' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{t('myReportedIncidents')}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">{incidentsCount}</span>
            </button>

            {/* Commented out for future work: Knowledge Base */}
            {/* 
            <button
              onClick={() => onNavigate('knowledge')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                activeView === 'knowledge' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>{t('knowledgeBase')}</span>
            </button>
            */}
          </div>
        )}

        {/* Developer / Technician / Admin Full Workstation Menu */}
        {isDeveloperOrAdmin && (
          <div className="space-y-1">
            <div className="px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">{t('developerTools')}</div>

            {/* Dashboard */}
            <button
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeView === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>{t('dashboard')}</span>
            </button>

            {/* Incidents Tree */}
            <div className="space-y-1">
              <button
                onClick={() => setIncidentsOpen(!incidentsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-semibold"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>{t('incidentsMaster')}</span>
                </div>
                {incidentsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {incidentsOpen && (
                <div className="pl-6 space-y-1 border-l-2 border-slate-800 ml-4">
                  <button
                    onClick={() => onNavigate('incidents', 'ALL')}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] transition-all ${
                      activeView === 'incidents' ? 'text-cyan-300 font-bold bg-cyan-950/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{t('allTickets')}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px]">{incidentsCount}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('employee-portal')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('raiseNewTicket')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Diagnostics */}
            <button
              onClick={() => onNavigate('diagnostics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeView === 'diagnostics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>{t('diagnostics')}</span>
            </button>

            {/* Commented out for future work: Knowledge Base, Similar Incidents, Assets/Devices, Automations */}
            {/* 
            <button
              onClick={() => onNavigate('knowledge')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeView === 'knowledge' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>{t('knowledgeBase')}</span>
            </button>

            <button
              onClick={() => onNavigate('similar')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeView === 'similar' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>{t('similarIncidents')}</span>
            </button>

            <button
              onClick={() => onNavigate('assets')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeView === 'assets' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Server className="w-4 h-4 text-cyan-400" />
              <span>{t('assetsDevices')}</span>
            </button>
            */}

            {/* Analytics */}
            <button
              onClick={() => onNavigate('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeView === 'analytics' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>{t('analytics')}</span>
            </button>

            {/* Commented out for future work: Automations */}
            {/*
            <button
              onClick={() => onNavigate('automations')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                activeView === 'automations' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{t('automations')}</span>
            </button>
            */}

            {/* Developer User Control Section */}
            <div className="pt-3 border-t border-slate-800 mt-2 space-y-1">
              <div className="px-3 text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-1">{t('developerAdmin')}</div>
              <button
                onClick={() => onNavigate('users')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeView === 'users' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-rose-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4 text-rose-400" />
                <span>{t('userControl')}</span>
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeView === 'settings' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-300" />
                <span>{t('systemSettings')}</span>
              </button>

              <button
                onClick={() => onNavigate('audit')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
                  activeView === 'audit' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('auditLogs')}</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </aside>
  );
};
