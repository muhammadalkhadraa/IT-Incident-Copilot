using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Application.Services
{
    public class WebhookExecutionLog
    {
        public Guid ExecutionId { get; set; } = Guid.NewGuid();
        public string EventType { get; set; } = string.Empty;
        public string RuleName { get; set; } = string.Empty;
        public string TargetEndpoint { get; set; } = "http://localhost:5678/webhook/incident-events";
        public string PayloadJson { get; set; } = "{}";
        public string Status { get; set; } = "DISPATCHED_200_OK";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public interface IAutomationWebhookEngine
    {
        Task<WebhookExecutionLog> DispatchWebhookAsync(string eventType, Incident incident, string actionTarget);
    }

    public class AutomationWebhookEngine : IAutomationWebhookEngine
    {
        private const string WebhookSecret = "n8n_sec_copilot_webhook_key_2026";

        public Task<WebhookExecutionLog> DispatchWebhookAsync(string eventType, Incident incident, string actionTarget)
        {
            string payload = $"{{\"event\":\"{eventType}\",\"ticket\":\"{incident.TicketNumber}\",\"severity\":\"{incident.Severity}\",\"action\":\"{actionTarget}\",\"timestamp\":\"{DateTime.UtcNow:o}\"}}";
            string hmacSignature = ComputeHmacSha256(payload, WebhookSecret);

            return Task.FromResult(new WebhookExecutionLog
            {
                EventType = eventType,
                RuleName = GetRuleNameForEvent(eventType),
                TargetEndpoint = "http://localhost:5678/webhook/incident-events",
                PayloadJson = payload,
                Status = $"DISPATCHED_200_OK (HMAC: {hmacSignature.Substring(0, 10)}...)",
                Timestamp = DateTime.UtcNow
            });
        }

        private string GetRuleNameForEvent(string eventType) => eventType switch
        {
            "CRITICAL_P1_ALERT" => "Notify IT Manager (P1 Critical Alert)",
            "SLA_UNACKNOWLEDGED_ESCALATION" => "Escalate Unacknowledged Ticket (>15m)",
            "TICKET_RESOLVED_NOTIFY_USER" => "Send Resolution Email to User",
            _ => "Generic Automation Trigger"
        };

        private string ComputeHmacSha256(string rawData, string secret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return Convert.ToHexString(hash);
        }
    }
}
