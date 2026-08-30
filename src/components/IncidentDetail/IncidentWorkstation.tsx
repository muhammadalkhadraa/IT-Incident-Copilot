import React, { useState } from 'react';
import type { Incident, PlaybookAction, IncidentStatus } from '../../types';
import { IncidentStateMachine } from '../../services/incidentStateMachine';
import { PriorityCalculator } from '../../services/priorityCalculator';
import { 
  ArrowLeft, 
  Activity, 
  SlidersHorizontal, 
  // BookOpen, 
  Terminal, 
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  BarChart2,
  Users,
  ShieldAlert,
  Building
} from 'lucide-react';
import { TelemetryPanel } from './TelemetryPanel';
import { DiagnosticRulesPanel } from './DiagnosticRulesPanel';
// import { AICopilotPanel } from './AICopilotPanel'; (Reserved for future work)
import { SimilarIncidentsPanel } from './SimilarIncidentsPanel';
import { ActionApprovalTerminal } from './ActionApprovalTerminal';
import { AuditTrailPanel } from './AuditTrailPanel';

interface IncidentWorkstationProps {
  incident: Incident;
  onBack: () => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus, reopenReason?: string) => void;
  onExecutePlaybook: (action: PlaybookAction, approverName?: string) => Promise<void>;
  onReRunDiagnostics: () => void;
}

export const IncidentWorkstation: React.FC<IncidentWorkstationProps> = ({
  incident,
  onBack,
  onUpdateStatus,
  onExecutePlaybook,
  onReRunDiagnostics
}) => {
  const [activeStep, setActiveStep] = useState<string>('diagnostics');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Compute multi-factor priority breakdown
  const priorityInfo = PriorityCalculator.evaluateIncidentPriority(incident);

  const steps = [
    { id: 'telemetry', label: '1. Telemetry & Evidence', icon: Activity },
    { id: 'diagnostics', label: '2. Diagnostic Rules', icon: SlidersHorizontal },
    // { id: 'ai-copilot', label: '3. AI Copilot Diagnosis (Future Feature)', icon: Bot, highlight: true },
    // { id: 'rag-similar', label: '3. Similar Incidents (RAG) (Future Feature)', icon: BookOpen },
    { id: 'action-runner', label: '3. Action & Approval', icon: Terminal },
    { id: 'audit-trail', label: '4. Compliance Audit', icon: ShieldCheck },
  ];

  const handleStatusSelect = (targetStatus: IncidentStatus) => {
    setTransitionError(null);

    // Guard: Prevent illegal transitions
    if (!IncidentStateMachine.canTransition(incident.status, targetStatus)) {
      setTransitionError(`Illegal Transition: Cannot jump directly from ${incident.status} to ${targetStatus}.`);
      return;
    }

    // Special Guard: Reopening CLOSED ticket requires explicit reason modal
    if (incident.status === 'CLOSED' && targetStatus === 'NEW') {
      setShowReopenModal(true);
      return;
    }

    onUpdateStatus(incident.id, targetStatus);
  };

  const handleConfirmReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    onUpdateStatus(incident.id, 'NEW', reopenReason);
    setShowReopenModal(false);
    setReopenReason('');
  };

  const validNextStatuses = IncidentStateMachine.getValidNextStatuses(incident.status);

  return (
    <div className="space-y-6">
      
      {/* Transition Error Alert Banner */}
      {transitionError && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-xs font-mono text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{transitionError}</span>
          </div>
          <button onClick={() => setTransitionError(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Workstation Header & Priority Calculation Scorecard */}
      <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              title="Back to Incidents Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {incident.ticketNumber}
                </span>
                <span className="text-xs text-slate-400 font-mono">Device: {incident.deviceTelemetry.hostname}</span>
              </div>
              <h1 className="text-lg font-extrabold text-slate-100 mt-1">{incident.title}</h1>
            </div>
          </div>

          {/* State Machine Status Switcher Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {incident.status === 'NEW' && (
              <button
                onClick={() => handleStatusSelect('DIAGNOSING')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald transition-all shrink-0 font-mono"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Accept Ticket into Queue</span>
              </button>
            )}

            <span className="text-xs text-slate-400 font-mono">State Machine:</span>
            
            {incident.status === 'CLOSED' ? (
              <button
                onClick={() => setShowReopenModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 font-bold text-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>CLOSED (Click to Reopen)</span>
              </button>
            ) : (
              <select
                value={incident.status}
                onChange={(e) => handleStatusSelect(e.target.value as IncidentStatus)}
                className="glass-input text-xs px-3 py-1.5 rounded-xl border-slate-700 font-bold text-cyan-300 bg-slate-900"
              >
                <option value={incident.status}>{incident.status} (Current)</option>
                {validNextStatuses.map((st) => (
                  <option key={st} value={st}>
                    → Transition to {st}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Multi-Factor Priority Engine Breakdown Badge Bar */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="border-r border-slate-800 pr-2">
            <div className="text-[10px] text-slate-500 flex items-center gap-1"><BarChart2 className="w-3 h-3 text-cyan-400" /> COMPOSITE SCORE</div>
            <div className="font-extrabold text-cyan-300 text-sm mt-0.5">{priorityInfo.compositeScore} / 4.0</div>
            <div className="text-[9px] text-slate-400">P1 SLA Priority Threshold</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1"><Building className="w-3 h-3 text-purple-400" /> IMPACT (30%)</div>
            <div className="font-bold text-slate-200 mt-0.5">Score: {priorityInfo.businessImpactScore}/4</div>
            <div className="text-[9px] text-slate-400">Enterprise Service</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1"><Users className="w-3 h-3 text-sky-400" /> USERS (25%)</div>
            <div className="font-bold text-slate-200 mt-0.5">{incident.affectedUsersCount || 150} Users</div>
            <div className="text-[9px] text-slate-400">Score: {priorityInfo.affectedUsersScore}/4</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> CRITICALITY (25%)</div>
            <div className="font-bold text-slate-200 mt-0.5">Score: {priorityInfo.serviceCriticalityScore}/4</div>
            <div className="text-[9px] text-slate-400">Executive SLA Service</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-rose-400" /> SEVERITY (20%)</div>
            <div className="font-bold text-rose-400 mt-0.5">{incident.severity}</div>
            <div className="text-[9px] text-slate-400">Score: {priorityInfo.technicalSeverityScore}/4</div>
          </div>
        </div>

      </div>

      {/* Interactive Step-by-Step Pipeline Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border-slate-800 overflow-x-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-glow-cyan' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content Render */}
      <div className="mt-4">
        {activeStep === 'telemetry' && <TelemetryPanel telemetry={incident.deviceTelemetry} />}
        {activeStep === 'diagnostics' && (
          <DiagnosticRulesPanel 
            incident={incident}
            results={incident.diagnosticResults} 
            onReRunDiagnostics={onReRunDiagnostics} 
          />
        )}
        {/* {activeStep === 'ai-copilot' && <AICopilotPanel incident={incident} />} */}
        {activeStep === 'rag-similar' && <SimilarIncidentsPanel incident={incident} />}
        {activeStep === 'action-runner' && (
          <ActionApprovalTerminal 
            playbooks={incident.recommendedPlaybooks} 
            executionHistory={incident.executionHistory}
            onExecuteAction={(action, approver) => onExecutePlaybook(action, approver)}
          />
        )}
        {activeStep === 'audit-trail' && <AuditTrailPanel auditTrail={incident.auditTrail} />}
      </div>

      {/* Reopen Closed Ticket Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmReopen} className="bg-[#0d131f] border border-rose-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-100">Explicit Reopening Justification Required</h3>
            </div>

            <p className="text-xs text-slate-300">
              Ticket <strong className="text-cyan-300 font-mono">{incident.ticketNumber}</strong> is currently <strong>CLOSED</strong>. To prevent accidental state modification, enter a formal reopening reason for compliance audit logging:
            </p>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Reopening Reason</label>
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={3}
                placeholder="e.g., Symptom recurred after workstation reboot. Re-opening for root cause investigation."
                required
                className="w-full glass-input text-xs p-3 rounded-xl border-slate-700"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-extrabold shadow-glow-rose"
              >
                Reopen Ticket & Log Audit Event
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
