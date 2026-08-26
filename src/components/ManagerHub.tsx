import React, { useState } from 'react';
import type { Incident, UserProfile, IncidentSeverity } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  Settings2,
  Zap
} from 'lucide-react';

interface ManagerHubProps {
  user: UserProfile;
  incidents: Incident[];
  onAssignTechnician: (incidentId: string, technicianName: string) => void;
  onEscalateSeverity: (incidentId: string, newSeverity: IncidentSeverity) => void;
}

export const ManagerHub: React.FC<ManagerHubProps> = ({
  user,
  incidents,
  onAssignTechnician,
  onEscalateSeverity
}) => {
  const [autoApproveLowRisk, setAutoApproveLowRisk] = useState(true);
  const [requireTier2Signoff, setRequireTier2Signoff] = useState(true);

  const technicians = MOCK_USERS.filter(u => u.role === 'TECHNICIAN' || u.role === 'IT_MANAGER');
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const unassignedCount = incidents.filter(i => !i.assignedTechnician || i.assignedTechnician === 'Unassigned').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-extrabold text-slate-100 font-mono">
              IT MANAGER COMMAND & ESCALATION HUB
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manager: <strong className="text-amber-300">{user.name}</strong> ({user.title}). Assign technicians, manage SLA escalations, and configure AI automation policy rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> {unassignedCount} Unassigned Tickets
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE INCIDENT LOAD</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1">{incidents.filter(i => i.status !== 'RESOLVED').length}</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">100% Team Coverage</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">UNASSIGNED QUEUE</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{unassignedCount}</div>
          <div className="text-[10px] text-amber-300 mt-1 font-mono">Requires Dispatcher Assignment</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">CRITICAL P1 INCIDENTS</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{criticalCount}</div>
          <div className="text-[10px] text-rose-400 mt-1 font-mono">Executive SLA Active</div>
        </div>
      </div>

      {/* Technician Assignment Matrix */}
      <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            INCIDENT DISPATCH & TECHNICIAN ASSIGNMENT MATRIX
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Override technician assignments live</span>
        </div>

        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {incident.ticketNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    incident.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    incident.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {incident.severity}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{incident.title}</h4>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Host: <strong>{incident.deviceTelemetry.hostname}</strong> • Reported by: <strong>{incident.reporter}</strong>
                </div>
              </div>

              {/* Assignment Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Assigned Engineer</div>
                  <div className="text-xs font-semibold text-cyan-300 font-mono">{incident.assignedTechnician || 'Unassigned'}</div>
                </div>

                <select
                  value={incident.assignedTechnician || 'Unassigned'}
                  onChange={(e) => onAssignTechnician(incident.id, e.target.value)}
                  className="glass-input text-xs px-3 py-1.5 rounded-xl border-slate-700 font-bold text-cyan-300 bg-slate-900"
                >
                  <option value="Unassigned">Assign Tech...</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.title})</option>
                  ))}
                </select>

                {/* Escalation Button */}
                <button
                  onClick={() => onEscalateSeverity(incident.id, 'CRITICAL')}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                  title="Escalate ticket severity to CRITICAL P1"
                >
                  Escalate P1
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Automation Rule Configuration Panel */}
      <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-purple-400" />
            AUTOMATION & AI DIAGNOSTIC POLICY CONFIGURATION
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3" /> Policy Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">Auto-Execute Low Risk Scripts</div>
              <div className="text-[11px] text-slate-400">Allow low risk playbooks (e.g. Flush DNS) without human signoff</div>
            </div>
            <input
              type="checkbox"
              checked={autoApproveLowRisk}
              onChange={(e) => setAutoApproveLowRisk(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">Require Tier-2 Approval for High Risk</div>
              <div className="text-[11px] text-slate-400">Enforce approval gate modal for disk shrink / isolation scripts</div>
            </div>
            <input
              type="checkbox"
              checked={requireTier2Signoff}
              onChange={(e) => setRequireTier2Signoff(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
