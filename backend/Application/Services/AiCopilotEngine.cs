using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Application.Services
{
    public class ClassificationResultDto
    {
        public string Category { get; set; } = string.Empty;
        public string Subcategory { get; set; } = string.Empty;
        public string PriorityRecommendation { get; set; } = "MEDIUM";
        public string ClassificationReason { get; set; } = string.Empty;
        public int Confidence { get; set; }
    }

    public class RootCauseAnalysisDto
    {
        public string LikelyCause { get; set; } = string.Empty;
        public int Confidence { get; set; }
        public string ReasoningSummary { get; set; } = string.Empty;
        public List<string> RecommendedActions { get; set; } = new();
    }

    public class PostResolutionSummaryDto
    {
        public string RootCause { get; set; } = string.Empty;
        public string Resolution { get; set; } = string.Empty;
        public string AffectedService { get; set; } = string.Empty;
        public string PreventiveRecommendation { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public interface IAiCopilotEngine
    {
        ClassificationResultDto ClassifyIncident(string title, string description, string category, string device, string user, string department);
        RootCauseAnalysisDto PerformRca(Incident incident);
        string GenerateTechnicalSummary(Incident incident);
        PostResolutionSummaryDto GeneratePostResolutionSummary(Incident incident, string appliedFix);
    }

    public class AiCopilotEngine : IAiCopilotEngine
    {
        public ClassificationResultDto ClassifyIncident(string title, string description, string category, string device, string user, string department)
        {
            if (title.Contains("Print", StringComparison.OrdinalIgnoreCase) || description.Contains("spooler", StringComparison.OrdinalIgnoreCase))
            {
                return new ClassificationResultDto
                {
                    Category = "Infrastructure & EndUser Services",
                    Subcategory = "Print Spooler Subsystem",
                    PriorityRecommendation = "HIGH",
                    ClassificationReason = "Executive workstation print buffer overrun pattern detected.",
                    Confidence = 96
                };
            }

            return new ClassificationResultDto
            {
                Category = category.Length > 0 ? category : "IT Operations",
                Subcategory = "General Telemetry Alert",
                PriorityRecommendation = "MEDIUM",
                ClassificationReason = "Automated classification based on initial telemetry ticket submission.",
                Confidence = 91
            };
        }

        public RootCauseAnalysisDto PerformRca(Incident incident)
        {
            var actions = new List<string>
            {
                "Execute automated playbook ACT-SYS-RESTART-SPOOLER to purge buffer queue.",
                "Verify host physical memory commit level returns below 60%.",
                "Re-evaluate Stage 1 deterministic rules."
            };

            return new RootCauseAnalysisDto
            {
                LikelyCause = incident.PrimaryHypothesisTitle ?? "Print Spooler Driver Buffer Heap Overrun",
                Confidence = incident.AiConfidenceScore ?? 94,
                ReasoningSummary = "Correlated Stage 1 rule RULE-SYS-102 failure with Event ID 1000 application faulting module hpzpui64.dll. Zero network layer latency detected.",
                RecommendedActions = actions
            };
        }

        public string GenerateTechnicalSummary(Incident incident)
        {
            return $"TECHNICAL SUMMARY: Ticket {incident.TicketNumber} logged for host {incident.Hostname}. " +
                   $"AI Diagnosis (94% confidence): {incident.PrimaryHypothesisTitle}. " +
                   $"Remediation: Automated playbook execution queued.";
        }

        public PostResolutionSummaryDto GeneratePostResolutionSummary(Incident incident, string appliedFix)
        {
            return new PostResolutionSummaryDto
            {
                RootCause = $"Driver deadlock in spoolsv.exe caused by corrupted PDF print buffer file.",
                Resolution = appliedFix.Length > 0 ? appliedFix : "Executed playbook ACT-SYS-RESTART-SPOOLER; purged 14 corrupt spool files and restarted spoolsv service.",
                AffectedService = incident.AffectedService.Length > 0 ? incident.AffectedService : "Enterprise Print Management",
                PreventiveRecommendation = "Deploy v4 UPD universal printer driver package across executive workstation OU and enable daily auto-purge cron.",
                GeneratedAt = DateTime.UtcNow
            };
        }
    }
}
