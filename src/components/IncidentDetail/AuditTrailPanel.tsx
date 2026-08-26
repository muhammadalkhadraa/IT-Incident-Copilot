import React from 'react';
import type { AuditLogEntry } from '../../types';
import { ShieldCheck, Bot, User, Clock, Activity } from 'lucide-react';

interface AuditTrailPanelProps {
  auditTrail: AuditLogEntry[];
}

export const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({ auditTrail }) => {
  const getActorBadge = (entry: AuditLogEntry) => {
    switch (entry.actorType) {
      case 'AI':
        return <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono flex items-center gap-1"><Bot className="w-3 h-3 text-purple-400" /> AI Copilot</span>;
      case 'SYSTEM':
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono flex items-center gap-1"><Activity className="w-3 h-3 text-cyan-400" /> System Engine</span>;
      case 'TECHNICIAN':
        return <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono flex items-center gap-1"><User className="w-3 h-3 text-cyan-400" /> {entry.actor}</span>;
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl glass-panel border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            IMMUTABLE COMPLIANCE AUDIT TRAIL
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological ledger recording telemetry ingestion, diagnostic rule runs, AI inference, approvals, and script executions.
          </p>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800">
          ● Cryptographically Signed
        </span>
      </div>

      {/* Chronological Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {auditTrail.map((entry) => (
          <div key={entry.id} className="relative flex items-start gap-4">
            
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>

            <div className="flex-1 p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {getActorBadge(entry)}
                  <span className="font-mono text-xs font-bold text-slate-300">{entry.actionType}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                {entry.details}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
