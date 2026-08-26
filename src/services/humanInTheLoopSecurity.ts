export interface SecurityCheckPolicy {
  isBlockedFromAutoExecution: boolean;
  requiresHumanApproval: boolean;
  securityReason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class HumanInTheLoopSecurity {
  private static DANGEROUS_ACTION_CODES = new Set([
    'ACT-SEC-DEL-ACCT',     // Delete Account
    'ACT-NET-DISABLE-FW',   // Disable Firewall
    'ACT-NET-CONFIG-PROD',  // Change Production Network Config
    'ACT-SEC-RESET-PRIV',   // Reset Privileged Credentials
    'ACT-SEC-ISOLATE-HOST'  // Host Isolation
  ]);

  /**
   * Evaluates security policy for proposed automated playbooks.
   */
  public static evaluatePolicy(actionCode: string): SecurityCheckPolicy {
    if (this.DANGEROUS_ACTION_CODES.has(actionCode)) {
      return {
        isBlockedFromAutoExecution: true,
        requiresHumanApproval: true,
        securityReason: `SECURITY GUARDRAIL TRIGGERED: Action '${actionCode}' is classified as HIGH/CRITICAL RISK. Autonomous AI execution is strictly prohibited. Human-In-The-Loop Technician approval required.`,
        riskLevel: 'CRITICAL'
      };
    }

    return {
      isBlockedFromAutoExecution: false,
      requiresHumanApproval: true, // 100% of actions require human sign-off per HITL policy
      securityReason: 'Standard action requires technician confirmation.',
      riskLevel: 'MEDIUM'
    };
  }
}
