import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Cpu, HardDrive, Network, Server, Terminal, ShieldCheck } from 'lucide-react';
import type { DeviceTelemetry } from '../../types';

interface TelemetryPanelProps {
  telemetry: DeviceTelemetry;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry }) => {
  const latestMetric = telemetry.metrics[telemetry.metrics.length - 1];

  return (
    <div className="space-y-6">
      
      {/* Host Specifications Banner */}
      <div className="p-4 rounded-2xl glass-panel border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className="text-[10px] text-slate-500 font-mono uppercase">Target Device</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1 font-mono">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            {telemetry.hostname}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-mono uppercase">Operating System</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">{telemetry.os}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-mono uppercase">IP Address</div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5 font-mono">{telemetry.ipAddress}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-mono uppercase">Telemetry Agent</div>
          <div className="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            {telemetry.agentVersion} ({telemetry.lastHeartbeat})
          </div>
        </div>
      </div>

      {/* Real-time Metric Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" /> CPU Load
            </span>
            <span className={`font-mono font-bold ${latestMetric?.cpuUsagePct > 85 ? 'text-rose-400' : 'text-cyan-400'}`}>
              {latestMetric?.cpuUsagePct || 0}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-500 ${
                latestMetric?.cpuUsagePct > 85 ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-glow-rose' : 'bg-cyan-500 shadow-glow-cyan'
              }`} 
              style={{ width: `${latestMetric?.cpuUsagePct || 0}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono">
              <HardDrive className="w-4 h-4 text-purple-400" /> Memory Usage
            </span>
            <span className={`font-mono font-bold ${latestMetric?.ramUsagePct > 85 ? 'text-rose-400' : 'text-purple-400'}`}>
              {latestMetric?.ramUsagePct || 0}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-500 ${
                latestMetric?.ramUsagePct > 85 ? 'bg-gradient-to-r from-rose-500 to-purple-600' : 'bg-purple-500 shadow-glow-purple'
              }`} 
              style={{ width: `${latestMetric?.ramUsagePct || 0}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-mono">
              <Network className="w-4 h-4 text-emerald-400" /> Network Latency
            </span>
            <span className={`font-mono font-bold ${latestMetric?.networkLatencyMs > 200 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {latestMetric?.networkLatencyMs || 0} ms
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-500 ${
                latestMetric?.networkLatencyMs > 200 ? 'bg-rose-500' : 'bg-emerald-500'
              }`} 
              style={{ width: `${Math.min(100, ((latestMetric?.networkLatencyMs || 0) / 500) * 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Telemetry Timeseries Chart */}
      <div className="p-5 rounded-2xl glass-panel border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 font-mono mb-4 flex items-center justify-between">
          <span>ENDPOINT PERFORMANCE TELEMETRY STREAM</span>
          <span className="text-[10px] text-cyan-400 font-mono animate-pulse">● LIVE METRIC AGGREGATION</span>
        </h3>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetry.metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7928ca" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7928ca" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="cpuUsagePct" name="CPU %" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="ramUsagePct" name="RAM %" stroke="#7928ca" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Event Logs Terminal */}
      <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            SYSTEM EVENT LOG INGESTION STREAM
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">{telemetry.logs.length} events ingested</span>
        </div>

        <div className="bg-[#05080f] rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
          {telemetry.logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 py-1 border-b border-slate-900/60 last:border-0">
              <span className="text-slate-500 shrink-0">{log.timestamp}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                log.level === 'ERROR' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                log.level === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-300'
              }`}>
                {log.level}
              </span>
              <span className="text-cyan-400 shrink-0">[{log.source} Evt:{log.eventId}]</span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
