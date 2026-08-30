import React, { useState } from 'react';
import type { DiagnosticRuleResult, Incident } from '../../types';
import { DiagnosticEngine } from '../../services/diagnosticEngine';
import { DiagnosticTestRunner } from '../../services/diagnosticFramework';
import { IndependentRuleEngine } from '../../services/ruleEngine';
import { CheckCircle2, AlertCircle, Play, Activity, Wifi, Code2, GitBranch } from 'lucide-react';

interface DiagnosticRulesPanelProps {
  incident?: Incident;
  results: DiagnosticRuleResult[];
  onReRunDiagnostics: () => void;
}

export const DiagnosticRulesPanel: React.FC<DiagnosticRulesPanelProps> = ({ 
  incident,
  results, 
  onReRunDiagnostics 
}) => {
  const [showJsonEvidence, setShowJsonEvidence] = useState(false);
  const [showRuleTraces, setShowRuleTraces] = useState(true);

  // Run Stage 1 empirical tests & independent decision tree rule engine
  const stage1Payload = incident ? DiagnosticEngine.runStage1EvidenceCollection(incident) : null;
  const structuredEvidence = incident ? DiagnosticTestRunner.runAllTests(incident) : [];
  const decisionTreeResults = incident ? IndependentRuleEngine.evaluateDecisionTree(incident) : [];

  // Calculate pass/fail/warning counts directly from visible decision tree rules & empirical tests
  const visibleRuleStatuses = decisionTreeResults.length > 0
    ? decisionTreeResults.map(r => ({ status: r.status === 'TRIGGERED' ? 'FAIL' : 'PASS' }))
    : results.map(r => ({ status: r.status }));

  const empiricalTests = stage1Payload ? stage1Payload.tests : [];
  const allVisibleChecks = [
    ...empiricalTests.map(t => ({ status: t.status })),
    ...visibleRuleStatuses
  ];

  const passCount = allVisibleChecks.filter(r => r.status === 'PASS').length;
  const failCount = allVisibleChecks.filter(r => r.status === 'FAIL').length;
  const warnCount = allVisibleChecks.filter(r => r.status === 'WARN').length;

  return (
    <div className="space-y-6">
      
      {/* Stage 1 Pipeline Architecture Header */}
      <div className="p-5 rounded-2xl glass-panel border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold">
                INDEPENDENT DECISION TREE
              </span>
              <h3 className="text-sm font-extrabold text-slate-100 font-mono">
                DETERMINISTIC IF-THEN RULE ENGINE & CONDITION TRACER
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates boolean condition trees (`IF gateway reachable AND DNS fails THEN DNS_FAILURE`). <strong>Zero AI dependency.</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowRuleTraces(!showRuleTraces)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-all"
            >
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showRuleTraces ? 'Hide Condition Traces' : 'Show Condition Traces'}</span>
            </button>

            <button
              onClick={() => setShowJsonEvidence(!showJsonEvidence)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>JSON Payload</span>
            </button>

            <button
              onClick={onReRunDiagnostics}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Re-Evaluate Decision Tree</span>
            </button>
          </div>
        </div>
      </div>

      {/* Raw Structured Evidence JSON Viewer Panel */}
      {showJsonEvidence && (
        <div className="p-4 rounded-xl bg-[#05080f] border border-cyan-800/60 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px]">
            <span>STRUCTURED EVIDENCE PAYLOAD (IDiagnosticTest Output Format)</span>
            <span className="text-slate-500">{structuredEvidence.length} Plugins Executed</span>
          </div>
          <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 overflow-x-auto text-[11px] leading-relaxed border border-slate-900">
            {JSON.stringify(structuredEvidence, null, 2)}
          </pre>
        </div>
      )}

      {/* Decision Tree Condition Evaluation Trace Debugger */}
      {showRuleTraces && decisionTreeResults.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              STEP-BY-STEP RULE CONDITION EVALUATION TRACE (DEBUGGER)
            </h4>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">100% Deterministic & Testable</span>
          </div>

          <div className="space-y-3">
            {decisionTreeResults.map((rule) => (
              <div
                key={rule.ruleCode}
                className={`p-4 rounded-xl glass-panel border space-y-2 ${
                  rule.status === 'TRIGGERED' ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-slate-400">{rule.ruleCode}</span>
                    <span className="text-slate-200 font-sans font-bold">{rule.ruleName}</span>
                  </div>

                  {rule.status === 'TRIGGERED' ? (
                    <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                      RULE TRIGGERED ➔ {rule.diagnosisCode}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                      CONDITION PASSED
                    </span>
                  )}
                </div>

                {/* Step-by-Step Condition Trace */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 font-mono text-xs text-slate-300">
                  {rule.conditionTrace.map((cond, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cond.satisfied ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span>IF {cond.condition}</span>
                      </div>
                      <span className={cond.satisfied ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        {cond.evidence}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 1 Empirical Network & System Test Matrix */}
      {stage1Payload && (
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              STAGE 1 EMPIRICAL TECHNICAL TESTS & EVIDENCE GRID
            </h4>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">{stage1Payload.tests.length} Empirical Checks Evaluated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stage1Payload.tests.map((test) => (
              <div
                key={test.id}
                className={`p-3.5 rounded-xl glass-panel border flex flex-col justify-between space-y-2 ${
                  test.status === 'FAIL' ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{test.testName}</span>
                  {test.status === 'PASS' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PASS
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> FAIL
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">{test.details}</p>

                {test.latencyMs !== undefined && (
                  <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <span>Latency:</span>
                    <span className={test.latencyMs > 200 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{test.latencyMs} ms</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Stage 1 Deterministic Conclusion Banner */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-center gap-3 text-xs text-cyan-300 font-mono">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <strong>Structured Evidence Output:</strong> {stage1Payload.ruleConclusion}
            </div>
          </div>
        </div>
      )}

      {/* Summary Score Badges */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3.5 rounded-xl glass-panel border-slate-800 text-center">
          <div className="text-[10px] text-emerald-400 font-mono uppercase font-bold">PASSED RULES</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{passCount}</div>
        </div>
        <div className="p-3.5 rounded-xl glass-panel border-slate-800 text-center">
          <div className="text-[10px] text-amber-400 font-mono uppercase font-bold">WARNINGS</div>
          <div className="text-xl font-extrabold text-amber-400 mt-0.5">{warnCount}</div>
        </div>
        <div className="p-3.5 rounded-xl glass-panel border-slate-800 text-center">
          <div className="text-[10px] text-rose-400 font-mono uppercase font-bold">FAILED RULES</div>
          <div className="text-xl font-extrabold text-rose-400 mt-0.5">{failCount}</div>
        </div>
      </div>

    </div>
  );
};
