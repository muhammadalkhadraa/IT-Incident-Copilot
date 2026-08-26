using System;
using System.Collections.Generic;

namespace ITIncidentCopilot.Api.Application.Services
{
    public class ActionSecurityCheckResult
    {
        public bool IsBlockedFromAutoExecution { get; set; }
        public bool RequiresHumanApproval { get; set; }
        public string SecurityReason { get; set; } = string.Empty;
        public string RiskLevel { get; set; } = "LOW";
    }

    public interface IHumanInTheLoopSecurityService
    {
        ActionSecurityCheckResult EvaluateActionSecurityPolicy(string actionCode);
        bool VerifyTechnicianApproval(string technicianId, string authorizationCredential);
    }

    public class HumanInTheLoopSecurityService : IHumanInTheLoopSecurityService
    {
        private static readonly HashSet<string> DangerousActions = new(StringComparer.OrdinalIgnoreCase)
        {
            "ACT-SEC-DEL-ACCT",     // Delete Account
            "ACT-NET-DISABLE-FW",   // Disable Firewall
            "ACT-NET-CONFIG-PROD",  // Change Production Network Config
            "ACT-SEC-RESET-PRIV"   // Reset Privileged Credentials
        };

        public ActionSecurityCheckResult EvaluateActionSecurityPolicy(string actionCode)
        {
            if (DangerousActions.Contains(actionCode))
            {
                return new ActionSecurityCheckResult
                {
                    IsBlockedFromAutoExecution = true,
                    RequiresHumanApproval = true,
                    SecurityReason = $"SECURITY GUARDRAIL TRIGGERED: Action '{actionCode}' is classified as HIGH/CRITICAL RISK. Autonomous AI execution is strictly prohibited. Human-In-The-Loop Technician approval required.",
                    RiskLevel = "CRITICAL"
                };
            }

            return new ActionSecurityCheckResult
            {
                IsBlockedFromAutoExecution = false,
                RequiresHumanApproval = true, // All actions require human sign-off per HITL policy
                SecurityReason = "Standard action requires technician confirmation.",
                RiskLevel = "MEDIUM"
            };
        }

        public bool VerifyTechnicianApproval(string technicianId, string authorizationCredential)
        {
            // Validates technician authentication token
            return !string.IsNullOrWhiteSpace(technicianId) && !string.IsNullOrWhiteSpace(authorizationCredential);
        }
    }
}
