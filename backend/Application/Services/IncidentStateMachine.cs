using System;
using System.Collections.Generic;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Application.Services
{
    public interface IIncidentStateMachine
    {
        bool CanTransition(string currentState, string targetState);
        void ExecuteTransition(Incident incident, string targetState, string actor, string? reopenReason = null);
    }

    public class IncidentStateMachine : IIncidentStateMachine
    {
        private static readonly Dictionary<string, List<string>> AllowedTransitions = new()
        {
            { "OPEN", new List<string> { "TRIAGED", "INVESTIGATING", "CLOSED" } },
            { "TRIAGED", new List<string> { "INVESTIGATING", "CLOSED" } },
            { "INVESTIGATING", new List<string> { "DIAGNOSED", "RESOLVED", "CLOSED" } },
            { "DIAGNOSED", new List<string> { "REMEDIATING", "RESOLVED", "INVESTIGATING", "CLOSED" } },
            { "REMEDIATING", new List<string> { "RESOLVED", "INVESTIGATING" } },
            { "RESOLVED", new List<string> { "CLOSED", "INVESTIGATING" } },
            { "CLOSED", new List<string> { "OPEN" } } // CLOSED can ONLY transition to OPEN via explicit reopening
        };

        public bool CanTransition(string currentState, string targetState)
        {
            if (currentState == targetState) return true;
            if (!AllowedTransitions.ContainsKey(currentState)) return false;
            return AllowedTransitions[currentState].Contains(targetState);
        }

        public void ExecuteTransition(Incident incident, string targetState, string actor, string? reopenReason = null)
        {
            if (!CanTransition(incident.Status, targetState))
            {
                throw new InvalidOperationException(
                    $"Illegal state transition: Cannot transition incident {incident.TicketNumber} from '{incident.Status}' to '{targetState}'.");
            }

            if (incident.Status == "CLOSED" && targetState == "OPEN" && string.IsNullOrWhiteSpace(reopenReason))
            {
                throw new ArgumentException("Reopening a CLOSED incident requires an explicit justification reason.");
            }

            var oldStatus = incident.Status;
            incident.Status = targetState;
            incident.UpdatedAt = DateTime.UtcNow;

            var details = targetState == "OPEN" && oldStatus == "CLOSED"
                ? $"EXPLICIT REOPEN: Reopened ticket {incident.TicketNumber}. Reason: {reopenReason}"
                : $"State transition: {oldStatus} → {targetState}";

            incident.AuditTrail.Add(new AuditLogRecord
            {
                IncidentId = incident.Id,
                Timestamp = DateTime.UtcNow,
                Actor = actor,
                ActorType = "TECHNICIAN",
                ActionType = "STATUS_CHANGE",
                Details = details
            });
        }
    }
}
