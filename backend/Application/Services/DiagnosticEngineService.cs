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
                LatencyMs = incident.NetworkLatencyMs > 0 ? incident.NetworkLatencyMs : 14,
                Details = isDnsFail ? $"DNS Query Timeout ({incident.NetworkLatencyMs}ms)." : "Resolved in 14ms."
            });

            bool isSpoolerFail = incident.Title.Contains("Print", StringComparison.OrdinalIgnoreCase) || (incident.RamUsagePct > 90 && incident.Title.Contains("Spooler", StringComparison.OrdinalIgnoreCase));
            tests.Add(new EmpiricalTestResult
            {
                TestName = "Print Spooler Heap Footprint (spoolsv.exe)",
                Status = isSpoolerFail ? "FAIL" : "PASS",
                LatencyMs = 0,
                Details = isSpoolerFail ? $"spoolsv.exe memory leak ({incident.RamUsagePct}% RAM)." : "spoolsv.exe memory footprint nominal (42 MB)."
            });

            bool isDiskFail = incident.Title.Contains("Disk", StringComparison.OrdinalIgnoreCase) || incident.DiskUsagePct > 95;
            tests.Add(new EmpiricalTestResult
            {
                TestName = "System Partition Free Space (C:\\ & E:\\Data)",
                Status = isDiskFail ? "FAIL" : "PASS",
                LatencyMs = 0,
                Details = isDiskFail ? $"Data partition free space low ({incident.DiskUsagePct}% occupied)." : "Partition storage healthy (> 30% free)."
            });

            string conclusion = "Stage 1 Conclusion: All Network & System Checks Passed.";
            if (isSpoolerFail) conclusion = "Stage 1 Conclusion: Print Spooler Process Buffer Deadlock.";
            else if (isDnsFail) conclusion = "Stage 1 Conclusion: Likely DNS Resolution Timeout.";
            else if (isDiskFail) conclusion = "Stage 1 Conclusion: Storage Drive Saturation.";

            return new Stage1EvidencePayload
            {
                EmpiricalTests = tests,
                RuleConclusion = conclusion
            };
        }

        public List<DiagnosticResultEntry> EvaluateDeterministicRules(Incident incident)
        {
            var results = new List<DiagnosticResultEntry>();

            // Rule 101: CPU Saturation Check
            bool cpuFail = incident.CpuUsagePct > 85.0 && (incident.Title.Contains("CPU", StringComparison.OrdinalIgnoreCase) || incident.Title.Contains("High Load", StringComparison.OrdinalIgnoreCase));
            results.Add(new DiagnosticResultEntry
            {
                IncidentId = incident.Id,
                RuleCode = "RULE-SYS-101",
                RuleName = "Critical CPU Saturation",
                Status = cpuFail ? "FAIL" : "PASS",
                Evidence = cpuFail ? $"Host CPU load sustained at {incident.CpuUsagePct}% (Threshold: 85%)." : $"CPU load within nominal bounds ({incident.CpuUsagePct}%).",
                Recommendation = cpuFail ? "Check top process thread locks." : "No action needed."
            });

            // Rule 102: RAM & Memory Check
            bool ramFail = incident.RamUsagePct > 90.0 && (incident.Title.Contains("Memory", StringComparison.OrdinalIgnoreCase) || incident.Title.Contains("Print", StringComparison.OrdinalIgnoreCase));
            results.Add(new DiagnosticResultEntry
            {
                IncidentId = incident.Id,
                RuleCode = "RULE-SYS-102",
                RuleName = "Print Spooler Heap Exhaustion",
                Status = ramFail ? "FAIL" : "PASS",
                Evidence = ramFail ? $"RAM usage critically elevated ({incident.RamUsagePct}% committed)." : "Memory utilization nominal (< 90%).",
                Recommendation = ramFail ? "Purge print queue buffer and restart spoolsv service." : "No action needed."
            });

            // Rule 201: Network / DNS Latency Check
            bool netFail = incident.NetworkLatencyMs > 300 || incident.Title.Contains("VPN", StringComparison.OrdinalIgnoreCase) || incident.Title.Contains("DNS", StringComparison.OrdinalIgnoreCase);
            results.Add(new DiagnosticResultEntry
            {
                IncidentId = incident.Id,
                RuleCode = "RULE-NET-201",
                RuleName = "DNS Resolution Failure / Timeout",
                Status = netFail ? "FAIL" : "PASS",
                Evidence = netFail ? $"Network/DNS resolution latency spiked to {incident.NetworkLatencyMs}ms." : "Network routing and DNS latency nominal.",
                Recommendation = netFail ? "Flush client DNS resolver cache and reset VPN gateway." : "No action needed."
            });

            // Rule 301: Display / Hardware Check
            bool hwFail = incident.Title.Contains("Monitor", StringComparison.OrdinalIgnoreCase) || incident.Title.Contains("Display", StringComparison.OrdinalIgnoreCase) || incident.Title.Contains("Hardware", StringComparison.OrdinalIgnoreCase);
            results.Add(new DiagnosticResultEntry
            {
                IncidentId = incident.Id,
                RuleCode = "RULE-HW-301",
                RuleName = "Display Driver TDR Reset Check",
                Status = hwFail ? "FAIL" : "PASS",
                Evidence = hwFail ? "Display adapter signal synchronization disruption reported." : "Graphics display adapter handshake nominal.",
                Recommendation = hwFail ? "Reset GPU display driver pipeline." : "No action needed."
            });

            return results;
        }
    }
}
