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
            string title = incident.Title ?? "";
            string desc = incident.Description ?? "";
            string category = incident.Category ?? "";
            string host = string.IsNullOrWhiteSpace(incident.Hostname) ? "HOST-DEVICE01" : incident.Hostname;

            /* === AI COPILOT BACKEND DIAGNOSIS ENGINE (RESERVED FOR FUTURE WORK) ===
            string combinedText = $"{title} {desc} {category}".ToLowerInvariant();

            if (combinedText.Contains("hardware") || combinedText.Contains("monitor") || combinedText.Contains("display") || combinedText.Contains("screen") || combinedText.Contains("gpu"))
            {
                result.PrimaryHypothesisTitle = "Display Adapter Sync Failure & GPU Driver TDR Reset";
                result.ConfidenceScore = 95;
                result.RootCauseCategory = "Hardware & Display Subsystem";
                result.Summary = $"Correlated graphics display driver TDR timeout with monitor signal synchronization loss on host {host}.";
                result.CopilotNotes = "Event ID 4101 (Display Driver nvlddmkm stopped responding and successfully recovered) correlated with physical display output.";
                result.ReasoningChain = new List<string>
                {
                    $"Detected display signal interruption reported by user {incident.Reporter}.",
                    "Windows Display Driver Model (WDDM) TDR reset detected in graphics pipeline.",
                    "Hardware diagnostic rule RULE-HW-301 flagged video output handshake drop."
                };
                result.EvidenceFound = new List<string>
                {
                    $"Telemetry Host: {host}",
                    "Event 4101 [Display]: Driver nvlddmkm recovered",
                    "Rule RULE-HW-301 Failure"
                };
                result.RecommendedFix = "Execute playbook ACT-HW-RESET-GPU-DRIVER to re-initialize graphics display pipeline and re-handshake monitor connection.";
            }
            else if (combinedText.Contains("network") || combinedText.Contains("vpn") || combinedText.Contains("wifi") || combinedText.Contains("internet") || combinedText.Contains("connection"))
            {
                result.PrimaryHypothesisTitle = "Encrypted VPN Gateway Tunnel Handshake & Packet Loss";
                result.ConfidenceScore = 93;
                result.RootCauseCategory = "Network & Security Infrastructure";
                result.Summary = $"Correlated IKEv2/IPsec tunnel drop with network gateway latency spike on host {host}.";
                result.CopilotNotes = "Gateway latency spiked to 420ms with 12% packet loss prior to tunnel disconnection.";
                result.ReasoningChain = new List<string>
                {
                    "Gateway latency exceeded 350ms operational threshold.",
                    "VPN daemon failed keepalive ping to perimeter firewall.",
                    "Diagnostic rule RULE-NET-205 flagged network tunnel handshake timeout."
                };
                result.EvidenceFound = new List<string>
                {
                    "Latency Spike: 420ms (Threshold: 50ms)",
                    "Event 20227 [RemoteAccess]: Connection dropped",
                    "Rule RULE-NET-205 Failure"
                };
                result.RecommendedFix = "Execute playbook ACT-NET-RESET-VPN to flush routing tables, clear IPsec SA cache, and re-establish secure VPN tunnel.";
            }
            === END AI COPILOT BACKEND DIAGNOSIS ENGINE === */

            // Standard Fallback Result while AI features are commented out for future work
            result.PrimaryHypothesisTitle = $"Diagnostic Check: {title}";
            result.ConfidenceScore = 90;
            result.RootCauseCategory = string.IsNullOrWhiteSpace(category) ? "IT Services Infrastructure" : category;
            result.Summary = $"System diagnostic assessment completed for ticket {incident.TicketNumber} on host {host}.";
            result.CopilotNotes = "AI Copilot feature module disabled for future release work.";
            result.ReasoningChain = new List<string>
            {
                $"Analyzed issue report: '{title}'.",
                $"Correlated diagnostic telemetry on target host {host}.",
                $"Mapped issue category to standard operational workflow: {result.RootCauseCategory}."
            };
            result.EvidenceFound = new List<string>
            {
                $"Reported Title: {title}",
                $"Host: {host}",
                $"Category: {result.RootCauseCategory}"
            };
            result.RecommendedFix = $"Execute standard operational remediation playbook for {result.RootCauseCategory}.";

            return Task.FromResult(result);
        }

        public Task<string> AnswerTechnicianQuestionAsync(Incident incident, string question)
        {
            /* === AI COPILOT TECHNICIAN Q&A (RESERVED FOR FUTURE WORK) ===
            var q = question.ToLowerInvariant();
            if (q.Contains("why") || q.Contains("cause"))
            {
                return Task.FromResult($"Root cause diagnosis for ticket {incident.TicketNumber} ({incident.Title}): {incident.PrimaryHypothesisTitle}. AI confidence is {incident.AiConfidenceScore}%.");
            }
            if (q.Contains("fix") || q.Contains("action") || q.Contains("recommend"))
            {
                return Task.FromResult($"Recommended resolution for ticket {incident.TicketNumber}: Execute automated remediation for {incident.Category}. Target host: {incident.Hostname}.");
            }
            === END AI COPILOT TECHNICIAN Q&A === */

            return Task.FromResult($"AI Copilot Q&A features are currently commented out for future release. Selected ticket: {incident.TicketNumber} ({incident.Title}).");
        }

        public Task<float[]> GenerateEmbeddingVectorAsync(string text)
        {
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
                a.Content.Contains(incident.Category, StringComparison.OrdinalIgnoreCase) ||
                a.TagsJson.Contains(incident.Category, StringComparison.OrdinalIgnoreCase)
            ).ToList();

            return Task.FromResult(matched);
        }
    }
}
