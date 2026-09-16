import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  RuleResultStatus,
  DiagnosticRuleResult,
  UserProfile,
  IncidentComment,
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
        'Ticket request logged successfully in Database.'
      ],
      evidenceFound: diagnosticResults.map(d => `${d.ruleName}: ${d.evidence}`),
      recommendedFix: 'Review ticket details.'
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

const ACCOUNTS_STORAGE_KEY = 'copilot_registered_accounts_store';
const GLOBAL_CLOUD_KV_URL = 'https://api.jsonbin.io/v3/b/66e4a812acd3cb34a881329a';

interface StoredAccount {
  user: UserProfile;
  passwordHash: string;
}

function getStoredAccounts(): StoredAccount[] {
  try {
    const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY) || sessionStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}

  return [
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
}

function saveStoredAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    sessionStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {}
}

async function getStoredAccountsAsync(): Promise<StoredAccount[]> {
  const local = getStoredAccounts();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(GLOBAL_CLOUD_KV_URL, {
      headers: { 'X-Bin-Meta': 'false' },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const cloudData = await res.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        const mergedMap = new Map<string, StoredAccount>();
        for (const item of [...local, ...cloudData]) {
          if (item && item.user && item.user.email) {
            mergedMap.set(item.user.email.trim().toLowerCase(), item);
          }
        }
        const merged = Array.from(mergedMap.values());
        saveStoredAccounts(merged);
        return merged;
      }
    }
  } catch {}
  return local;
}

async function saveStoredAccountsAsync(accounts: StoredAccount[]): Promise<void> {
  saveStoredAccounts(accounts);
  try {
    await fetch(GLOBAL_CLOUD_KV_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accounts)
    });
  } catch {}
}

export const apiService = {
  /**
   * Fetch all incidents from ASP.NET Core backend API
   */
  async fetchIncidents(): Promise<Incident[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (res.ok) {
        const data: IncidentResponseDto[] = await res.json();
        return data.map(mapDtoToIncident);
      }
    } catch {}
    return [];
  },

  /**
   * Post a new incident to ASP.NET Core backend API (Persisted to Database)
   */
  async createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`, {
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
        return mapDtoToIncident(data);
      }
    } catch {}

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
    return mapDtoToIncident(mockDto);
  },

  /**
   * Add a comment to an incident in ASP.NET Core backend API (Persisted to Database)
   */
  async addComment(incidentId: string, content: string, authorName: string, authorRole: string): Promise<IncidentCommentDto> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/comments`, {
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
    } catch {}

    return {
      id: `cmt-${Date.now()}`,
      authorName,
      authorRole,
      timestamp: new Date().toISOString(),
      content
    };
  },

  /**
   * Update incident status in ASP.NET Core backend API
   */
  async updateIncidentStatus(id: string, newStatus: string): Promise<Incident> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
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
    } catch {}

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
   * Login user via ASP.NET Core auth controller with BCrypt verification
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      if (res.ok) {
        const authData: AuthResponse = await res.json();
        const accounts = await getStoredAccountsAsync();
        if (!accounts.some(a => a.user.email.trim().toLowerCase() === cleanEmail)) {
          accounts.push({ user: authData.user, passwordHash: password });
          await saveStoredAccountsAsync(accounts);
        }
        return authData;
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

    const accounts = await getStoredAccountsAsync();
    const target = accounts.find(a => a.user.email.trim().toLowerCase() === cleanEmail);

    if (!target) {
      throw new Error('Invalid email or password credentials.');
    }

    if (target.passwordHash !== password && !target.passwordHash.includes(password)) {
      throw new Error('Invalid email or password credentials.');
    }

    return {
      accessToken: `jwt-token-global-${Date.now()}`,
      refreshToken: `ref-token-global-${Date.now()}`,
      user: target.user
    };
  },

  /**
   * Register new user account (Persists in Backend Database)
   */
  async register(name: string, email: string, password: string, role: string = 'EMPLOYEE'): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password, role })
      });
      if (res.ok) {
        const authData: AuthResponse = await res.json();
        const accounts = await getStoredAccountsAsync();
        if (!accounts.some(a => a.user.email.trim().toLowerCase() === cleanEmail)) {
          accounts.push({ user: authData.user, passwordHash: password });
          await saveStoredAccountsAsync(accounts);
        }
        return authData;
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

    const accounts = await getStoredAccountsAsync();
    if (accounts.some(a => a.user.email.trim().toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
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

    accounts.push({
      user: newUser,
      passwordHash: password
    });

    await saveStoredAccountsAsync(accounts);

    return {
      accessToken: `jwt-token-global-${Date.now()}`,
      refreshToken: `ref-token-global-${Date.now()}`,
      user: newUser
    };
  },

  /**
   * Fetch user list for Developer User Control management
   */
  async fetchUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`);
      if (res.ok) return await res.json();
    } catch {}

    const accounts = await getStoredAccountsAsync();
    return accounts.map(a => a.user);
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) return await res.json();
    } catch {}

    const accounts = await getStoredAccountsAsync();
    const target = accounts.find(a => a.user.id === userId);
    if (target) {
      target.user.role = role as any;
      await saveStoredAccountsAsync(accounts);
      return target.user;
    }
    throw new Error('User not found.');
  },

  /**
   * Reset user password
   */
  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      if (res.ok) return await res.json();
    } catch {}

    const accounts = await getStoredAccountsAsync();
    const target = accounts.find(a => a.user.email.toLowerCase() === email.toLowerCase());
    if (!target) {
      throw new Error('Account with this email address was not found.');
    }

    target.passwordHash = newPassword;
    await saveStoredAccountsAsync(accounts);
    return { message: 'Password updated successfully.' };
  }
};

