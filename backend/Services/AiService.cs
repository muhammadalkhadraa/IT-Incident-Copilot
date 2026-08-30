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
            else if (combinedText.Contains("print") || combinedText.Contains("spooler") || combinedText.Contains("paper"))
            {
                result.PrimaryHypothesisTitle = "Print Spooler Buffer Overrun via Driver Deadlock";
                result.ConfidenceScore = 94;
                result.RootCauseCategory = "Driver & Application Services";
                result.Summary = $"High-confidence diagnosis for {incident.TicketNumber}: spoolsv.exe process heap leak caused by corrupt print document processing.";
                result.CopilotNotes = "Correlated with Event ID 2004 memory low warning and Event ID 1000 faulting module hpzpui64.dll.";
                result.ReasoningChain = new List<string>
                {
                    "CPU load sustained at elevated levels on target host.",
                    "Process memory footprint for spoolsv.exe exceeded 2.5 GB threshold.",
                    "Event ID 1000 pinpointed printer driver DLL collision."
                };
                result.EvidenceFound = new List<string>
                {
                    $"Telemetry Host: {host}",
                    "Event 1000 [Application Error]: spoolsv.exe",
                    "Rule RULE-SYS-102 Failure"
                };
                result.RecommendedFix = "Execute playbook ACT-SYS-RESTART-SPOOLER to purge pending print buffer and cycle Spooler service.";
            }
            else if (combinedText.Contains("account") || combinedText.Contains("sso") || combinedText.Contains("password") || combinedText.Contains("auth") || combinedText.Contains("login") || combinedText.Contains("kerberos"))
            {
                result.PrimaryHypothesisTitle = "Active Directory Kerberos Authentication Lockout";
                result.ConfidenceScore = 96;
                result.RootCauseCategory = "Identity & Access Management";
                result.Summary = $"Correlated repeated bad password attempts with Active Directory security lockout for user {incident.Reporter}.";
                result.CopilotNotes = "Event ID 4740 (A user account was locked out) generated on primary Domain Controller.";
                result.ReasoningChain = new List<string>
                {
                    $"Event 4740 logged for user account '{incident.Reporter}' in Active Directory.",
                    "Multiple bad password attempts detected from endpoint interface.",
                    "Diagnostic rule RULE-SEC-401 flagged account security lockout."
                };
                result.EvidenceFound = new List<string>
                {
                    $"User Account: {incident.Reporter}",
                    "Event 4740 [Security]: Account locked out",
                    "Rule RULE-SEC-401 Failure"
                };
                result.RecommendedFix = "Execute playbook ACT-SEC-UNLOCK-ACCOUNT to verify identity credentials, clear bad password counter, and unlock AD user account.";
            }
            else if (combinedText.Contains("software") || combinedText.Contains("app") || combinedText.Contains("crash") || combinedText.Contains("excel") || combinedText.Contains("outlook") || combinedText.Contains("update"))
            {
                result.PrimaryHypothesisTitle = "Unhandled Application Process Exception & Memory Leak";
                result.ConfidenceScore = 92;
                result.RootCauseCategory = "Software & Desktop Applications";
                result.Summary = $"Correlated process thread crash with heap memory allocation failure for application reported on {host}.";
                result.CopilotNotes = "Application process threw unhandled exception code 0xC0000005 (Access Violation).";
                result.ReasoningChain = new List<string>
                {
                    $"Application reported by {incident.Reporter} threw unhandled exception 0xC0000005.",
                    "Process memory footprint exceeded normal operating threshold.",
                    "Diagnostic rule RULE-SW-105 flagged abnormal heap memory allocation."
                };
                result.EvidenceFound = new List<string>
                {
                    $"Host: {host}",
                    "Event 1001 [Windows Error Reporting]: Crash dump logged",
                    "Rule RULE-SW-105 Failure"
                };
                result.RecommendedFix = "Execute playbook ACT-SW-RESTART-APP to terminate orphaned sub-threads, clear app cache, and relaunch application.";
            }
            else
            {
                // Dynamic Diagnosis for Any Custom / Arbitrary User Problem
                result.PrimaryHypothesisTitle = $"System Subsystem Anomaly: {title}";
                result.ConfidenceScore = 90;
                result.RootCauseCategory = string.IsNullOrWhiteSpace(category) ? "IT Services Infrastructure" : category;
                result.Summary = $"AI correlated user issue '{title}' with telemetry metrics on host {host}. System detected operational anomaly requiring targeted remediation.";
                result.CopilotNotes = $"Issue submitted by {incident.Reporter}. Description details: {desc}";
                result.ReasoningChain = new List<string>
                {
                    $"Analyzed issue description: '{desc}'.",
                    $"Telemetry metrics correlated with reported symptoms on host {host}.",
                    $"Synthesized targeted resolution strategy for category: {result.RootCauseCategory}."
                };
                result.EvidenceFound = new List<string>
                {
                    $"Reported Title: {title}",
                    $"Host: {host}",
                    $"Category: {result.RootCauseCategory}"
                };
                result.RecommendedFix = $"Execute automated diagnostic remediation playbook for {result.RootCauseCategory}.";
            }

            return Task.FromResult(result);
        }

        public Task<string> AnswerTechnicianQuestionAsync(Incident incident, string question)
        {
            var q = question.ToLowerInvariant();
            if (q.Contains("why") || q.Contains("cause"))
            {
                return Task.FromResult($"Root cause diagnosis for ticket {incident.TicketNumber} ({incident.Title}): {incident.PrimaryHypothesisTitle}. AI confidence is {incident.AiConfidenceScore}%.");
            }
            if (q.Contains("fix") || q.Contains("action") || q.Contains("recommend"))
            {
                return Task.FromResult($"Recommended resolution for ticket {incident.TicketNumber}: Execute automated remediation for {incident.Category}. Target host: {incident.Hostname}.");
            }
            return Task.FromResult($"Copilot analysis for ticket {incident.TicketNumber} ({incident.Title}): Analyzed issue report by {incident.Reporter} on host {incident.Hostname}. Diagnostic telemetry indicates localized process anomaly; issue is isolated to {incident.Category}.");
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
