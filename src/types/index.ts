export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'NEW' | 'DIAGNOSING' | 'AWAITING_APPROVAL' | 'REMEDIATING' | 'RESOLVED' | 'CLOSED';
export type RuleResultStatus = 'PASS' | 'WARN' | 'FAIL';
export type ActionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'EMPLOYEE' | 'TECHNICIAN' | 'IT_MANAGER' | 'ADMINISTRATOR';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  title: string;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  timestamp: string;
  content: string;
  isInternalNote?: boolean;
}

export interface IncidentAttachment {
  id: string;
  filename: string;
  filesize: string;
  filetype: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface TelemetryPoint {
  timestamp: string;
  cpuUsagePct: number;
  ramUsagePct: number;
  diskUsagePct: number;
  networkLatencyMs: number;
  activeThreads: number;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  source: string;
  eventId: number;
  message: string;
}

export interface DeviceTelemetry {
  deviceId: string;
  hostname: string;
  os: string;
  ipAddress: string;
  lastHeartbeat: string;
  agentVersion: string;
  uptime: string;
  metrics: TelemetryPoint[];
  logs: EventLogEntry[];
}

export interface DeterministicNetworkTest {
  id: string;
  testName: string;
  category: 'NETWORK' | 'SYSTEM' | 'SECURITY' | 'STORAGE';
  status: RuleResultStatus;
  latencyMs?: number;
  details: string;
}

export interface Stage1EvidencePayload {
  incidentId: string;
  evaluatedAt: string;
  tests: DeterministicNetworkTest[];
  ruleConclusion: string;
}

export interface DiagnosticRule {
  id: string;
  ruleCode: string;
  name: string;
  category: 'SYSTEM' | 'NETWORK' | 'SECURITY' | 'DATABASE' | 'APPLICATION';
  description: string;
  condition: string;
}

export interface DiagnosticRuleResult {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  status: RuleResultStatus;
  evidence: string;
  evaluatedAt: string;
  recommendation: string;
}

export interface AIHypothesis {
  id: string;
  title: string;
  confidenceScore: number; // 0 to 100
  rootCauseCategory: string;
  reasoningChain: string[];
  evidenceFound: string[];
  recommendedFix: string;
}

export interface AIAnalysisResult {
  incidentId: string;
  analyzedAt: string;
  primaryHypothesis: AIHypothesis;
  alternativeHypotheses: AIHypothesis[];
  summary: string;
  copilotNotes: string;
}

export interface KBArticle {
  id: string;
  articleCode: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  author: string;
  lastUpdated: string;
  matchScore?: number; // 0 to 100 (for RAG search)
}

export interface SimilarIncident {
  id: string;
  ticketNumber: string;
  title: string;
  similarityScore: number; // 0 to 100
  resolvedAt: string;
  resolutionSummary: string;
  appliedPlaybook?: string;
  technician: string;
}

export interface PlaybookAction {
  id: string;
  code: string;
  title: string;
  description: string;
  scriptType: 'POWERSHELL' | 'BASH' | 'PYTHON' | 'API_CALL';
  riskLevel: ActionRiskLevel;
  requiresApproval: boolean;
  estimatedDurationSec: number;
  scriptSnippet: string;
}

export interface ActionExecutionResult {
  actionId: string;
  executedBy: string;
  approvedBy?: string;
  startedAt: string;
  completedAt: string;
  success: boolean;
  outputLog: string;
  exitCode: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string; // System / AI Copilot / Tech Name
  actorType: 'SYSTEM' | 'AI' | 'TECHNICIAN';
  actionType: 'TELEMETRY_ALERT' | 'DIAGNOSTIC_RUN' | 'AI_INFERENCE' | 'APPROVAL_REQUEST' | 'ACTION_EXECUTED' | 'STATUS_CHANGE';
  details: string;
}

export interface Incident {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: string;
  affectedService: string;
  reporter: string;
  reporterId?: string;
  assignedTechnician?: string;
  assignedTechnicianId?: string;
  createdAt: string;
  updatedAt: string;
  slaDueDate: string;
  deviceTelemetry: DeviceTelemetry;
  diagnosticResults: DiagnosticRuleResult[];
  aiAnalysis?: AIAnalysisResult;
  similarIncidents: SimilarIncident[];
  recommendedPlaybooks: PlaybookAction[];
  executionHistory: ActionExecutionResult[];
  auditTrail: AuditLogEntry[];
  comments: IncidentComment[];
  attachments: IncidentAttachment[];
  businessImpactScore?: number; // 1 to 4
  affectedUsersCount?: number;
  serviceCriticalityScore?: number; // 1 to 4
  compositePriorityScore?: number;
}
