using System;
using System.Collections.Generic;

namespace ITIncidentCopilot.Api.Application.DTOs
{
    public class CreateIncidentRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Hostname { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
        public string Severity { get; set; } = "MEDIUM";
        public string Reporter { get; set; } = string.Empty;
    }

    public class UpdateStatusRequestDto
    {
        public string NewStatus { get; set; } = string.Empty;
    }

    public class IncidentResponseDto
    {
        public Guid Id { get; set; }
        public string TicketNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Hostname { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
        public string Reporter { get; set; } = string.Empty;
        public string AssignedTechnician { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        public string? AiSummary { get; set; }
        public int? AiConfidenceScore { get; set; }
        public string? PrimaryHypothesisTitle { get; set; }

        public List<DiagnosticResultDto> DiagnosticResults { get; set; } = new();
        public List<AuditLogDto> AuditTrail { get; set; } = new();
    }

    public class DiagnosticResultDto
    {
        public string RuleCode { get; set; } = string.Empty;
        public string RuleName { get; set; } = string.Empty;
        public string Status { get; set; } = "PASS";
        public string Evidence { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
    }

    public class AuditLogDto
    {
        public DateTime Timestamp { get; set; }
        public string Actor { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
    }
}
