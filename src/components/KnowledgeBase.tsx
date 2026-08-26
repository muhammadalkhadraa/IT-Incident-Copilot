import React, { useState } from 'react';
import { Search, Upload, BookOpen, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RagKnowledgeService, type VectorChunkResult } from '../services/ragKnowledgeService';

export const KnowledgeBase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VectorChunkResult[]>(
    RagKnowledgeService.searchVectorKnowledgeBase('spooler print memory')
  );
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = RagKnowledgeService.searchVectorKnowledgeBase(query);
    setSearchResults(results);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = RagKnowledgeService.simulateDocumentUpload(file.name, file.name.split('.').pop() || 'txt');
    setUploadStatus(result.status);
    setTimeout(() => setUploadStatus(null), 6000);
  };

  return (
    <div className="space-y-6">
      
      {/* RAG Header & Multi-Format Document Ingestion Toolbar */}
      <div className="p-5 rounded-2xl glass-panel border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold">
              RAG VECTOR STORE (pgvector 1536d)
            </span>
            <h1 className="text-base font-extrabold text-slate-100 font-mono">
              ENTERPRISE RAG KNOWLEDGE BASE & SOP INDEX
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ingest <strong>PDF, TXT, DOCX, Markdown</strong> manuals with automatic 500-char chunking and exact source citations.
          </p>
        </div>

        {/* Upload Document Button */}
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold text-xs shadow-glow-cyan hover:opacity-90 transition-all cursor-pointer shrink-0">
          <Upload className="w-4 h-4" />
          <span>Upload Manual (PDF / TXT / DOCX / MD)</span>
          <input
            type="file"
            accept=".pdf,.txt,.docx,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Confirmation Toast */}
      {uploadStatus && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-800 text-xs font-mono text-emerald-300 flex items-center justify-between shadow-glow-cyan">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadStatus}</span>
          </div>
          <button onClick={() => setUploadStatus(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Vector Cosine Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            SEMANTIC VECTOR SIMILARITY SEARCH (COSINE THRESHOLD ≥ 0.75)
          </label>
          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Grounded — Zero Hallucinations Policy
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search enterprise runbooks e.g., 'print spooler memory leak', 'gateway ping timeout', 'VPN token drift'"
            className="w-full glass-input text-xs pl-10 pr-4 py-2.5 rounded-xl border-slate-700 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Vector Search Results & Grounded Citations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>VECTOR MATCH CHUNKS ({searchResults.length})</span>
          <span>Similarity Cutoff: 75%</span>
        </div>

        {searchResults.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl border-slate-800 text-slate-400 font-mono text-xs space-y-2">
            <ShieldCheck className="w-8 h-8 text-rose-400 mx-auto" />
            <div className="font-bold text-rose-300">No verified company documentation match found for this query.</div>
            <p className="text-[11px] text-slate-500">
              The AI Copilot strictly refuses to fabricate responses when vector similarity falls below the 0.75 threshold.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((chunk) => (
              <div key={chunk.chunkId} className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
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
                  <span className="text-cyan-400 font-bold">{chunk.formattedCitation}</span>
                  <span className="text-slate-500">Chunk ID: {chunk.chunkId}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
