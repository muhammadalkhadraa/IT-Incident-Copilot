using System;
using System.Collections.Generic;

namespace ITIncidentCopilot.Api.Entities
{
    public class Incident
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string TicketNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "MEDIUM"; // CRITICAL, HIGH, MEDIUM, LOW
        public string Status { get; set; } = "NEW"; // NEW, DIAGNOSING, AWAITING_APPROVAL, REMEDIATING, RESOLVED, CLOSED
        public string Category { get; set; } = string.Empty;
        public string AffectedService { get; set; } = string.Empty;
        
        public string Reporter { get; set; } = string.Empty;
        public Guid? ReporterId { get; set; }
        
        public string AssignedTechnician { get; set; } = "Unassigned";
        public Guid? AssignedTechnicianId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime SlaDueDate { get; set; } = DateTime.UtcNow.AddHours(4);

        // Target Device & Telemetry Data
        public string Hostname { get; set; } = string.Empty;
        public string OperatingSystem { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public double CpuUsagePct { get; set; }
        public double RamUsagePct { get; set; }
        public double DiskUsagePct { get; set; }
        public int NetworkLatencyMs { get; set; }

        // AI Diagnosis
        public string? AiSummary { get; set; }
        public int? AiConfidenceScore { get; set; }
        public string? PrimaryHypothesisTitle { get; set; }

        // Child Collections
        public List<DiagnosticResultEntry> DiagnosticResults { get; set; } = new();
        public List<AuditLogRecord> AuditTrail { get; set; } = new();
        public List<IncidentCommentRecord> Comments { get; set; } = new();
    }

    public class DiagnosticResultEntry
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IncidentId { get; set; }
        public string RuleCode { get; set; } = string.Empty;
        public string RuleName { get; set; } = string.Empty;
        public string Status { get; set; } = "PASS"; // PASS, WARN, FAIL
        public string Evidence { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AuditLogRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IncidentId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Actor { get; set; } = string.Empty;
        public string ActorType { get; set; } = "SYSTEM"; // SYSTEM, AI, TECHNICIAN
        public string ActionType { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
    }

    public class IncidentCommentRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid IncidentId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Content { get; set; } = string.Empty;
    }
}
