import type { Incident, IncidentSeverity } from '../types';

export interface PriorityBreakdown {
  compositeScore: number;
  computedSeverity: IncidentSeverity;
  businessImpactScore: number;
  affectedUsersScore: number;
  serviceCriticalityScore: number;
  technicalSeverityScore: number;
}

export class PriorityCalculator {
  /**
   * Calculates multi-factor priority score:
   * (Impact * 0.30) + (Users * 0.25) + (Criticality * 0.25) + (Severity * 0.20)
   */
  public static calculatePriority(
    businessImpact: number = 2,
    affectedUsersCount: number = 10,
    serviceCriticality: number = 2,
    severity: IncidentSeverity = 'MEDIUM'
  ): PriorityBreakdown {
    const impactScore = Math.min(4, Math.max(1, businessImpact));

    let usersScore = 1;
    if (affectedUsersCount > 500) usersScore = 4;
    else if (affectedUsersCount > 50) usersScore = 3;
    else if (affectedUsersCount > 5) usersScore = 2;

    const criticalityScore = Math.min(4, Math.max(1, serviceCriticality));

    const severityScoreMap: Record<IncidentSeverity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };
    const severityScore = severityScoreMap[severity];

    const compositeScore = Math.round(((impactScore * 0.30) + (usersScore * 0.25) + (criticalityScore * 0.25) + (severityScore * 0.20)) * 100) / 100;

    let computedSeverity: IncidentSeverity = 'LOW';
    if (compositeScore >= 3.5) computedSeverity = 'CRITICAL';
    else if (compositeScore >= 2.5) computedSeverity = 'HIGH';
    else if (compositeScore >= 1.8) computedSeverity = 'MEDIUM';

    return {
      compositeScore,
      computedSeverity,
      businessImpactScore: impactScore,
      affectedUsersScore: usersScore,
      serviceCriticalityScore: criticalityScore,
      technicalSeverityScore: severityScore
    };
  }

  /**
   * Evaluates priority score for an incident instance.
   */
  public static evaluateIncidentPriority(incident: Incident): PriorityBreakdown {
    return this.calculatePriority(
      incident.businessImpactScore || 3,
      incident.affectedUsersCount || 150,
      incident.serviceCriticalityScore || 3,
      incident.severity
    );
  }
}
