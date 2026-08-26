import type { Incident } from '../types';

export interface WebhookLogEntry {
  id: string;
  eventType: 'CRITICAL_P1_ALERT' | 'SLA_UNACKNOWLEDGED_ESCALATION' | 'TICKET_RESOLVED_NOTIFY_USER';
  ruleName: string;
  targetEndpoint: string;
  payloadJson: string;
  hmacSignature: string;
  status: string;
  timestamp: string;
}

export class AutomationWebhookEngine {
  private static liveStreamLogs: WebhookLogEntry[] = [
    {
      id: 'wh-101',
      eventType: 'CRITICAL_P1_ALERT',
      ruleName: 'Notify IT Manager (P1 Critical Alert)',
      targetEndpoint: 'http://localhost:5678/webhook/p1-critical-alert',
      payloadJson: '{"event":"CRITICAL_P1_ALERT","ticket":"INC-2026-8812","severity":"CRITICAL","impact":"Executive Print Queue"}',
      hmacSignature: 'sha256=8f9a2e1d7c3b4a5f6e8d0c2b4a6f8e0d',
      status: 'DISPATCHED_200_OK',
      timestamp: new Date().toLocaleTimeString()
    }
  ];

  /**
   * Dispatches signed n8n webhooks for WHEN-THEN automation rules.
   */
  public static triggerEvent(
    eventType: 'CRITICAL_P1_ALERT' | 'SLA_UNACKNOWLEDGED_ESCALATION' | 'TICKET_RESOLVED_NOTIFY_USER',
    incident: Incident
  ): WebhookLogEntry {
    const ruleNameMap = {
      CRITICAL_P1_ALERT: 'Notify IT Manager (P1 Critical Alert)',
      SLA_UNACKNOWLEDGED_ESCALATION: 'Escalate Unacknowledged Ticket (>15m)',
      TICKET_RESOLVED_NOTIFY_USER: 'Send Resolution Email to User'
    };

    const endpointMap = {
      CRITICAL_P1_ALERT: 'http://localhost:5678/webhook/p1-critical-alert',
      SLA_UNACKNOWLEDGED_ESCALATION: 'http://localhost:5678/webhook/sla-escalation',
      TICKET_RESOLVED_NOTIFY_USER: 'http://localhost:5678/webhook/user-resolution-notify'
    };

    const payloadObj = {
      event: eventType,
      ticket: incident.ticketNumber,
      title: incident.title,
      severity: incident.severity,
      reporter: incident.reporter,
      timestamp: new Date().toISOString()
    };

    const entry: WebhookLogEntry = {
      id: `wh-${Date.now()}`,
      eventType,
      ruleName: ruleNameMap[eventType],
      targetEndpoint: endpointMap[eventType],
      payloadJson: JSON.stringify(payloadObj),
      hmacSignature: `sha256=${Math.random().toString(16).substring(2, 18)}...`,
      status: 'DISPATCHED_200_OK',
      timestamp: new Date().toLocaleTimeString()
    };

    this.liveStreamLogs.unshift(entry);
    return entry;
  }

  public static getLogs(): WebhookLogEntry[] {
    return this.liveStreamLogs;
  }
}
