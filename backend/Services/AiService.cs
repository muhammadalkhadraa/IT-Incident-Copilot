using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Services
{
    public class AiService : IAiService
    {
        public Task<AiDiagnosisResultDto> ClassifyAndDiagnoseAsync(Incident incident)
        {
            var result = new AiDiagnosisResultDto();

            if (incident.Title.Contains("Print", StringComparison.OrdinalIgnoreCase) || 
                incident.Description.Contains("spool", StringComparison.OrdinalIgnoreCase))
            {
                result.PrimaryHypothesisTitle = "Print Spooler Buffer Overrun via Driver Deadlock";
                result.ConfidenceScore = 94;
                result.RootCauseCategory = "Driver / Application Failure";
                result.Summary = $"High-confidence diagnosis for {incident.TicketNumber}: spoolsv.exe process heap leak caused by corrupt PDF document processing via faulting UPD module.";
                result.CopilotNotes = "Correlated with Event ID 2004 memory low warning and Event ID 1000 faulting module hpzpui64.dll.";
                result.ReasoningChain = new List<string>
                {
                    "CPU load sustained at 98% on target host.",
                    "Process memory footprint for spoolsv.exe exceeded 2.5 GB threshold.",
                    "Event ID 1000 pinpointed printer driver DLL collision."
                };
                result.EvidenceFound = new List<string>
                {
                    "Telemetry CPU 98%, RAM 97%",
                    "Event 1000 [Application Error]: spoolsv.exe",
                    "Rule RULE-SYS-102 Failure"
                };
                result.RecommendedFix = "Execute playbook ACT-SYS-RESTART-SPOOLER to purge printers buffer and cycle Spooler service.";
            }
            else if (incident.Title.Contains("DNS", StringComparison.OrdinalIgnoreCase) || 
                     incident.Title.Contains("Kerberos", StringComparison.OrdinalIgnoreCase))
            {
                result.PrimaryHypothesisTitle = "Active Directory Domain Controller DNS Timeout";
                result.ConfidenceScore = 91;
                result.RootCauseCategory = "Network Infrastructure & SSO";
                result.Summary = "Kerberos ticket validation latency spiked due to DNS client resolution fragmentation.";
                result.CopilotNotes = "DNS latency measured at 1820ms.";
                result.ReasoningChain = new List<string>
                {
                    "DNS query latency exceeded 1500ms threshold.",
                    "Kerberos PAC token fragmentation over UDP MTU 1500."
                };
                result.EvidenceFound = new List<string> { "Event 4015 [DNS-Server]", "Rule RULE-NET-201 Failure" };
                result.RecommendedFix = "Execute playbook ACT-NET-FLUSH-DNS to clear resolver cache and re-register host.";
            }
            else
            {
                result.PrimaryHypothesisTitle = "Storage Capacity Saturation on Partition";
                result.ConfidenceScore = 96;
                result.RootCauseCategory = "Storage / Database";
                result.Summary = "Free disk space on data partition dropped below 3%.";
                result.CopilotNotes = "Requires Tier-2 DBA sign-off before log file truncation.";
                result.ReasoningChain = new List<string>
                {
                    "Partition free space < 5%.",
                    "Database transaction log autogrow failed."
                };
                result.EvidenceFound = new List<string> { "Event 1827 [MSSQLSERVER]", "Disk 97.4% occupied" };
                result.RecommendedFix = "Approve and execute ACT-SYS-EXPAND-DISK playbook.";
            }

            return Task.FromResult(result);
        }

        public Task<string> AnswerTechnicianQuestionAsync(Incident incident, string question)
        {
            var q = question.ToLowerInvariant();
            if (q.Contains("why") || q.Contains("cause"))
            {
                return Task.FromResult($"Root cause diagnosis for {incident.TicketNumber}: {incident.PrimaryHypothesisTitle}. AI confidence is {incident.AiConfidenceScore}%.");
            }
            if (q.Contains("fix") || q.Contains("action") || q.Contains("recommend"))
            {
                return Task.FromResult($"Recommended resolution: Execute the automated playbook for {incident.Category}. Requires approval if classified as HIGH risk.");
            }
            return Task.FromResult($"Copilot analysis for ticket {incident.TicketNumber}: Telemetry metrics and diagnostic rules indicate healthy network routing; issue is localized to host process memory.");
        }

        public Task<float[]> GenerateEmbeddingVectorAsync(string text)
        {
            // Generates 1536-dimensional embedding array for pgvector
            var dummyVector = new float[1536];
            var hash = text.GetHashCode();
            var rand = new Random(hash);
            for (int i = 0; i < 1536; i++)
            {
                dummyVector[i] = (float)rand.NextDouble();
            }
            return Task.FromResult(dummyVector);
        }

        public Task<List<KBArticle>> MatchSimilarKnowledgeVectorAsync(Incident incident, IEnumerable<KBArticle> articles)
        {
            var matched = articles.Where(a => 
                a.Title.Contains(incident.Category, StringComparison.OrdinalIgnoreCase) ||
                a.Content.Contains("Spooler", StringComparison.OrdinalIgnoreCase) ||
                a.TagsJson.Contains("dns", StringComparison.OrdinalIgnoreCase)
            ).ToList();

            return Task.FromResult(matched);
        }
    }
}
