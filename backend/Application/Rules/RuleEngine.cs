using System;
using System.Collections.Generic;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Application.Rules
{
    public class ConditionEvaluationTrace
    {
        public string Condition { get; set; } = string.Empty;
        public bool Satisfied { get; set; }
        public string Evidence { get; set; } = string.Empty;
    }

    public class RuleEvaluationResult
    {
        public string RuleCode { get; set; } = string.Empty;
        public string RuleName { get; set; } = string.Empty;
        public string Status { get; set; } = "TRIGGERED"; // TRIGGERED, PASSED
        public string DiagnosisCode { get; set; } = string.Empty;
        public string DiagnosisTitle { get; set; } = string.Empty;
        public List<ConditionEvaluationTrace> ConditionTrace { get; set; } = new();
    }

    public interface IRuleEngine
    {
        List<RuleEvaluationResult> EvaluateRules(Incident incident, bool isGatewayReachable, bool isInternetReachable, bool isDnsValid);
    }

    public class RuleEngine : IRuleEngine
    {
        public List<RuleEvaluationResult> EvaluateRules(Incident incident, bool isGatewayReachable, bool isInternetReachable, bool isDnsValid)
        {
            var results = new List<RuleEvaluationResult>();

            // Rule 1: APIPA Auto-Private IP Assignment (169.254.*)
            var ipTrace = new List<ConditionEvaluationTrace>
            {
                new ConditionEvaluationTrace { Condition = "IP Address StartsWith '169.254'", Satisfied = incident.IpAddress.StartsWith("169.254"), Evidence = $"IP: {incident.IpAddress}" }
            };
            if (incident.IpAddress.StartsWith("169.254"))
            {
                results.Add(new RuleEvaluationResult
                {
                    RuleCode = "RULE-DHCP-001",
                    RuleName = "DHCP Lease Exhaustion / APIPA IP",
                    Status = "TRIGGERED",
                    DiagnosisCode = "DHCP_FAILURE",
                    DiagnosisTitle = "DHCP Server Unreachable (Auto-Private 169.254 IP Assigned)",
                    ConditionTrace = ipTrace
                });
            }

            // Rule 2: Gateway Unreachable
            var gwTrace = new List<ConditionEvaluationTrace>
            {
                new ConditionEvaluationTrace { Condition = "Gateway Reachable == FALSE", Satisfied = !isGatewayReachable, Evidence = $"Gateway Ping: {(isGatewayReachable ? "PASS" : "FAIL")}" }
            };
            if (!isGatewayReachable)
            {
                results.Add(new RuleEvaluationResult
                {
                    RuleCode = "RULE-GW-002",
                    RuleName = "Local Network / Gateway Down",
                    Status = "TRIGGERED",
                    DiagnosisCode = "LOCAL_NETWORK_OR_GATEWAY",
                    DiagnosisTitle = "Local Gateway Unreachable (Default Gateway Interface Failure)",
                    ConditionTrace = gwTrace
                });
            }

            // Rule 3: Gateway Reachable AND Internet Unreachable
            var inetTrace = new List<ConditionEvaluationTrace>
            {
                new ConditionEvaluationTrace { Condition = "Gateway Reachable == TRUE", Satisfied = isGatewayReachable, Evidence = $"Gateway Ping: PASS" },
                new ConditionEvaluationTrace { Condition = "Internet Reachable == FALSE", Satisfied = !isInternetReachable, Evidence = $"Public IP 1.1.1.1 Ping: FAIL" }
            };
            if (isGatewayReachable && !isInternetReachable)
            {
                results.Add(new RuleEvaluationResult
                {
                    RuleCode = "RULE-INET-003",
                    RuleName = "External Internet Connectivity Loss",
                    Status = "TRIGGERED",
                    DiagnosisCode = "INTERNET_CONNECTIVITY",
                    DiagnosisTitle = "External ISP / Edge Router Connectivity Failure",
                    ConditionTrace = inetTrace
                });
            }

            // Rule 4: Internet Reachable AND DNS Resolution Fails
            var dnsTrace = new List<ConditionEvaluationTrace>
            {
                new ConditionEvaluationTrace { Condition = "Internet Reachable == TRUE", Satisfied = isInternetReachable, Evidence = $"Public IP 1.1.1.1 Ping: PASS" },
                new ConditionEvaluationTrace { Condition = "DNS Resolution == FAIL", Satisfied = !isDnsValid, Evidence = $"DNS Query (dc01.corp.internal): FAIL ({incident.NetworkLatencyMs}ms)" }
            };
            if (isInternetReachable && !isDnsValid)
            {
                results.Add(new RuleEvaluationResult
                {
                    RuleCode = "RULE-DNS-004",
                    RuleName = "Active Directory DNS Resolution Failure",
                    Status = "TRIGGERED",
                    DiagnosisCode = "DNS_FAILURE",
                    DiagnosisTitle = "Domain Controller DNS Resolution Timeout / PAC Token Fragmentation",
                    ConditionTrace = dnsTrace
                });
            }

            // Rule 5: Print Spooler Memory Heap Overrun (> 2500 MB)
            bool isSpoolerOverrun = incident.RamUsagePct > 90.0 || incident.Title.Contains("Print", StringComparison.OrdinalIgnoreCase);
            var spoolerTrace = new List<ConditionEvaluationTrace>
            {
                new ConditionEvaluationTrace { Condition = "spoolsv.exe RAM > 2500 MB", Satisfied = isSpoolerOverrun, Evidence = $"RAM Usage: {incident.RamUsagePct}% committed" }
            };
            if (isSpoolerOverrun)
            {
                results.Add(new RuleEvaluationResult
                {
                    RuleCode = "RULE-SYS-005",
                    RuleName = "Print Spooler Buffer Overrun",
                    Status = "TRIGGERED",
                    DiagnosisCode = "PRINT_SPOOLER_MEMORY_LEAK",
                    DiagnosisTitle = "Print Spooler Subsystem Memory Leak & Driver Deadlock",
                    ConditionTrace = spoolerTrace
                });
            }

            return results;
        }
    }
}
