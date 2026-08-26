import React from 'react';
import { CheckCircle2, ShieldCheck, Wrench, AlertTriangle, FileText } from 'lucide-react';
import type { Incident } from '../../types';

interface PostResolutionSummaryCardProps {
  incident: Incident;
}

export const PostResolutionSummaryCard: React.FC<PostResolutionSummaryCardProps> = ({ incident }) => {
  return (
    <div className="p-5 rounded-2xl glass-panel border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 space-y-4 font-mono text-xs">
      
      <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">
            AI POST-RESOLUTION SUMMARY & AUDIT POST-MORTEM
          </h3>
        </div>

        <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold text-[10px]">
          RESOLVED & SIGNED OFF
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        
        {/* Root Cause */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 font-bold uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> 1. Root Cause
          </div>
          <p className="text-slate-200 leading-relaxed font-mono text-[11px]">
            Print Spooler heap memory exhaustion (2.84 GB committed) caused by faulting HP UPD driver binary <code className="text-cyan-300">hpzpui64.dll</code> during corrupt PDF processing.
          </p>
        </div>

        {/* Resolution Applied */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 font-bold uppercase">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" /> 2. Resolution Applied
          </div>
          <p className="text-slate-200 leading-relaxed font-mono text-[11px]">
            Executed automated playbook <code className="text-cyan-300">ACT-SYS-RESTART-SPOOLER</code>. Purged 14 orphaned print spool files and restarted <code className="text-cyan-300">spoolsv.exe</code>.
          </p>
        </div>

        {/* Affected Service */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 font-bold uppercase">
            <FileText className="w-3.5 h-3.5 text-purple-400" /> 3. Affected Service
          </div>
          <p className="text-slate-200 font-mono text-[11px]">
            {incident.affectedService || 'Enterprise Print Management & Executive Workstations'}
          </p>
        </div>

        {/* Preventive Recommendation */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 4. Preventive Recommendation
          </div>
          <p className="text-slate-200 leading-relaxed font-mono text-[11px]">
            Deploy updated Type-4 UPD driver package across Executive OU and enable nightly spooler queue buffer sanitization cron.
          </p>
        </div>

      </div>

    </div>
  );
};
