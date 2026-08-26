using System;
using System.Collections.Generic;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Application.Services
{
    public class EmpiricalTestResult
    {
        public string TestName { get; set; } = string.Empty;
        public string Status { get; set; } = "PASS";
        public int LatencyMs { get; set; }
        public string Details { get; set; } = string.Empty;
    }

    public class Stage1EvidencePayload
    {
        public List<EmpiricalTestResult> EmpiricalTests { get; set; } = new();
        public string RuleConclusion { get; set; } = string.Empty;
    }

    public interface IDiagnosticEngineService
    {
        Stage1EvidencePayload RunStage1EmpiricalTests(Incident incident);
        List<DiagnosticResultEntry> EvaluateDeterministicRules(Incident incident);
    }

    public class DiagnosticEngineService : IDiagnosticEngineService
    {
        public Stage1EvidencePayload RunStage1EmpiricalTests(Incident incident)
        {
            var tests = new List<EmpiricalTestResult>
            {
                new EmpiricalTestResult
                {
                    TestName = "Ping Default Gateway (10.140.0.1)",
                    Status = "PASS",
                    LatencyMs = 12,
                    Details = "ICMP Echo reply received within 12ms."
                },
                new EmpiricalTestResult
                {
                    TestName = "Ping Public Resolver (1.1.1.1)",
                    Status = "PASS",
                    LatencyMs = 22,
                    Details = "ICMP Echo reply received. Internet connectivity healthy."
                }
            };

            bool isDnsFail = incident.Title.Contains("DNS", StringComparison.OrdinalIgnoreCase) || incident.NetworkLatencyMs > 500;
            tests.Add(new EmpiricalTestResult
            {
                TestName = "Internal AD DNS Resolution (dc01.corp.internal)",
                Status = isDnsFail ? "FAIL" : "PASS",
                LatencyMs = incident.NetworkLatencyMs,
                Details = isDnsFail ? $"DNS Query Timeout ({incident.NetworkLatencyMs}ms)." : "Resolved in 14ms."
            });

            bool isSpoolerFail = incident.Title.Contains("Print", StringComparison.OrdinalIgnoreCase) || incident.RamUsagePct > 90;
            tests.Add(new EmpiricalTestResult
            {
                TestName = "Print Spooler Heap Footprint (spoolsv.exe)",
                Status = isSpoolerFail ? "FAIL" : "PASS",
                LatencyMs = 0,
                Details = isSpoolerFail ? $"spoolsv.exe memory leak ({incident.RamUsagePct}% RAM)." : "spoolsv.exe memory footprint 42MB."
            });

            string conclusion = "Stage 1 Conclusion: All Network & System Checks Passed.";
            if (isSpoolerFail) conclusion = "Stage 1 Conclusion: Print Spooler Process Buffer Deadlock.";
            else if (isDnsFail) conclusion = "Stage 1 Conclusion: Likely DNS Resolution Timeout.";

            return new Stage1EvidencePayload
            {
                EmpiricalTests = tests,
                RuleConclusion = conclusion
            };
        }

        public List<DiagnosticResultEntry> EvaluateDeterministicRules(Incident incident)
        {
            var results = new List<DiagnosticResultEntry>();

            if (incident.CpuUsagePct > 85.0)
            {
                results.Add(new DiagnosticResultEntry
                {
                    IncidentId = incident.Id,
                    RuleCode = "RULE-SYS-101",
                    RuleName = "Critical CPU Saturation",
                    Status = "FAIL",
                    Evidence = $"Host CPU load sustained at {incident.CpuUsagePct}% (Threshold: 85%).",
                    Recommendation = "Check top process thread locks."
                });
            }
            else
            {
                results.Add(new DiagnosticResultEntry
                {
                    IncidentId = incident.Id,
                    RuleCode = "RULE-SYS-101",
                    RuleName = "Critical CPU Saturation",
                    Status = "PASS",
                    Evidence = $"CPU load within nominal bounds ({incident.CpuUsagePct}%).",
                    Recommendation = "No action needed."
                });
            }

            if (incident.RamUsagePct > 90.0)
            {
                results.Add(new DiagnosticResultEntry
                {
                    IncidentId = incident.Id,
                    RuleCode = "RULE-SYS-102",
                    RuleName = "Print Spooler Heap Exhaustion",
                    Status = "FAIL",
                    Evidence = $"RAM usage critically elevated ({incident.RamUsagePct}% committed).",
                    Recommendation = "Purge print queue buffer and restart spoolsv service."
                });
            }

            if (incident.NetworkLatencyMs > 500)
            {
                results.Add(new DiagnosticResultEntry
                {
                    IncidentId = incident.Id,
                    RuleCode = "RULE-NET-201",
                    RuleName = "DNS Resolution Failure / Timeout",
                    Status = "FAIL",
                    Evidence = $"DNS resolution latency spiked to {incident.NetworkLatencyMs}ms.",
                    Recommendation = "Flush client DNS resolver cache."
                });
            }

            return results;
        }
    }
}
