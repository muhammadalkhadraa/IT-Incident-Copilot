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
}) => {
  const { t } = useLanguage();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('TABLE');

  // Filtered tickets logic
  const filtered = incidents.filter(incident => {
    const matchesSearch = searchQuery === '' || 
      incident.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.reporter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || incident.severity === severityFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'OPEN') {
      matchesStatus = incident.status === 'NEW' || incident.status === 'DIAGNOSING' || incident.status === 'AWAITING_APPROVAL';
    } else if (statusFilter === 'RESOLVED') {
      matchesStatus = incident.status === 'RESOLVED' || incident.status === 'CLOSED';
    } else if (statusFilter !== 'ALL') {
      matchesStatus = incident.status === statusFilter;
    }

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getPriorityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">Urgent</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px]">High</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-[10px]">Medium</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded bg-slate-700/40 text-slate-300 border border-slate-600 font-bold text-[10px]">Low</span>;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-bold">Open</span>;
      case 'DIAGNOSING':
      case 'AWAITING_APPROVAL':
      case 'REMEDIATING':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-bold">In Progress</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">Resolved</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800 text-[10px] font-bold">Closed</span>;
    }
  };

  const totalCount = incidents.length;
  const openCount = incidents.filter(i => i.status === 'NEW' || i.status === 'DIAGNOSING' || i.status === 'AWAITING_APPROVAL').length;
  const inProgressCount = incidents.filter(i => i.status === 'DIAGNOSING' || i.status === 'REMEDIATING').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  return (
    <div className="space-y-5">
      
      {/* Quick Summary Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl glass-panel flex items-center justify-between border border-slate-800/80">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Tickets</div>
            <div className="text-2xl font-extrabold text-white mt-1">{totalCount}</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">All tickets in system</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel flex items-center justify-between border border-slate-800/80">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Open Tickets</div>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1">{openCount}</div>
            <div className="text-[11px] text-cyan-300 mt-0.5">Needs attention</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel flex items-center justify-between border border-slate-800/80">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">In Progress</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{inProgressCount}</div>
            <div className="text-[11px] text-amber-300 mt-0.5">Being handled</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel flex items-center justify-between border border-slate-800/80">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resolved</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{resolvedCount}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Completed</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter Toolbar & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800/80">
        
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filter:</span>
          </div>

          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: 'Urgent' },
              { id: 'HIGH', label: 'High' },
              { id: 'MEDIUM', label: 'Medium' }
            ].map((sev) => (
              <button
                key={sev.id}
                onClick={() => setSeverityFilter(sev.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  severityFilter === sev.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>

          <select
            id="incident-status-filter"
            name="statusFilter"
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input text-xs px-3 py-1.5 rounded-xl text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>

        </div>

        {/* View Toggle & "+ Create Ticket" Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'TABLE' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('CARD')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'CARD' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onNewIncidentClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('raiseNewTicket')}</span>
          </button>
        </div>

      </div>

      {/* Ticket Table View */}
      {viewMode === 'TABLE' ? (
        <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3.5">{t('ticketNumber')}</th>
                <th className="p-3.5">{t('severity')}</th>
                <th className="p-3.5">{t('title')}</th>
                <th className="p-3.5">{t('category')}</th>
                <th className="p-3.5">{t('reporter')}</th>
                <th className="p-3.5">{t('status')}</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((incident) => {
                const isSelected = selectedIncidentId === incident.id;

                return (
                  <tr
                    key={incident.id}
                    onClick={() => onSelectIncident(incident.id)}
                    className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-800/80 border-l-4 border-l-cyan-400' : ''
                    }`}
                  >
                    <td className="p-3.5 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {incident.ticketNumber}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getPriorityBadge(incident.severity)}
                    </td>
                    <td className="p-3.5 max-w-xs md:max-w-md">
                      <div className="font-bold text-slate-100 text-sm">{incident.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {incident.description}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[11px]">
                        {incident.category || incident.affectedService}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 whitespace-nowrap">
                      {incident.reporter}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(incident.status)}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(incident.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white border border-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                      >
                        <span>{t('viewWorkstation')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((incident) => (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident.id)}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/40 cursor-pointer space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-800">
                    {incident.ticketNumber}
                  </span>
                  {getPriorityBadge(incident.severity)}
                  {getStatusBadge(incident.status)}
                </div>
                <span className="text-xs text-slate-400 font-medium">{incident.reporter}</span>
              </div>

              <h3 className="text-base font-bold text-slate-100">{incident.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{incident.description}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Category: {incident.category || incident.affectedService}</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  Details <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
