import type { IncidentStatus } from '../types';

export class IncidentStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
    NEW: ['DIAGNOSING', 'AWAITING_APPROVAL', 'CLOSED'],
    DIAGNOSING: ['AWAITING_APPROVAL', 'REMEDIATING', 'RESOLVED', 'CLOSED'],
    AWAITING_APPROVAL: ['REMEDIATING', 'DIAGNOSING', 'RESOLVED', 'CLOSED'],
    REMEDIATING: ['RESOLVED', 'DIAGNOSING', 'CLOSED'],
    RESOLVED: ['CLOSED', 'DIAGNOSING'],
    CLOSED: ['NEW'] // Closed incidents can ONLY transition back to NEW via explicit reopening
  };

  /**
   * Evaluates if a state transition is legal.
   */
  public static canTransition(currentStatus: IncidentStatus, targetStatus: IncidentStatus): boolean {
    if (currentStatus === targetStatus) return true;
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }

  /**
   * Returns list of allowed target statuses for a given current status.
   */
  public static getValidNextStatuses(currentStatus: IncidentStatus): IncidentStatus[] {
    return this.ALLOWED_TRANSITIONS[currentStatus] || [];
  }
}
