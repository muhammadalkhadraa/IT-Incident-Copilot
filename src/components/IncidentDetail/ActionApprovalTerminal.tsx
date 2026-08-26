import React, { useState } from 'react';
import type { PlaybookAction, ActionExecutionResult } from '../../types';
import { HumanInTheLoopSecurity } from '../../services/humanInTheLoopSecurity';
import { Terminal, Lock, Play, AlertOctagon, History } from 'lucide-react';

interface ActionApprovalTerminalProps {
  playbooks: PlaybookAction[];
  executionHistory: ActionExecutionResult[];
  onExecuteAction: (action: PlaybookAction, approverName: string) => Promise<void>;
}

export const ActionApprovalTerminal: React.FC<ActionApprovalTerminalProps> = ({
  playbooks,
  executionHistory,
  onExecuteAction
}) => {
  const [selectedAction, setSelectedAction] = useState<PlaybookAction | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approverName, setApproverName] = useState('Alex Thorne');
  const [authPin, setAuthPin] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleInitiateAction = (action: PlaybookAction) => {
    setSelectedAction(action);
    setShowApprovalModal(true);
  };

  const handleConfirmExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAction || !authPin.trim()) return;

    setIsExecuting(true);
    setShowApprovalModal(false);

    try {
      await onExecuteAction(selectedAction, approverName);
    } finally {
      setIsExecuting(false);
      setSelectedAction(null);
      setAuthPin('');
    }
  };

  return (
    <div className="space-y-6 font-mono">
      
      {/* Human-In-The-Loop Security Architecture Banner */}
      <div className="p-5 rounded-2xl glass-panel border-rose-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                HUMAN-IN-THE-LOOP (HITL) SECURITY
              </span>
              <h3 className="text-sm font-extrabold text-slate-100">
                5-STEP AUTHORIZED AUTOMATION PIPELINE
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              AI recommendations are <strong>STRICTLY FORBIDDEN</strong> from auto-executing account deletions, firewall changes, or credential resets without technician sign-off.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-800 shrink-0">
            <Lock className="w-4 h-4" /> Autonomous Execution Blocked
          </div>
        </div>

        {/* 5-Step HITL Flow Pipeline Visualizer */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-5 gap-2 text-[10px] text-center">
          <div className="p-2 rounded bg-slate-950 text-cyan-300 border border-cyan-800 font-bold">1. AI Recommendation</div>
          <div className="p-2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">2. Technician Approval</div>
          <div className="p-2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">3. Automation</div>
          <div className="p-2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">4. Execution Result</div>
          <div className="p-2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">5. Audit Log</div>
        </div>
      </div>

      {/* Recommended Playbook Actions List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          RECOMMENDED REMEDIATION PLAYBOOKS (REQUIRES TECHNICIAN SIGN-OFF)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playbooks.map((action) => {
            const policy = HumanInTheLoopSecurity.evaluatePolicy(action.code);

            return (
              <div key={action.id} className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3 flex flex-col justify-between">
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">{action.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      policy.riskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {policy.riskLevel} RISK
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 font-sans">{action.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{action.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Est. Duration: {action.estimatedDurationSec}s</span>

                  <button
                    onClick={() => handleInitiateAction(action)}
                    disabled={isExecuting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold text-xs shadow-glow-rose hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize & Execute</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Output History Terminal */}
      <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            AUDITED PLAYBOOK EXECUTION STREAM
          </h4>
          <span className="text-[10px] text-slate-500">{executionHistory.length} Runs Recorded</span>
        </div>

        <div className="bg-[#05080f] rounded-xl p-4 border border-slate-800 space-y-3 max-h-60 overflow-y-auto font-mono text-xs">
          {executionHistory.length === 0 ? (
            <div className="text-slate-500 text-center py-4">No automation scripts executed yet.</div>
          ) : (
            executionHistory.map((log) => (
              <div key={log.actionId} className="p-3 bg-slate-950 rounded-lg border border-slate-900 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300 font-bold">{log.actionId}</span>
                  <span className={log.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {log.success ? 'SUCCESS (Exit Code 0)' : 'FAILED'}
                  </span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  Authorized By: <strong className="text-slate-200">{log.executedBy}</strong> at {new Date(log.startedAt).toLocaleTimeString()}
                </div>
                <pre className="text-emerald-400 text-[10px] pt-1 leading-relaxed overflow-x-auto">
                  {log.outputLog}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interactive Technician Authorization Modal */}
      {showApprovalModal && selectedAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmExecution} className="bg-[#0d131f] border border-rose-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            
            <div className="flex items-center gap-2 text-rose-400">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-100">Technician Authorization Required</h3>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 leading-relaxed font-sans">
              <strong>HITL Security Guardrail:</strong> You are authorizing script <code className="text-cyan-300 font-mono">{selectedAction.code}</code> ({selectedAction.title}). Autonomous AI execution is blocked.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Technician Identity Name</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  required
                  className="w-full glass-input p-2.5 rounded-xl border-slate-700 text-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Authorization Credentials / PIN</label>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Enter Technician Security Token / PIN"
                  required
                  className="w-full glass-input p-2.5 rounded-xl border-slate-700 text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-extrabold shadow-glow-rose flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Confirm Sign-Off & Execute</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
