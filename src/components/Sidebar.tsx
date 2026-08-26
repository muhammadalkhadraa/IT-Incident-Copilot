import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  SlidersHorizontal, 
  Bot, 
  BookOpen, 
  Zap, 
  Users, 
  Settings, 
  ShieldCheck,
  Server,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import type { UserRole } from '../types';

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

  // Role Gating Logic
  const canAccess = (minRole: 'EMPLOYEE' | 'TECHNICIAN' | 'IT_MANAGER' | 'ADMINISTRATOR') => {
    const roles: UserRole[] = ['EMPLOYEE', 'TECHNICIAN', 'IT_MANAGER', 'ADMINISTRATOR'];
    const userIndex = roles.indexOf(currentRole);
    const requiredIndex = roles.indexOf(minRole);
    return userIndex >= requiredIndex;
  };

  return (
    <aside className="w-64 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0 min-h-screen text-xs font-mono">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center font-black text-slate-950 shadow-glow-cyan">
          <Bot className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="font-extrabold text-sm text-slate-100 font-sans tracking-wide">IT COPILOT</div>
          <div className="text-[10px] text-cyan-400 font-mono">Enterprise Platform v2.4</div>
        </div>
      </div>

      {/* Navigation Group Stream */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        
        {/* 1. Dashboard */}
        {canAccess('EMPLOYEE') && (
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </button>
        )}

        {/* 2. Incidents (With Sub-Navigation Tree) */}
        {canAccess('EMPLOYEE') && (
          <div className="space-y-1">
            <button
              onClick={() => setIncidentsOpen(!incidentsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-semibold"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Incidents</span>
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
                  <span>All Incidents</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px]">{incidentsCount}</span>
                </button>

                <button
                  onClick={() => onNavigate('incidents', 'MY')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-slate-200"
                >
                  <UserCheck className="w-3 h-3 text-cyan-400" />
                  <span>My Incidents</span>
                </button>

                <button
                  onClick={() => onNavigate('incidents', 'CRITICAL')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-slate-200"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Critical Incidents</span>
                </button>

                <button
                  onClick={() => onNavigate('incidents', 'CREATE')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Incident</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Diagnostics */}
        {canAccess('TECHNICIAN') && (
          <button
            onClick={() => onNavigate('diagnostics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'diagnostics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Diagnostics</span>
          </button>
        )}

        {/* 4. Copilot */}
        {canAccess('EMPLOYEE') && (
          <button
            onClick={() => onNavigate('copilot')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'copilot' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI Copilot</span>
          </button>
        )}

        {/* 5. Knowledge Base */}
        {canAccess('EMPLOYEE') && (
          <button
            onClick={() => onNavigate('knowledge')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'knowledge' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Knowledge Base</span>
          </button>
        )}

        {/* 6. Similar Incidents */}
        {canAccess('TECHNICIAN') && (
          <button
            onClick={() => onNavigate('similar')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'similar' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Similar Incidents</span>
          </button>
        )}

        {/* 7. Assets / Devices */}
        {canAccess('TECHNICIAN') && (
          <button
            onClick={() => onNavigate('assets')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'assets' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Assets / Devices</span>
          </button>
        )}

        {/* 8. Analytics */}
        {canAccess('IT_MANAGER') && (
          <button
            onClick={() => onNavigate('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'analytics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Analytics</span>
          </button>
        )}

        {/* 9. Automations */}
        {canAccess('IT_MANAGER') && (
          <button
            onClick={() => onNavigate('automations')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'automations' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Automations</span>
          </button>
        )}

        {/* 10. Users */}
        {canAccess('ADMINISTRATOR') && (
          <button
            onClick={() => onNavigate('users')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'users' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-rose-400" />
            <span>Users & Directory</span>
          </button>
        )}

        {/* 11. Settings */}
        {canAccess('ADMINISTRATOR') && (
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'settings' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>Settings & SSO</span>
          </button>
        )}

        {/* 12. Audit Logs */}
        {canAccess('ADMINISTRATOR') && (
          <button
            onClick={() => onNavigate('audit')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeView === 'audit' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Logs</span>
          </button>
        )}

      </div>

    </aside>
  );
};
