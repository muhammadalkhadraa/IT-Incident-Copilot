import React, { useState } from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  ShieldAlert,
  LayoutList,
  Grid
} from 'lucide-react';
import type { Incident, IncidentSeverity, IncidentStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface IncidentListProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  onNewIncidentClick: () => void;
  searchQuery: string;
  onAcceptTicket?: (incidentId: string) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onNewIncidentClick,
  searchQuery,
  onAcceptTicket
}) => {
  const { t } = useLanguage();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('TABLE');

  // Filtered incidents logic
  const filtered = incidents.filter(incident => {
    const matchesSearch = searchQuery === '' || 
      incident.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.deviceTelemetry.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.affectedService.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || incident.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] font-mono tracking-wider">P1 - CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] font-mono tracking-wider">P2 - HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded bg-sky-600 text-white font-bold text-[10px] font-mono tracking-wider">P3 - MEDIUM</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold text-[10px] font-mono tracking-wider">P4 - LOW</span>;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] uppercase font-mono">NEW</span>;
      case 'DIAGNOSING':
        return <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 text-[10px] uppercase font-mono font-bold">DIAGNOSING</span>;
      case 'AWAITING_APPROVAL':
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 text-[10px] uppercase font-mono font-bold">APPROVAL QUEUED</span>;
      case 'REMEDIATING':
        return <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 text-[10px] uppercase font-mono font-bold">REMEDIATING</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] uppercase font-mono font-bold">RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 text-[10px] uppercase font-mono">CLOSED</span>;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Metric Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl glass-panel flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase">ACTIVE INCIDENTS</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {incidents.filter(i => i.status !== 'RESOLVED').length}
            </div>
            <div className="text-[10px] text-cyan-400 mt-0.5 font-mono">Auto-Diagnosing Active</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase">P1 CRITICAL SEVERITY</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-0.5">
              {incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length}
            </div>
            <div className="text-[10px] text-rose-400 mt-0.5 font-mono">Executive SLA Guard Active</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase">APPROVAL QUEUE</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-0.5">
              {incidents.filter(i => i.status === 'AWAITING_APPROVAL').length}
            </div>
            <div className="text-[10px] text-amber-300 mt-0.5 font-mono">Requires Tier-2 Sign-off</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase">AI DIAGNOSIS ACCURACY</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
              96.4%
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">pgvector RAG Validated</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl glass-panel">
        
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter:</span>
          </div>

          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono transition-all ${
                  severityFilter === sev
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input text-xs px-3 py-1.5 rounded-lg text-slate-300 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="DIAGNOSING">Diagnosing</option>
            <option value="AWAITING_APPROVAL">Awaiting Approval</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* View Mode Toggle & Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === 'TABLE' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Datagrid View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('CARD')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === 'CARD' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onNewIncidentClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Telemetry Alert</span>
          </button>
        </div>

      </div>

      {/* Datagrid Table View */}
      {viewMode === 'TABLE' ? (
        <div className="rounded-xl glass-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="p-3">{t('ticketNumber')}</th>
                <th className="p-3">{t('severity')}</th>
                <th className="p-3">{t('title')}</th>
                <th className="p-3">{t('hostname')}</th>
                <th className="p-3">{t('status')}</th>
                <th className="p-3 text-right">{t('confidence')}</th>
                <th className="p-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((incident) => {
                const isSelected = selectedIncidentId === incident.id;
                const confidence = incident.aiAnalysis?.primaryHypothesis.confidenceScore;

                return (
                  <tr
                    key={incident.id}
                    onClick={() => onSelectIncident(incident.id)}
                    className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-800/80 border-l-4 border-l-cyan-400' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {incident.ticketNumber}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {getSeverityBadge(incident.severity)}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-200 line-clamp-1">{incident.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 font-mono">{incident.affectedService}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap">
                      {incident.deviceTelemetry.hostname}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {getStatusBadge(incident.status)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {confidence ? `${confidence}%` : 'N/A'}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {incident.status === 'NEW' && onAcceptTicket && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcceptTicket(incident.id);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all inline-flex items-center gap-1 shadow-glow-emerald mr-1.5 font-mono"
                          title="Accept ticket into queue and begin diagnosis"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Accept Ticket</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(incident.id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white border border-slate-700 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      >
                        <span>{t('viewWorkstation')}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="space-y-3">
          {filtered.map((incident) => (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident.id)}
              className="p-4 rounded-xl glass-panel glass-panel-hover border border-slate-800 cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {incident.ticketNumber}
                  </span>
                  {getSeverityBadge(incident.severity)}
                  {getStatusBadge(incident.status)}
                </div>

                <span className="text-xs font-mono text-slate-400">{incident.deviceTelemetry.hostname}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{incident.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{incident.description}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
