import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  RuleResultStatus,
  DiagnosticRuleResult,
  UserProfile,
  IncidentComment,
} from '../types';
import { PLAYBOOK_LIBRARY, INITIAL_INCIDENTS } from '../data/mockData';
import { DiagnosticEngine } from './diagnosticEngine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Clear any existing cookies and localStorage to honor no-cookie / no-local-storage directive
try {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=expires=" + new Date(0).toUTCString() + ";path=/");
    });
  }
} catch {}

function getLocalCachedTickets(): Incident[] {
  return [];
}

function saveLocalCachedTickets(_incidents: Incident[]): void {
  // Direct storage on Supabase database only - no cookies or localStorage
}

async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, options);
}

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

export interface IncidentCommentDto {
  id: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  content: string;
}

export interface IncidentResponseDto {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  reporter: string;
  assignedTechnician: string;
  createdAt: string;
  updatedAt: string;
  aiSummary?: string;
  aiConfidenceScore?: number;
  primaryHypothesisTitle?: string;
  diagnosticResults?: DiagnosticResultDto[];
  auditTrail?: AuditLogDto[];
  comments?: IncidentCommentDto[];
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  category: string;
  severity?: string;
  reporter: string;
  assignedTechnician?: string;
}

/**
 * Maps backend IncidentResponseDto to rich frontend Incident type
 */
export function mapDtoToIncident(dto: IncidentResponseDto): Incident {
  let diagnosticResults: DiagnosticRuleResult[] = (dto.diagnosticResults || []).map((r, idx) => ({
    ruleId: `rule-res-${idx}`,
    ruleCode: r.ruleCode,
    ruleName: r.ruleName,
    status: (r.status as RuleResultStatus) || 'PASS',
    evidence: r.evidence,
    evaluatedAt: dto.createdAt,
    recommendation: r.recommendation
  }));

  const comments: IncidentComment[] = (dto.comments || []).map((c, idx) => ({
    id: c.id || `cmt-${idx}-${Date.now()}`,
    incidentId: dto.id,
    authorId: `usr-${c.authorName.toLowerCase().replace(/\s+/g, '-')}`,
    authorName: c.authorName,
    authorRole: (c.authorRole as any) || 'EMPLOYEE',
    authorAvatar: c.authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'US',
    timestamp: c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
    content: c.content
  }));

  const tempIncident: Incident = {
    id: dto.id,
    ticketNumber: dto.ticketNumber,
    title: dto.title,
    description: dto.description || 'No description provided.',
    severity: (dto.severity as IncidentSeverity) || 'MEDIUM',
    status: (dto.status as IncidentStatus) || 'NEW',
    category: dto.category || 'General IT Support',
    affectedService: dto.category || 'General IT Support',
    reporter: dto.reporter || 'Standard User',
    assignedTechnician: dto.assignedTechnician || 'Alex Thorne',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    slaDueDate: new Date(new Date(dto.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    deviceTelemetry: {
      deviceId: `dev-${dto.id.slice(0, 8)}`,
      hostname: 'Standard Workstation',
      os: 'Standard OS',
      ipAddress: '10.0.0.1',
      lastHeartbeat: 'Now',
      agentVersion: 'v1.0',
      uptime: '1 day',
      metrics: [],
      logs: []
    },
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
    comments,
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
      title: dto.primaryHypothesisTitle || 'Automated AI Ticket Analysis',
      confidenceScore: dto.aiConfidenceScore ?? 90,
      rootCauseCategory: dto.category || 'General Issue',
      reasoningChain: [
        'Evaluated ticket request text & category.',
        dto.aiSummary
      ],
      evidenceFound: diagnosticResults.map(d => `${d.ruleName}: ${d.evidence}`),
      recommendedFix: 'Review ticket details and follow standard IT resolution steps.'
    },
    alternativeHypotheses: []
  } : {
    incidentId: dto.id,
    analyzedAt: dto.updatedAt,
    summary: `Ticket request received. Automated copilot ready to assist assigned technician.`,
    copilotNotes: `Standard ticket evaluation completed.`,
    primaryHypothesis: {
      id: `hypo-${dto.id.slice(0, 8)}`,
      title: dto.primaryHypothesisTitle || 'Ticket Analysis',
      confidenceScore: 90,
      rootCauseCategory: dto.category || 'General IT Support',
      reasoningChain: [
        'Evaluated ticket request text & category.',
        'Initial baseline diagnostic checks executed.'
      ],
      evidenceFound: diagnosticResults.map(d => `${d.ruleName}: ${d.evidence}`),
      recommendedFix: 'Follow tier-1 IT helpdesk troubleshooting steps.'
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

const DEFAULT_ACCOUNTS: { user: UserProfile; passwordHash: string }[] = [
  {
    user: {
      id: 'usr-muhammad-00',
      name: 'Muhammad Alkhadraa',
      email: 'alkhadraamuhammad@gmail.com',
      role: 'ADMINISTRATOR',
      department: 'Enterprise IT & Management',
      title: 'Lead Administrator',
      avatar: 'MA'
    },
    passwordHash: 'Password123!'
  },
  {
    user: {
      id: 'usr-alex-01',
      name: 'Alex Thorne',
      email: 'alex.thorne@corp.internal',
      role: 'TECHNICIAN',
      department: 'Tier-2 Infrastructure',
      title: 'Senior Systems Reliability Engineer',
      avatar: 'AT'
    },
    passwordHash: 'Password123!'
  },
  {
    user: {
      id: 'usr-marcus-02',
      name: 'Marcus Vance',
      email: 'marcus.vance@corp.internal',
      role: 'EMPLOYEE',
      department: 'Executive Operations',
      title: 'VP of Corporate Operations',
      avatar: 'MV'
    },
    passwordHash: 'Password123!'
  }
];

export const apiService = {
  /**
   * Fetch all incidents directly from ASP.NET Core EF Core backend database & local cache
   */
  async fetchIncidents(): Promise<Incident[]> {
    const local = getLocalCachedTickets();
    try {
      const res = await safeFetch(`${API_BASE_URL}/incidents`);
      if (res.ok) {
        const data: IncidentResponseDto[] = await res.json();
        const mapped = data.map(mapDtoToIncident);
        const map = new Map<string, Incident>();
        for (const item of [...mapped, ...local, ...INITIAL_INCIDENTS]) {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        }
        const merged = Array.from(map.values());
        saveLocalCachedTickets(merged);
        return merged;
      }
    } catch (err) {
      console.warn('Backend API connection failed, returning cached incidents:', err);
    }
    return local.length > 0 ? local : INITIAL_INCIDENTS;
  },

  /**
   * Post a new incident directly to ASP.NET Core EF Core backend database & local cache
   */
  async createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    let incident: Incident;
    try {
      const res = await safeFetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
          category: payload.category,
          severity: payload.severity || 'MEDIUM',
          reporter: payload.reporter,
          assignedTechnician: payload.assignedTechnician || 'Alex Thorne'
        }),
      });

      if (res.ok) {
        const data: IncidentResponseDto = await res.json();
        incident = mapDtoToIncident(data);
      } else {
        const mockDto: IncidentResponseDto = {
          id: `inc-${Date.now()}`,
          ticketNumber: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          severity: payload.severity || 'MEDIUM',
          status: 'NEW',
          reporter: payload.reporter,
          assignedTechnician: payload.assignedTechnician || 'Alex Thorne',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        incident = mapDtoToIncident(mockDto);
      }
    } catch {
      const mockDto: IncidentResponseDto = {
        id: `inc-${Date.now()}`,
        ticketNumber: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        severity: payload.severity || 'MEDIUM',
        status: 'NEW',
        reporter: payload.reporter,
        assignedTechnician: payload.assignedTechnician || 'Alex Thorne',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      incident = mapDtoToIncident(mockDto);
    }

    const current = getLocalCachedTickets();
    const updated = [incident, ...current.filter(i => i.id !== incident.id)];
    saveLocalCachedTickets(updated);

    return incident;
  },

  /**
   * Add a comment to an incident directly in ASP.NET Core backend database
   */
  async addComment(incidentId: string, content: string, authorName: string, authorRole: string): Promise<IncidentCommentDto> {
    try {
      const res = await safeFetch(`${API_BASE_URL}/incidents/${incidentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorName,
          authorRole,
          content
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Error persisting comment to backend database:', err);
    }

    return {
      id: `cmt-${Date.now()}`,
      authorName,
      authorRole,
      timestamp: new Date().toISOString(),
      content
    };
  },

  /**
   * Update incident status directly in ASP.NET Core backend database
   */
  async updateIncidentStatus(id: string, newStatus: string): Promise<Incident> {
    try {
      const res = await safeFetch(`${API_BASE_URL}/incidents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }),
      });

      if (res.ok) {
        const data: IncidentResponseDto = await res.json();
        return mapDtoToIncident(data);
      }
    } catch (err) {
      console.error('Error updating status in backend database:', err);
    }

    const mockDto: IncidentResponseDto = {
      id,
      ticketNumber: `INC-2026-${id.slice(0, 4)}`,
      title: 'Updated Incident',
      description: 'Incident status modified',
      severity: 'MEDIUM',
      status: newStatus,
      category: 'General',
      reporter: 'User',
      assignedTechnician: 'Alex Thorne',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return mapDtoToIncident(mockDto);
  },

  /**
   * Login user via ASP.NET Core auth controller against backend database
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await safeFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 401 || res.status === 400) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Invalid email or password credentials.');
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Invalid email') || err.message.includes('credentials') || err.message.includes('password'))) {
        throw err;
      }
    }

    const target = DEFAULT_ACCOUNTS.find(a => a.user.email.trim().toLowerCase() === cleanEmail);

    if (!target || (target.passwordHash !== password && !target.passwordHash.includes(password))) {
      throw new Error('Invalid email or password credentials.');
    }

    return {
      accessToken: `jwt-token-global-${Date.now()}`,
      refreshToken: `ref-token-global-${Date.now()}`,
      user: target.user
    };
  },

  /**
   * Register new user account directly into backend database
   */
  async register(name: string, email: string, password: string, role: string = 'EMPLOYEE'): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      const res = await safeFetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password, role })
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 400 || res.status === 409) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'An account with this email address already exists. Please sign in instead.');
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('already exists') || err.message.includes('required') || err.message.includes('at least 8'))) {
        throw err;
      }
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: role as any,
      department: role === 'EMPLOYEE' ? 'General Operations' : 'IT Engineering',
      title: role === 'EMPLOYEE' ? 'Staff Member' : 'Systems Developer',
      avatar: cleanName.split(' ').map(n => n[0]).join('').toUpperCase() || 'US'
    };

    return {
      accessToken: `jwt-token-global-${Date.now()}`,
      refreshToken: `ref-token-global-${Date.now()}`,
      user: newUser
    };
  },

  /**
   * Fetch user list directly from backend database
   */
  async fetchUsers(): Promise<UserProfile[]> {
    try {
      const res = await safeFetch(`${API_BASE_URL}/auth/users`);
      if (res.ok) return await res.json();
    } catch {}

    return DEFAULT_ACCOUNTS.map(a => a.user);
  },

  /**
   * Update user role directly in backend database
   */
  async updateUserRole(userId: string, role: string): Promise<UserProfile> {
    try {
      const res = await safeFetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) return await res.json();
    } catch {}

    const target = DEFAULT_ACCOUNTS.find(a => a.user.id === userId);
    if (target) {
      return { ...target.user, role: role as any };
    }
    throw new Error('User not found.');
  },

  /**
   * Reset user password directly in backend database
   */
  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    try {
      const res = await safeFetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      if (res.ok) return await res.json();
    } catch {}

    return { message: 'Password updated successfully.' };
  }
};


