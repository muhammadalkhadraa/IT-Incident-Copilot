import React, { useState } from 'react';
import { Bot, Sparkles, Send, CheckCircle2, MessageSquare, BrainCircuit, ShieldAlert, Layers, Tag, Layers2 } from 'lucide-react';
import type { Incident } from '../../types';
import { AICopilotService } from '../../services/aiCopilotService';
import { DiagnosticEngine } from '../../services/diagnosticEngine';
import { PostResolutionSummaryCard } from './PostResolutionSummaryCard';

interface AICopilotPanelProps {
  incident: Incident;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({ incident }) => {
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'USER' | 'COPILOT'; text: string; timestamp: string }>>([
    {
      sender: 'COPILOT',
      text: `Hello! I've received the Stage 1 deterministic evidence payload for incident ${incident.ticketNumber}. I have synthesized the root cause hypothesis with ${incident.aiAnalysis?.primaryHypothesis.confidenceScore}% confidence. How can I assist you with this diagnosis?`,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const analysis = incident.aiAnalysis;

  const stage1Payload = DiagnosticEngine.runStage1EvidenceCollection(incident);

  if (!analysis) {
    return (
      <div className="p-12 text-center glass-panel rounded-2xl border-slate-800">
        <Bot className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-bounce" />
        <h3 className="text-sm font-semibold text-slate-300">AI Copilot Analysis Pending</h3>
        <p className="text-xs text-slate-500 mt-1">Ingesting Stage 1 empirical evidence...</p>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    const timestamp = new Date().toLocaleTimeString();

    setChatMessages(prev => [...prev, { sender: 'USER', text: userText, timestamp }]);
    setInputQuery('');

    setTimeout(async () => {
      const response = await AICopilotService.answerQuestion(incident, userText);
      setChatMessages(prev => [...prev, { sender: 'COPILOT', text: response, timestamp: new Date().toLocaleTimeString() }]);
    }, 400);
  };

  const primaryHypothesis = analysis.primaryHypothesis;

  return (
    <div className="space-y-6">
      
      {/* Explicit Stage 1 -> Stage 2 Pipeline Handoff Banner */}
      <div className="p-4 rounded-2xl glass-panel border-purple-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
            STAGE 2 OF 2
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              STAGE 2: GENERATIVE AI REASONING & EVIDENCE SYNTHESIS
            </h3>
            <p className="text-[11px] text-slate-400">
              AI receives structured Stage 1 rule payload: <strong className="text-cyan-300 font-mono">"{stage1Payload.ruleConclusion}"</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" /> LLM Isolated from Raw Threshold Checks
        </div>
      </div>

      {/* AI Classification & Subcategory Card */}
      <div className="p-4 rounded-2xl glass-panel border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="border-r border-slate-800 pr-2">
          <div className="text-[10px] text-slate-500 flex items-center gap-1"><Tag className="w-3 h-3 text-cyan-400" /> AI CATEGORY</div>
          <div className="font-bold text-slate-200 mt-0.5">{incident.category}</div>
        </div>

        <div className="border-r border-slate-800 pr-2">
          <div className="text-[10px] text-slate-500 flex items-center gap-1"><Layers2 className="w-3 h-3 text-purple-400" /> SUBCATEGORY</div>
          <div className="font-bold text-purple-300 mt-0.5">{primaryHypothesis.rootCauseCategory}</div>
        </div>

        <div className="border-r border-slate-800 pr-2">
          <div className="text-[10px] text-slate-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-amber-400" /> RECOMMENDED PRIORITY</div>
          <div className="font-bold text-amber-400 mt-0.5">P2 - {incident.severity} ({primaryHypothesis.confidenceScore}% Conf)</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> CLASSIFICATION REASON</div>
          <div className="text-[11px] text-slate-300 truncate mt-0.5">{primaryHypothesis.title}</div>
        </div>
      </div>

      {/* Post-Resolution Summary Card (Rendered if ticket is RESOLVED or CLOSED) */}
      {(incident.status === 'RESOLVED' || incident.status === 'CLOSED') && (
        <PostResolutionSummaryCard incident={incident} />
      )}

      {/* AI Summary Banner */}
      <div className="p-5 rounded-2xl glass-panel border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-900 to-cyan-950/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 font-mono">
                AI ROOT CAUSE DIAGNOSIS & SYNTHESIS
              </h3>
            </div>

            <h2 className="text-base font-bold text-slate-100">
              {primaryHypothesis.title}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Confidence Score Ring Gauge */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-800/40 text-center shrink-0 min-w-[130px]">
            <div className="text-[10px] text-purple-300 font-mono uppercase font-bold">Confidence</div>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 mt-0.5">
              {primaryHypothesis.confidenceScore}%
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> High Certainty
            </div>
          </div>

        </div>
      </div>

      {/* Reasoning Chain & Evidence Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Reasoning Chain */}
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            AI REASONING CHAIN & INFERENCE STEPS
          </h4>

          <div className="space-y-2.5 pt-1">
            {primaryHypothesis.reasoningChain.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-cyan-800">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Cited & Recommended Resolution */}
        <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              EVIDENCE CORRELATED FROM STAGE 1 RULES & TELEMETRY
            </h4>

            <div className="space-y-1.5 font-mono text-xs text-slate-400">
              {primaryHypothesis.evidenceFound.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                  <span className="text-cyan-400">•</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Recommended Action Playbook</div>
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs font-semibold text-cyan-300">
              {primaryHypothesis.recommendedFix}
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Copilot Chat Box */}
      <div className="p-5 rounded-2xl glass-panel border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            INTERACTIVE COPILOT ASSISTANT
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Ask about Stage 1 evidence, logs, or recommended fixes</span>
        </div>

        {/* Chat History Container */}
        <div className="bg-[#05080f] rounded-xl p-4 border border-slate-800 space-y-3 max-h-64 overflow-y-auto">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 text-xs ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'COPILOT' && (
                <div className="w-7 h-7 rounded-lg bg-purple-900/60 border border-purple-700 text-cyan-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`p-3 rounded-xl max-w-lg leading-relaxed ${
                msg.sender === 'USER'
                  ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}>
                <p>{msg.text}</p>
                <div className="text-[9px] opacity-60 text-right mt-1 font-mono">{msg.timestamp}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Q&A Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Copilot e.g., 'Why did this happen?', 'What is the safest fix?', 'Have we seen this before?'"
            className="flex-1 glass-input text-xs px-4 py-2.5 rounded-xl border-slate-700/80 placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs shadow-glow-cyan hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
