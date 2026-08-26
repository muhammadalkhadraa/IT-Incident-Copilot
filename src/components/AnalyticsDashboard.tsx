import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { BarChart3, Zap, CheckCircle2, TrendingUp } from 'lucide-react';
import type { Incident } from '../types';

interface AnalyticsDashboardProps {
  incidents: Incident[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ incidents }) => {
  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  const categoryData = [
    { name: 'System & Print', count: 18 + activeCount, mttr: 12 },
    { name: 'Networking / DNS', count: 14, mttr: 8 },
    { name: 'Database Infrastructure', count: 9, mttr: 24 },
    { name: 'Security & Auth', count: 11, mttr: 15 },
  ];

  const mttrTrendData = [
    { week: 'Wk 1', mttrMins: 32, copilotFixPct: 45 },
    { week: 'Wk 2', mttrMins: 26, copilotFixPct: 58 },
    { week: 'Wk 3', mttrMins: 19, copilotFixPct: 70 },
    { week: 'Wk 4', mttrMins: 14, copilotFixPct: 78 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100 font-mono">
              INCIDENT METRICS & COPILOT SLA INSIGHTS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical reporting on Mean Time to Detect (MTTD), Mean Time to Resolve (MTTR), and AI Playbook acceptance rates.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Mean Time To Detect (MTTD)</div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1 flex items-baseline gap-2">
            1.8 <span className="text-xs font-normal text-slate-400 font-mono">minutes</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" /> 42% faster via automated rules
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Mean Time To Resolve (MTTR)</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1 flex items-baseline gap-2">
            14.2 <span className="text-xs font-normal text-slate-400 font-mono">minutes</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> Target SLA &lt; 30m achieved
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Copilot Auto-Fix Acceptance</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 flex items-baseline gap-2">
            78% <span className="text-xs font-normal text-slate-400 font-mono">of incidents</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <Zap className="w-3 h-3" /> 0 security bypasses
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Overall SLA Attainment</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 flex items-baseline gap-2">
            99.4%
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            32 of 32 SLA Tier 1 met
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: MTTR Trend */}
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center justify-between">
            <span>MTTR REDUCTION VS COPILOT ADOPTION</span>
            <span className="text-[10px] text-cyan-400 font-mono">4-WEEK METRIC</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mttrTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="mttrMins" name="MTTR (mins)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="copilotFixPct" name="Copilot Fix %" stroke="#00f2fe" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center justify-between">
            <span>INCIDENTS BY DOMAIN CATEGORY</span>
            <span className="text-[10px] text-purple-400 font-mono">VOLUME & RESOLUTION TIME</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Total Tickets" fill="#7928ca" radius={[6, 6, 0, 0]} />
                <Bar dataKey="mttr" name="Avg MTTR (mins)" fill="#00f2fe" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
