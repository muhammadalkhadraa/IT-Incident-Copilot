import React from 'react';
import type { Incident } from '../../types';
import { SimilarIncidentService } from '../../services/similarIncidentService';
import { RagKnowledgeService } from '../../services/ragKnowledgeService';
import { BookOpen, CheckCircle2, FileText, ArrowUpRight, History, Sparkles, Wrench, AlertTriangle } from 'lucide-react';

interface SimilarIncidentsPanelProps {
  incident: Incident;
}

export const SimilarIncidentsPanel: React.FC<SimilarIncidentsPanelProps> = ({ incident }) => {
  const similarTickets = SimilarIncidentService.findSimilarIncidents(incident.title);
  const ragChunks = RagKnowledgeService.searchVectorKnowledgeBase(incident.title);

  return (
    <div className="space-y-6">
      
      {/* Similar Incident Vector Search Header */}
      <div className="p-5 rounded-2xl glass-panel border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold">
                pgvector HISTORICAL TICKET MATCH
              </span>
              <h3 className="text-sm font-extrabold text-slate-100 font-mono">
                VECTOR CLUSTERING & SIMILAR HISTORICAL TICKETS
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates 1536d cosine distance between active ticket and closed historical incident database.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800 shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Vector Similarity Engine
          </div>
        </div>
      </div>

      {/* Similar Incident Cards Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          TOP SIMILAR HISTORICAL INCIDENTS
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {similarTickets.map((tkt) => (
            <div key={tkt.ticketNumber} className="p-5 rounded-2xl glass-panel border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 space-y-4 font-mono">
              
              {/* Ticket Header & Match Percentage Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-cyan-300">{tkt.ticketNumber}</span>
                  <span className="text-[10px] text-slate-500">Closed {tkt.closedAt}</span>
                </div>

                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-extrabold shadow-glow-cyan">
                  {tkt.similarityPercentage}% similarity
                </span>
              </div>

              {/* Root Cause */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Root Cause:
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  {tkt.rootCause}
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-bold uppercase">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" /> Resolution:
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 leading-relaxed font-bold">
                  {tkt.resolution}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* RAG Retrieved Vector Chunks List */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          VERIFIED COMPANY DOCUMENTATION MATCHES ({ragChunks.length})
        </h4>

        <div className="space-y-3">
          {ragChunks.map((chunk) => (
            <div key={chunk.chunkId} className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-100">{chunk.sourceDocument}</span>
                  <span className="text-slate-400 font-semibold">(Page {chunk.pageNumber})</span>
                </div>

                <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px] font-bold">
                  Match Score: {Math.round(chunk.similarityScore * 100)}%
                </span>
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-900">
                "{chunk.chunkText}"
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {chunk.formattedCitation}
                </span>
                <button className="text-slate-400 hover:text-cyan-300 flex items-center gap-0.5 text-[10px] font-bold">
                  View SOP <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
