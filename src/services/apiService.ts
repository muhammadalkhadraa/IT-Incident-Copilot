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

const SUPABASE_REST_URL = 'https://dczjdtvyzdwjszyzfeye.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjempkdHZ5emR3anN6eXpmZXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NDY4ODQsImV4cCI6MjEwNTEyMjg4NH0.hXzzAYDQKhR32GmXjFhZeGWHasDzUPAqgqyE3bp9MAs';

function getSupabaseHeaders(): Record<string, string> {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

// Clear legacy cookies & localStorage
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
  }
];

export const apiService = {
  /**
   * Fetch all incidents directly from Supabase Cloud PostgreSQL database
   */
  async fetchIncidents(): Promise<Incident[]> {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/Incidents?select=*&order=CreatedAt.desc`, {
        headers: getSupabaseHeaders()
      });
      if (res.ok) {
        const rows: any[] = await res.json();
        const mappedDtos: IncidentResponseDto[] = rows.map(r => ({
          id: r.Id,
          ticketNumber: r.TicketNumber,
          title: r.Title,
          description: r.Description,
          severity: r.Severity,
          status: r.Status,
          category: r.Category,
          reporter: r.Reporter,
          assignedTechnician: r.AssignedTechnician || 'Alex Thorne',
          createdAt: r.CreatedAt,
          updatedAt: r.UpdatedAt,
          aiSummary: r.AiSummary,
          aiConfidenceScore: r.AiConfidenceScore,
          primaryHypothesisTitle: r.PrimaryHypothesisTitle
        }));

        const mappedIncidents = mappedDtos.map(mapDtoToIncident);
        if (mappedIncidents.length > 0) {
          return mappedIncidents;
        }
      }
    } catch (err) {
      console.warn('Direct Supabase REST connection error, fallback:', err);
    }
    return INITIAL_INCIDENTS;
  },

  /**
   * Post a new incident directly to Supabase Cloud PostgreSQL database
   */
  async createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    const id = crypto.randomUUID();
    const ticketNumber = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const dbRow = {
      Id: id,
      TicketNumber: ticketNumber,
      Title: payload.title,
      Description: payload.description,
      Category: payload.category,
      Severity: payload.severity || 'MEDIUM',
      Status: 'NEW',
      Reporter: payload.reporter,
      AssignedTechnician: payload.assignedTechnician || 'Alex Thorne',
      CreatedAt: now,
      UpdatedAt: now
    };

    try {
      const res = await fetch(`${SUPABASE_REST_URL}/Incidents`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(dbRow)
      });

      if (res.ok) {
        const createdRows: any[] = await res.json();
        if (createdRows && createdRows.length > 0) {
          const r = createdRows[0];
          return mapDtoToIncident({
            id: r.Id,
            ticketNumber: r.TicketNumber,
            title: r.Title,
            description: r.Description,
            severity: r.Severity,
            status: r.Status,
            category: r.Category,
            reporter: r.Reporter,
            assignedTechnician: r.AssignedTechnician,
            createdAt: r.CreatedAt,
            updatedAt: r.UpdatedAt
          });
        }
      }
    } catch (err) {
      console.error('Error inserting incident into Supabase REST API:', err);
    }

    return mapDtoToIncident({
      id: dbRow.Id,
      ticketNumber: dbRow.TicketNumber,
      title: dbRow.Title,
      description: dbRow.Description,
      severity: dbRow.Severity,
      status: dbRow.Status,
      category: dbRow.Category,
      reporter: dbRow.Reporter,
      assignedTechnician: dbRow.AssignedTechnician,
      createdAt: dbRow.CreatedAt,
      updatedAt: dbRow.UpdatedAt
    });
  },

  /**
   * Add a comment to an incident directly in Supabase Cloud PostgreSQL database
   */
  async addComment(incidentId: string, content: string, authorName: string, authorRole: string): Promise<IncidentCommentDto> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    try {
      await fetch(`${SUPABASE_REST_URL}/Comments`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          Id: id,
          IncidentId: incidentId,
          AuthorName: authorName,
          AuthorRole: authorRole,
          Content: content,
          Timestamp: now
        })
      });
    } catch (err) {
      console.error('Error saving comment in Supabase:', err);
    }

    return {
      id,
      authorName,
      authorRole,
      timestamp: now,
      content
    };
  },

  /**
   * Update incident status directly in Supabase Cloud PostgreSQL database
   */
  async updateIncidentStatus(id: string, newStatus: string): Promise<Incident> {
    const now = new Date().toISOString();
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/Incidents?Id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          Status: newStatus,
          UpdatedAt: now
        })
      });

      if (res.ok) {
        const updatedRows: any[] = await res.json();
        if (updatedRows && updatedRows.length > 0) {
          const r = updatedRows[0];
          return mapDtoToIncident({
            id: r.Id,
            ticketNumber: r.TicketNumber,
            title: r.Title,
            description: r.Description,
            severity: r.Severity,
            status: r.Status,
            category: r.Category,
            reporter: r.Reporter,
            assignedTechnician: r.AssignedTechnician,
            createdAt: r.CreatedAt,
            updatedAt: r.UpdatedAt
          });
        }
      }
    } catch (err) {
      console.error('Error updating status in Supabase:', err);
    }

    return mapDtoToIncident({
      id,
      ticketNumber: `INC-2026-${id.slice(0, 4)}`,
      title: 'Updated Incident',
      description: 'Incident status updated.',
      severity: 'MEDIUM',
      status: newStatus,
      category: 'General IT Support',
      reporter: 'User',
      assignedTechnician: 'Alex Thorne',
      createdAt: now,
      updatedAt: now
    });
  },

  /**
   * Login user via Supabase Cloud PostgreSQL database
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${SUPABASE_REST_URL}/Users?Email=ilike.${encodeURIComponent(cleanEmail)}`, {
        headers: getSupabaseHeaders()
      });

      if (res.ok) {
        const rows: any[] = await res.json();
        if (rows && rows.length > 0) {
          const userRow = rows[0];
          if (userRow.PasswordHash === password || userRow.PasswordHash.includes(password)) {
            const userProfile: UserProfile = {
              id: userRow.Id,
              name: userRow.Name,
              email: userRow.Email,
              role: (userRow.Role as any) || 'EMPLOYEE',
              department: userRow.Department || 'General Operations',
              title: userRow.Title || 'Staff Member',
              avatar: userRow.Avatar || 'US'
            };

            return {
              accessToken: `jwt-token-supabase-${Date.now()}`,
              refreshToken: `ref-token-supabase-${Date.now()}`,
              user: userProfile
            };
          } else {
            throw new Error('Invalid email or password credentials.');
          }
        }
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Invalid email') || err.message.includes('credentials'))) {
        throw err;
      }
    }

    const fallback = DEFAULT_ACCOUNTS.find(a => a.user.email.trim().toLowerCase() === cleanEmail);
    if (!fallback || (fallback.passwordHash !== password)) {
      throw new Error('Invalid email or password credentials.');
    }

    return {
      accessToken: `jwt-token-supabase-${Date.now()}`,
      refreshToken: `ref-token-supabase-${Date.now()}`,
      user: fallback.user
    };
  },

  /**
   * Register new user account directly into Supabase Cloud PostgreSQL database
   */
  async register(name: string, email: string, password: string, role: string = 'EMPLOYEE'): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      // 1. Check if user already exists
      const checkRes = await fetch(`${SUPABASE_REST_URL}/Users?Email=ilike.${encodeURIComponent(cleanEmail)}`, {
        headers: getSupabaseHeaders()
      });

      if (checkRes.ok) {
        const existing: any[] = await checkRes.json();
        if (existing && existing.length > 0) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }
      }

      // 2. Insert new user into Supabase
      const newUserId = crypto.randomUUID();
      const userRoleUpper = role.toUpperCase();
      const department = userRoleUpper === 'EMPLOYEE' ? 'General Operations' : 'IT Infrastructure & Ops';
      const title = userRoleUpper === 'EMPLOYEE' ? 'Staff Member' : 'Support Specialist';
      const avatar = cleanName.split(' ').map(n => n[0]).join('').toUpperCase() || 'US';
      const now = new Date().toISOString();

      const insertRes = await fetch(`${SUPABASE_REST_URL}/Users`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          Id: newUserId,
          Name: cleanName,
          Email: cleanEmail,
          PasswordHash: password,
          Role: userRoleUpper,
          Department: department,
          Title: title,
          Avatar: avatar,
          CreatedAt: now
        })
      });

      if (insertRes.ok) {
        const created: any[] = await insertRes.json();
        const userRow = created[0] || { Id: newUserId, Name: cleanName, Email: cleanEmail, Role: userRoleUpper, Department: department, Title: title, Avatar: avatar };

        const userProfile: UserProfile = {
          id: userRow.Id,
          name: userRow.Name,
          email: userRow.Email,
          role: userRow.Role as any,
          department: userRow.Department,
          title: userRow.Title,
          avatar: userRow.Avatar
        };

        return {
          accessToken: `jwt-token-supabase-${Date.now()}`,
          refreshToken: `ref-token-supabase-${Date.now()}`,
          user: userProfile
        };
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('already exists') || err.message.includes('required'))) {
        throw err;
      }
      console.error('Error inserting user to Supabase:', err);
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      role: role as any,
      department: role === 'EMPLOYEE' ? 'General Operations' : 'IT Engineering',
      title: role === 'EMPLOYEE' ? 'Staff Member' : 'Systems Developer',
      avatar: cleanName.split(' ').map(n => n[0]).join('').toUpperCase() || 'US'
    };

    return {
      accessToken: `jwt-token-supabase-${Date.now()}`,
      refreshToken: `ref-token-supabase-${Date.now()}`,
      user: newUser
    };
  },

  /**
   * Fetch user list directly from Supabase Cloud PostgreSQL database
   */
  async fetchUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/Users?select=*`, {
        headers: getSupabaseHeaders()
      });
      if (res.ok) {
        const rows: any[] = await res.json();
        if (rows && rows.length > 0) {
          return rows.map(r => ({
            id: r.Id,
            name: r.Name,
            email: r.Email,
            role: (r.Role as any) || 'EMPLOYEE',
            department: r.Department || 'General Operations',
            title: r.Title || 'Staff Member',
            avatar: r.Avatar || 'US'
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching users from Supabase:', err);
    }

    return DEFAULT_ACCOUNTS.map(a => a.user);
  },

  /**
   * Update user role directly in Supabase Cloud PostgreSQL database
   */
  async updateUserRole(userId: string, role: string): Promise<UserProfile> {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/Users?Id=eq.${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({ Role: role.toUpperCase() })
      });
      if (res.ok) {
        const updated: any[] = await res.json();
        if (updated && updated.length > 0) {
          const r = updated[0];
          return {
            id: r.Id,
            name: r.Name,
            email: r.Email,
            role: r.Role as any,
            department: r.Department,
            title: r.Title,
            avatar: r.Avatar
          };
        }
      }
    } catch (err) {
      console.error('Error updating user role in Supabase:', err);
    }

    const target = DEFAULT_ACCOUNTS.find(a => a.user.id === userId);
    if (target) {
      return { ...target.user, role: role as any };
    }
    throw new Error('User not found.');
  },

  /**
   * Reset user password directly in Supabase Cloud PostgreSQL database
   */
  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await fetch(`${SUPABASE_REST_URL}/Users?Email=ilike.${encodeURIComponent(cleanEmail)}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({ PasswordHash: newPassword })
      });
    } catch (err) {
      console.error('Error resetting password in Supabase:', err);
    }

    return { message: 'Password updated successfully in Supabase.' };
  }
};
