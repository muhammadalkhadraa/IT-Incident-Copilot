import React from 'react';
import { TrendingUp, CheckCircle2, Bot, Zap, BarChart3 } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-extrabold text-slate-100 font-mono">
              EXECUTIVE INCIDENT ANALYTICS & SLA PERFORMANCE METRICS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mean Time To Resolve (MTTR), SLA compliance rates, and AI copilot resolution efficiency statistics.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
          Period: <strong>Last 30 Days</strong>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">MEAN TIME TO RESOLVE (MTTR)</div>
          <div className="text-3xl font-extrabold text-cyan-300">14.2 min</div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> ↓ 64.2% faster vs baseline
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">SLA COMPLIANCE RATE</div>
          <div className="text-3xl font-extrabold text-emerald-400">98.6%</div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 0 P1 SLA Breaches
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">AI REMEDIATION RATE</div>
          <div className="text-3xl font-extrabold text-purple-400">88.4%</div>
          <div className="text-[10px] text-purple-300 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3" /> Playbook Auto-Execution
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-400">TOTAL INCIDENTS PROCESSED</div>
          <div className="text-3xl font-extrabold text-slate-100">428</div>
          <div className="text-[10px] text-slate-400 font-mono">100% Diagnostic Coverage</div>
        </div>
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> INCIDENT VOLUME BY SEVERITY (WEEKLY)
          </h4>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>P1 Critical</span>
                <span className="text-rose-400 font-bold">12 (2.8%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>P2 High</span>
                <span className="text-amber-400 font-bold">48 (11.2%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>P3 Medium</span>
                <span className="text-sky-400 font-bold">242 (56.5%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>P4 Low</span>
                <span className="text-slate-400 font-bold">126 (29.5%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" /> AI COPILOT TIME SAVINGS MATRIX
          </h4>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Manual Diagnosis Time (Avg):</span>
              <span className="font-mono text-rose-400 font-bold">45.0 mins</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">AI Copilot Automated Diagnosis:</span>
              <span className="font-mono text-emerald-400 font-bold">1.2 mins</span>
            </div>
            <div className="flex justify-between font-bold text-cyan-300">
              <span>Total Hours Saved This Month:</span>
              <span className="font-mono text-lg text-cyan-400">312.4 Hours</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
