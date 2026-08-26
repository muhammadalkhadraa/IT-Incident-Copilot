using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Application.Services
{
    public class SimilarIncidentMatchDto
    {
        public string TicketNumber { get; set; } = string.Empty;
        public int SimilarityPercentage { get; set; }
        public string RootCause { get; set; } = string.Empty;
        public string Resolution { get; set; } = string.Empty;
        public DateTime ClosedAt { get; set; } = DateTime.UtcNow.AddDays(-5);
    }

    public interface ISimilarIncidentService
    {
        Task<List<SimilarIncidentMatchDto>> FindSimilarIncidentsAsync(string title, string description, int topK = 3);
    }

    public class SimilarIncidentService : ISimilarIncidentService
    {
        public Task<List<SimilarIncidentMatchDto>> FindSimilarIncidentsAsync(string title, string description, int topK = 3)
        {
            var matches = new List<SimilarIncidentMatchDto>();

            if (title.Contains("Print", StringComparison.OrdinalIgnoreCase) || description.Contains("spooler", StringComparison.OrdinalIgnoreCase))
            {
                matches.Add(new SimilarIncidentMatchDto
                {
                    TicketNumber = "INC-00921",
                    SimilarityPercentage = 94,
                    RootCause = "Expired Kerberos / SSL print server certificate & spoolsv heap leak.",
                    Resolution = "Certificate renewed, restarted Spooler service, and cleared C:\\Windows\\System32\\spool\\PRINTERS queue.",
                    ClosedAt = DateTime.UtcNow.AddDays(-3)
                });

                matches.Add(new SimilarIncidentMatchDto
                {
                    TicketNumber = "INC-00844",
                    SimilarityPercentage = 88,
                    RootCause = "Corrupt HP UPD driver v4.2 thread deadlock.",
                    Resolution = "Rolled back printer driver to v4.1 WHQL package across print server.",
                    ClosedAt = DateTime.UtcNow.AddDays(-12)
                });
            }
            else
            {
                matches.Add(new SimilarIncidentMatchDto
                {
                    TicketNumber = "INC-00710",
                    SimilarityPercentage = 91,
                    RootCause = "Edge Gateway BGP route flap.",
                    Resolution = "Restarted primary gateway interface & re-established BGP peer session.",
                    ClosedAt = DateTime.UtcNow.AddDays(-7)
                });
            }

            return Task.FromResult(matches);
        }
    }
}
