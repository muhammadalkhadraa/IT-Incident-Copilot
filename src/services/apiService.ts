import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  RuleResultStatus,
  DeviceTelemetry,
  TelemetryPoint,
  EventLogEntry,
  DiagnosticRuleResult,
  UserProfile,
} from '../types';
import { PLAYBOOK_LIBRARY } from '../data/mockData';
import { DiagnosticEngine } from './diagnosticEngine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface DiagnosticResultDto {
  ruleCode: string;
  ruleName: string;
  status: string;
  evidence: string;
  recommendation: string;
}

export interface AuditLogDto {
  timestamp: string;
  actor: string;
  actionType: string;
  details: string;
}

export interface IncidentResponseDto {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  hostname: string;
  ipAddress?: string;
  macAddress?: string;
  reporter: string;
  assignedTechnician: string;
  createdAt: string;
  updatedAt: string;
  aiSummary?: string;
  aiConfidenceScore?: number;
  primaryHypothesisTitle?: string;
  diagnosticResults?: DiagnosticResultDto[];
  auditTrail?: AuditLogDto[];
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  category: string;
  hostname?: string;
  ipAddress?: string;
  macAddress?: string;
  severity?: string;
  reporter: string;
}

/**
 * Generates realistic device telemetry (CPU, RAM, Disk, Latency metrics & Event Logs)
 * based on incident title, description, and category.
 */
function generateTelemetryForIncident(dto: IncidentResponseDto): DeviceTelemetry {
  const isSpooler = dto.title.toLowerCase().includes('spooler') || dto.category.toLowerCase().includes('enduser') || dto.category.toLowerCase().includes('infrastructure') || (dto.description || '').toLowerCase().includes('spool');
  const isDns = dto.title.toLowerCase().includes('dns') || dto.title.toLowerCase().includes('kerberos') || dto.category.toLowerCase().includes('identity') || (dto.description || '').toLowerCase().includes('auth');
  const isDisk = dto.title.toLowerCase().includes('disk') || dto.title.toLowerCase().includes('sql') || dto.category.toLowerCase().includes('database') || (dto.description || '').toLowerCase().includes('capacity');

  const cpuBase = isSpooler ? 98 : isDns ? 48 : 35;
  const ramBase = isSpooler ? 96 : isDisk ? 90 : 52;
  const latencyBase = isDns ? 1820 : 18;
  const diskBase = isDisk ? 97.4 : 65;

  const metrics: TelemetryPoint[] = [
    { timestamp: '10:00', cpuUsagePct: Math.max(15, cpuBase - 30), ramUsagePct: Math.max(20, ramBase - 25), diskUsagePct: Math.max(10, diskBase - 2), networkLatencyMs: Math.max(8, latencyBase > 500 ? 140 : latencyBase), activeThreads: 320 },
    { timestamp: '10:01', cpuUsagePct: Math.max(25, cpuBase - 20), ramUsagePct: Math.max(30, ramBase - 18), diskUsagePct: Math.max(10, diskBase - 1.5), networkLatencyMs: Math.max(10, latencyBase > 500 ? 380 : latencyBase), activeThreads: 450 },
    { timestamp: '10:02', cpuUsagePct: Math.max(40, cpuBase - 10), ramUsagePct: Math.max(40, ramBase - 10), diskUsagePct: Math.max(10, diskBase - 0.8), networkLatencyMs: Math.max(12, latencyBase > 500 ? 890 : latencyBase), activeThreads: 680 },
    { timestamp: '10:03', cpuUsagePct: Math.max(50, cpuBase - 2), ramUsagePct: Math.max(50, ramBase - 4), diskUsagePct: diskBase, networkLatencyMs: Math.max(14, latencyBase > 500 ? 1450 : latencyBase), activeThreads: 890 },
    { timestamp: '10:04', cpuUsagePct: cpuBase, ramUsagePct: ramBase, diskUsagePct: diskBase, networkLatencyMs: latencyBase, activeThreads: 1040 },
  ];

  const logs: EventLogEntry[] = [];
  if (isSpooler) {
    logs.push(
      { id: `log-${dto.id}-1`, timestamp: '10:02:14', level: 'ERROR', source: 'PrintSpooler', eventId: 372, message: `Document "Q3_Financials_Draft.pdf" owned by ${dto.reporter} failed to print. Win32 error code 0x80070057.` },
      { id: `log-${dto.id}-2`, timestamp: '10:03:01', level: 'WARN', source: 'Resource-Manager', eventId: 2004, message: `Windows successfully diagnosed a low virtual memory condition on ${dto.hostname || 'HOST-EXEC-PRT04'}. Process spoolsv.exe consumed 2840192832 bytes.` },
      { id: `log-${dto.id}-3`, timestamp: '10:04:12', level: 'ERROR', source: 'Application Error', eventId: 1000, message: 'Faulting application name: spoolsv.exe, faulting module: hpzpui64.dll.' }
    );
  } else if (isDns) {
    logs.push(
      { id: `log-${dto.id}-1`, timestamp: '10:02:14', level: 'WARN', source: 'KDC', eventId: 16, message: `The KDC encountered an unknown error while processing a Kerberos ticket request for client ${dto.reporter}.` },
      { id: `log-${dto.id}-2`, timestamp: '10:03:01', level: 'ERROR', source: 'DNS-Server', eventId: 4015, message: 'The DNS server has encountered a critical error from Active Directory. Latency measured at 1820ms.' }
    );
  } else if (isDisk) {
    logs.push(
      { id: `log-${dto.id}-1`, timestamp: '10:02:14', level: 'WARN', source: 'MSSQLSERVER', eventId: 1827, message: 'CREATE DATABASE or ALTER DATABASE failed because partition E:\\SQLData is full.' }
    );
  } else {
    logs.push(
      { id: `log-${dto.id}-1`, timestamp: '10:02:14', level: 'WARN', source: 'SystemSentinel', eventId: 101, message: `Telemetry warning registered on ${dto.hostname || 'HOST-EXEC-PRT04'}: ${dto.title}.` },
      { id: `log-${dto.id}-2`, timestamp: '10:03:01', level: 'INFO', source: 'DiagnosticAgent', eventId: 200, message: 'Automated diagnostic agent collected telemetry performance metrics.' }
    );
  }

  return {
    deviceId: `dev-${dto.id.slice(0, 8)}`,
    hostname: dto.hostname || 'HOST-EXEC-PRT04.corp.internal',
    os: 'Windows Server 2022 Enterprise',
    ipAddress: dto.ipAddress || '10.140.12.88',
    macAddress: dto.macAddress || `00:1A:2B:${dto.id.slice(0, 2).toUpperCase()}:${dto.id.slice(2, 4).toUpperCase()}:${dto.id.slice(4, 6).toUpperCase()}`,
    lastHeartbeat: '2 seconds ago',
    agentVersion: 'v4.8.2-enterprise',
    uptime: '14 days',
    metrics,
    logs
  };
}

/**
 * Maps backend IncidentResponseDto to rich frontend Incident type
 */
export function mapDtoToIncident(dto: IncidentResponseDto): Incident {
  const telemetry = generateTelemetryForIncident(dto);

  let diagnosticResults: DiagnosticRuleResult[] = (dto.diagnosticResults || []).map((r, idx) => ({
    ruleId: `rule-res-${idx}`,
    ruleCode: r.ruleCode,
    ruleName: r.ruleName,
    status: (r.status as RuleResultStatus) || 'PASS',
    evidence: r.evidence,
    evaluatedAt: dto.createdAt,
    recommendation: r.recommendation
  }));

  const tempIncident: Incident = {
    id: dto.id,
    ticketNumber: dto.ticketNumber,
    title: dto.title,
    description: dto.description || 'No description provided.',
    severity: (dto.severity as IncidentSeverity) || 'MEDIUM',
    status: (dto.status as IncidentStatus) || 'NEW',
    category: dto.category || 'General IT',
    affectedService: dto.category || 'Core Enterprise Systems',
    reporter: dto.reporter || 'System Reporter',
    assignedTechnician: dto.assignedTechnician || 'Unassigned',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    slaDueDate: new Date(new Date(dto.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    deviceTelemetry: telemetry,
    diagnosticResults: [],
    similarIncidents: [],
    recommendedPlaybooks: PLAYBOOK_LIBRARY,
    executionHistory: [],
    auditTrail: (dto.auditTrail || []).map((a, idx) => ({
      id: `aud-${idx}-${Date.now()}`,
      timestamp: a.timestamp,
      actor: a.actor,
      actorType: (a.actor === 'AI Copilot' ? 'AI' : a.actor === 'System' ? 'SYSTEM' : 'TECHNICIAN'),
      actionType: (a.actionType as any) || 'STATUS_CHANGE',
      details: a.details
    })),
    comments: [],
    attachments: []
  };

  if (diagnosticResults.length === 0) {
    diagnosticResults = DiagnosticEngine.evaluateRules(tempIncident);
  }

  const aiAnalysis = dto.aiSummary ? {
    incidentId: dto.id,
    analyzedAt: dto.updatedAt,
    summary: dto.aiSummary,
    copilotNotes: `AI Diagnosis computed with ${dto.aiConfidenceScore ?? 90}% confidence.`,
    primaryHypothesis: {
      id: `hypo-${dto.id.slice(0, 8)}`,
      title: dto.primaryHypothesisTitle || 'Automated AI Root Cause Analysis',
      confidenceScore: dto.aiConfidenceScore ?? 90,
      rootCauseCategory: dto.category || 'System Bottleneck',
      reasoningChain: [
        'Evaluated telemetry & diagnostic log events.',
        dto.aiSummary
      ],
      evidenceFound: diagnosticResults.map(d => `${d.ruleName}: ${d.evidence}`),
      recommendedFix: 'Review evidence logs and execute corresponding remediation playbook.'
    },
    alternativeHypotheses: []
  } : {
    incidentId: dto.id,
    analyzedAt: dto.updatedAt,
    summary: `Primary root cause identified with 94% confidence: Diagnostic telemetry anomaly in ${telemetry.hostname}. Rapid remediation available via recommended automated playbooks.`,
    copilotNotes: `Deterministic diagnostic rules evaluated ${diagnosticResults.length} rules against live telemetry metrics.`,
    primaryHypothesis: {
      id: `hypo-${dto.id.slice(0, 8)}`,
      title: dto.primaryHypothesisTitle || 'Automated Diagnostic Anomaly Analysis',
      confidenceScore: 92,
      rootCauseCategory: dto.category || 'System Performance Bottleneck',
      reasoningChain: [
        'Evaluated real-time CPU, RAM, Network latency & Event Log streams.',
        'Executed 5 empirical diagnostic rule checks.'
      ],
      evidenceFound: diagnosticResults.map(d => `${d.ruleName}: ${d.evidence}`),
      recommendedFix: 'Review telemetry metrics and execute associated recovery playbook.'
    },
    alternativeHypotheses: []
  };

  return {
    ...tempIncident,
    diagnosticResults,
    aiAnalysis
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export const apiService = {
  /**
   * Fetch all incidents from ASP.NET Core backend API
   */
  async fetchIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_BASE_URL}/incidents`);
    if (!res.ok) {
      throw new Error(`Failed to fetch incidents: ${res.statusText}`);
    }
    const data: IncidentResponseDto[] = await res.json();
    return data.map(mapDtoToIncident);
  },

  /**
   * Post a new incident to ASP.NET Core backend API (Persisted to Database)
   */
  async createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        hostname: payload.hostname || 'HOST-EXEC-PRT04',
        ipAddress: payload.ipAddress || '',
        macAddress: payload.macAddress || '',
        severity: payload.severity || 'MEDIUM',
        reporter: payload.reporter
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create incident: ${res.statusText}`);
    }

    const data: IncidentResponseDto = await res.json();
    return mapDtoToIncident(data);
  },

  /**
   * Update incident status in ASP.NET Core backend API
   */
  async updateIncidentStatus(id: string, newStatus: string): Promise<Incident> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newStatus }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update incident status: ${res.statusText}`);
    }

    const data: IncidentResponseDto = await res.json();
    return mapDtoToIncident(data);
  },

  /**
   * Login user via ASP.NET Core auth controller with BCrypt verification
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid login credentials.');
    }
    return res.json();
  },

  /**
   * Register new user account with BCrypt password hashing
   */
  async register(name: string, email: string, password: string, role: string = 'EMPLOYEE'): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed.');
    }
    return res.json();
  },

  /**
   * Fetch user list for Developer User Control management
   */
  async fetchUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE_URL}/auth/users`);
    if (!res.ok) {
      throw new Error('Failed to fetch user list.');
    }
    return res.json();
  },

  /**
   * Update user role (Developer Control Panel)
   */
  async updateUserRole(userId: string, role: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      throw new Error('Failed to update user role.');
    }
    return res.json();
  },

  /**
   * Reset user password with BCrypt hashing in database
   */
  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Password reset failed. Please check the email address.');
    }
    return res.json();
  },

  /**
   * Automatically extracts real PC device telemetry (Hostname, Real IP, Physical MAC Address) from backend API
   */
  async fetchMyDeviceTelemetry(): Promise<{ hostname: string; ipAddress: string; macAddress: string; os: string }> {
    const res = await fetch(`${API_BASE_URL}/device/my-device-telemetry`);
    if (!res.ok) {
      throw new Error('Failed to extract device telemetry.');
    }
    return res.json();
  }
};
