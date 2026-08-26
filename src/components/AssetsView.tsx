import React, { useState } from 'react';
import { Cpu, HardDrive, Wifi, ShieldCheck, Activity, Search, RefreshCcw, Server } from 'lucide-react';

export const AssetsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const devices = [
    {
      id: 'DEV-WIN-9821',
      hostname: 'HOST-EXEC-PRT04.corp.internal',
      os: 'Windows Server 2022 DataCenter (21H2)',
      ipAddress: '10.140.12.88',
      gateway: '10.140.0.1',
      dns: ['10.140.0.10', '10.140.0.11'],
      agentVersion: 'v4.8.2-enterprise',
      status: 'CRITICAL',
      cpuPct: 98.4,
      ramPct: 97.2,
      diskPct: 67.0,
      latencyMs: 24,
      lastHeartbeat: '10 seconds ago',
      services: [
        { name: 'spoolsv.exe', status: 'CRITICAL_LEAK', ramMb: 2840 },
        { name: 'dnscache.exe', status: 'RUNNING', ramMb: 14.2 },
        { name: 'wuauserv.exe', status: 'RUNNING', ramMb: 32.1 },
        { name: 'sshd.exe', status: 'RUNNING', ramMb: 8.4 }
      ]
    },
    {
      id: 'DEV-WIN-4410',
      hostname: 'DC01-AD-AUTH.corp.internal',
      os: 'Windows Server 2022 DataCenter (21H2)',
      ipAddress: '10.140.0.10',
      gateway: '10.140.0.1',
      dns: ['127.0.0.1', '10.140.0.11'],
      agentVersion: 'v4.8.2-enterprise',
      status: 'HEALTHY',
      cpuPct: 22.1,
      ramPct: 48.5,
      diskPct: 42.0,
      latencyMs: 4,
      lastHeartbeat: '4 seconds ago',
      services: [
        { name: 'ntds.exe', status: 'RUNNING', ramMb: 1420 },
        { name: 'dns.exe', status: 'RUNNING', ramMb: 410 },
        { name: 'kdc.exe', status: 'RUNNING', ramMb: 180 }
      ]
    },
    {
      id: 'DEV-WIN-1092',
      hostname: 'SQL-PROD-CLUSTER01.corp.internal',
      os: 'Windows Server 2022 Enterprise (21H2)',
      ipAddress: '10.140.8.44',
      gateway: '10.140.0.1',
      dns: ['10.140.0.10', '10.140.0.11'],
      agentVersion: 'v4.8.2-enterprise',
      status: 'HEALTHY',
      cpuPct: 44.8,
      ramPct: 82.1,
      diskPct: 78.4,
      latencyMs: 8,
      lastHeartbeat: '8 seconds ago',
      services: [
        { name: 'sqlservr.exe', status: 'RUNNING', ramMb: 12840 },
        { name: 'sqlagent.exe', status: 'RUNNING', ramMb: 120 }
      ]
    }
  ];

  const filteredDevices = devices.filter(d => 
    d.hostname.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.ipAddress.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* C# Agent Telemetry Banner */}
      <div className="p-5 rounded-2xl glass-panel border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold">
              C# WINDOWS WORKER DAEMON
            </span>
            <h1 className="text-base font-extrabold text-slate-100 font-mono">
              CMDB ASSET INVENTORY & REAL-TIME AGENT TELEMETRY
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Daemon authenticates via <strong>TLS 1.3 HTTPS (`X-Agent-Key`)</strong> with offline queue buffering & System.Diagnostics metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800 shrink-0">
          <ShieldCheck className="w-4 h-4" /> HTTPS + Offline Buffer Active
        </div>
      </div>

      {/* Device Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter endpoints by hostname or IP address e.g., 'HOST-EXEC-PRT04', '10.140.12.88'"
            className="w-full glass-input text-xs pl-10 pr-4 py-2.5 rounded-xl border-slate-700 placeholder:text-slate-500"
          />
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold border border-slate-700 flex items-center gap-2 shrink-0">
          <RefreshCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Poll Agent Heartbeats</span>
        </button>
      </div>

      {/* Device Telemetry Cards Grid */}
      <div className="space-y-4">
        {filteredDevices.map((dev) => (
          <div key={dev.id} className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4 font-mono">
            
            {/* Device Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">{dev.hostname}</h3>
                  <span className="text-xs text-slate-400 font-semibold">({dev.ipAddress})</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{dev.os}</div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-slate-400">Agent {dev.agentVersion}</span>
                <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                  dev.status === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {dev.status} ({dev.lastHeartbeat})
                </span>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-900">
                <div className="text-[10px] text-slate-500 flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU UTILIZATION</div>
                <div className={`text-base font-extrabold mt-0.5 ${dev.cpuPct > 85 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {dev.cpuPct}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-900">
                <div className="text-[10px] text-slate-500 flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-purple-400" /> RAM FOOTPRINT</div>
                <div className={`text-base font-extrabold mt-0.5 ${dev.ramPct > 90 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {dev.ramPct}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-900">
                <div className="text-[10px] text-slate-500 flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-emerald-400" /> DISK STORAGE</div>
                <div className="text-base font-extrabold text-slate-200 mt-0.5">
                  {dev.diskPct}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-900">
                <div className="text-[10px] text-slate-500 flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-sky-400" /> NETWORK LATENCY</div>
                <div className="text-base font-extrabold text-slate-200 mt-0.5">
                  {dev.latencyMs} ms
                </div>
              </div>

            </div>

            {/* Monitored Windows Services */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <div className="text-[10px] text-slate-400 font-bold uppercase">MONITORED WINDOWS SERVICES & PROCESS HEAP</div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {dev.services.map((svc) => (
                  <span
                    key={svc.name}
                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                      svc.status === 'CRITICAL_LEAK' ? 'bg-rose-950/80 text-rose-300 border-rose-800' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="font-bold">{svc.name}</span>
                    <span className="text-[10px] text-slate-400">({svc.ramMb} MB)</span>
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
