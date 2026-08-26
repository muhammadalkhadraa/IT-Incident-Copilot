import React, { useState } from 'react';
import { Zap, Radio, Plus } from 'lucide-react';
import { AutomationWebhookEngine } from '../services/automationWebhookEngine';

export const AutomationsView: React.FC = () => {
  const [logs] = useState(AutomationWebhookEngine.getLogs());

  const rules = [
    {
      id: 'rule-1',
      name: 'P1 Critical Escalation Rule',
      when: 'WHEN incident priority becomes Critical (P1)',
      then: 'THEN notify IT Manager via n8n PagerDuty & SMS Webhook',
      endpoint: 'http://localhost:5678/webhook/p1-critical-alert',
      enabled: true,
      executions: 42
    },
    {
      id: 'rule-2',
      name: 'Unacknowledged Ticket SLA Breach',
      when: 'WHEN incident is unacknowledged after 15 minutes',
      then: 'THEN escalate ticket & reassign to Tier-3 Senior Lead',
      endpoint: 'http://localhost:5678/webhook/sla-escalation',
      enabled: true,
      executions: 18
    },
    {
      id: 'rule-3',
      name: 'Ticket Resolution Notification',
      when: 'WHEN incident status changes to Resolved',
      then: 'THEN send resolution email & survey to user',
      endpoint: 'http://localhost:5678/webhook/user-resolution-notify',
      enabled: true,
      executions: 129
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Automations Engine Header */}
      <div className="p-5 rounded-2xl glass-panel border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold">
              WHEN-THEN RULES ENGINE
            </span>
            <h1 className="text-base font-extrabold text-slate-100 font-mono">
              AUTOMATION RULES & n8n SECURE WEBHOOK PIPELINE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated event-driven triggers dispatches with HMAC SHA-256 signatures to n8n workflows.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold text-xs shadow-glow-cyan hover:opacity-90 transition-all shrink-0">
          <Plus className="w-4 h-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {/* WHEN-THEN Rule Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          ACTIVE WHEN-THEN AUTOMATION RULES ({rules.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3 flex flex-col justify-between">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{rule.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold">
                    ENABLED
                  </span>
                </div>

                {/* WHEN clause */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-amber-400 font-bold">WHEN:</span> <span className="text-slate-300">{rule.when.replace('WHEN ', '')}</span>
                </div>

                {/* THEN clause */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-cyan-400 font-bold">THEN:</span> <span className="text-slate-300">{rule.then.replace('THEN ', '')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="truncate max-w-[180px]">{rule.endpoint}</span>
                <span className="text-cyan-400 font-bold">{rule.executions} runs</span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Live n8n Webhook Stream Monitor */}
      <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            LIVE n8n WEBHOOK DISPATCH EVENT STREAM (HMAC SHA-256 SIGNED)
          </h3>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">http://localhost:5678/webhook/*</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {logs.map((log) => (
            <div key={log.id} className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                    {log.eventType}
                  </span>
                  <span className="text-slate-200 font-bold">{log.ruleName}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">{log.status}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Target: <code className="text-cyan-300">{log.targetEndpoint}</code></span>
                <span>•</span>
                <span className="text-purple-400">Signature: {log.hmacSignature}</span>
              </div>

              <div className="p-2.5 bg-[#05080f] rounded-lg text-emerald-400 text-[11px] border border-slate-900 overflow-x-auto">
                {log.payloadJson}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
