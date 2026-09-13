import React from 'react';
import { TrendingUp, CheckCircle2, Bot, Zap, BarChart3 } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-extrabold text-slate-100">
              Support Desk Overview & Statistics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Summary of support response time, resolved tickets, and category breakdown.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-400 font-medium">
          Period: <strong>This Month</strong>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Average Resolution Time</div>
          <div className="text-3xl font-extrabold text-cyan-300">14 mins</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> 64% faster response rate
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Satisfaction Rate</div>
          <div className="text-3xl font-extrabold text-emerald-400">98.6%</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Happy user ratings
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">AI Solution Accuracy</div>
          <div className="text-3xl font-extrabold text-purple-400">92%</div>
          <div className="text-xs text-purple-300 flex items-center gap-1 font-medium mt-1">
            <Zap className="w-3.5 h-3.5" /> Quick troubleshooting tips
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Resolved Tickets</div>
          <div className="text-3xl font-extrabold text-slate-100">428</div>
          <div className="text-xs text-slate-400 font-medium mt-1">100% resolved on time</div>
        </div>
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Tickets by Priority
          </h4>

          <div className="space-y-3.5 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Urgent</span>
                <span className="text-rose-400 font-bold">12 tickets (3%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>High</span>
                <span className="text-amber-400 font-bold">48 tickets (11%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Medium</span>
                <span className="text-sky-400 font-bold">242 tickets (56%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Low</span>
                <span className="text-slate-400 font-bold">126 tickets (30%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" /> Support Team Efficiency
          </h4>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Average First Response Time:</span>
              <span className="text-emerald-400 font-bold">3.5 minutes</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">First-Contact Resolution Rate:</span>
              <span className="text-cyan-400 font-bold">84%</span>
            </div>
            <div className="flex justify-between font-bold text-slate-100 pt-1">
              <span>Saved Support Hours This Month:</span>
              <span className="text-base text-cyan-400">312 Hours</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
