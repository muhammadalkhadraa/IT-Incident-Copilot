using System;
using System.Collections.Generic;
using Pgvector;

namespace ITIncidentCopilot.Api.Entities
{
    public class Department
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public List<User> Users { get; set; } = new();
    }

    public class Role
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string RoleName { get; set; } = string.Empty; // EMPLOYEE, TECHNICIAN, IT_MANAGER, ADMINISTRATOR
        public string PermissionsJson { get; set; } = "[]";
        public List<User> Users { get; set; } = new();
    }

    public class Device
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Hostname { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string OS { get; set; } = string.Empty;
        public string AgentVersion { get; set; } = "v2.4.1";
        public string Uptime { get; set; } = "14 days";
        public string Status { get; set; } = "HEALTHY"; // HEALTHY, DEGRADED, CRITICAL
        public double CpuUsagePct { get; set; }
        public double RamUsagePct { get; set; }
        public double DiskUsagePct { get; set; }
        public int NetworkLatencyMs { get; set; }
        public List<Incident> Incidents { get; set; } = new();
    }

    public class IncidentEvent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string EventType { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
    }

    public class IncidentAttachment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }
        public string Filename { get; set; } = string.Empty;
        public string Filesize { get; set; } = string.Empty;
        public string Filetype { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }

    public class DiagnosticRun
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }
        public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
        public string TriggerType { get; set; } = "AUTOMATED"; // AUTOMATED, MANUAL_TECHNICIAN
        public string OverallStatus { get; set; } = "PASS";
        public List<DiagnosticResult> Results { get; set; } = new();
    }

    public class DiagnosticResult
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DiagnosticRunId { get; set; }
        public DiagnosticRun? DiagnosticRun { get; set; }
        public string RuleCode { get; set; } = string.Empty;
        public string RuleName { get; set; } = string.Empty;
        public string Status { get; set; } = "PASS"; // PASS, WARN, FAIL
        public string Evidence { get; set; } = string.Empty;
        public int LatencyMs { get; set; }
        public string Recommendation { get; set; } = string.Empty;
    }

    public class Diagnosis
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }
        public string PrimaryHypothesis { get; set; } = string.Empty;
        public int ConfidenceScore { get; set; }
        public string Summary { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public List<Recommendation> Recommendations { get; set; } = new();
    }

    public class Recommendation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DiagnosisId { get; set; }
        public Diagnosis? Diagnosis { get; set; }
        public string ActionTitle { get; set; } = string.Empty;
        public string ActionCode { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = "LOW";
        public bool RequiresApproval { get; set; }
    }

    public class KnowledgeDocument
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string DocumentCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        public List<KnowledgeChunk> Chunks { get; set; } = new();
    }

    public class KnowledgeChunk
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DocumentId { get; set; }
        public KnowledgeDocument? Document { get; set; }
        public string ChunkText { get; set; } = string.Empty;
        
        // PostgreSQL pgvector 1536-dimensional vector embedding column
        public Vector? Embedding { get; set; }
    }

    public class SimilarIncidentRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid SourceIncidentId { get; set; }
        public Incident? SourceIncident { get; set; }
        public Guid MatchedIncidentId { get; set; }
        public Incident? MatchedIncident { get; set; }
        public double SimilarityScore { get; set; }
        public string ResolutionSummary { get; set; } = string.Empty;
    }

    public class AutomationRule
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string TriggerEvent { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public string ConfigJson { get; set; } = "{}";
        public List<AutomationExecution> Executions { get; set; } = new();
    }

    public class AutomationExecution
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid RuleId { get; set; }
        public AutomationRule? Rule { get; set; }
        public Guid IncidentId { get; set; }
        public Incident? Incident { get; set; }
        public string Status { get; set; } = "SUCCESS";
        public string OutputLog { get; set; } = string.Empty;
        public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
    }

    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User? User { get; set; }
        public Guid? IncidentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
