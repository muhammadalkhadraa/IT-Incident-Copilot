using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Application.DTOs;
using ITIncidentCopilot.Api.Data;
using ITIncidentCopilot.Api.Entities;
using ITIncidentCopilot.Api.Hubs;
using ITIncidentCopilot.Api.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ITIncidentCopilot.Api.Application.Services
{
    public interface IIncidentService
    {
        Task<IEnumerable<IncidentResponseDto>> GetIncidentsAsync(string? severity, string? status);
        Task<IncidentResponseDto?> GetIncidentByIdAsync(Guid id);
        Task<IncidentResponseDto> CreateIncidentAsync(CreateIncidentRequestDto dto);
        Task<IncidentResponseDto?> UpdateStatusAsync(Guid id, string newStatus, string updatedBy);
    }

    public class IncidentService : IIncidentService
    {
        private readonly AppDbContext _db;
        private readonly IDiagnosticEngineService _diagnosticEngine;
        private readonly IAiService _aiService;
        private readonly IHubContext<IncidentHub> _hubContext;

        public IncidentService(
            AppDbContext db,
            IDiagnosticEngineService diagnosticEngine,
            IAiService aiService,
            IHubContext<IncidentHub> hubContext)
        {
            _db = db;
            _diagnosticEngine = diagnosticEngine;
            _aiService = aiService;
            _hubContext = hubContext;
        }

        public async Task<IEnumerable<IncidentResponseDto>> GetIncidentsAsync(string? severity, string? status)
        {
            try
            {
                if (!await _db.Incidents.AnyAsync())
                {
                    await SeedInitialIncidentsAsync();
                }

                var query = _db.Incidents
                    .Include(i => i.DiagnosticResults)
                    .Include(i => i.AuditTrail)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(severity)) query = query.Where(i => i.Severity == severity);
                if (!string.IsNullOrEmpty(status)) query = query.Where(i => i.Status == status);

                var incidents = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
                return incidents.Select(MapToDto);
            }
            catch
            {
                // Fallback when PostgreSQL database container is offline
                return GetInMemorySeedIncidents();
            }
        }

        private IEnumerable<IncidentResponseDto> GetInMemorySeedIncidents()
        {
            return new List<IncidentResponseDto>
            {
                new IncidentResponseDto
                {
                    Id = Guid.NewGuid(),
                    TicketNumber = "INC-2026-8812",
                    Title = "Executive Print Spooler Service Crashing & Memory Leak",
                    Description = "HOST-EXEC-PRT04 spoolsv.exe process heap memory usage growing rapidly to 2.8 GB.",
                    Severity = "CRITICAL",
                    Status = "INVESTIGATING",
                    Category = "Infrastructure / EndUser Services",
                    Hostname = "HOST-EXEC-PRT04.corp.internal",
                    Reporter = "Marcus Vance",
                    AssignedTechnician = "Alex Thorne",
                    CreatedAt = DateTime.UtcNow.AddHours(-2),
                    UpdatedAt = DateTime.UtcNow,
                    AiSummary = "High-confidence print spooler heap exhaustion hypothesis.",
                    AiConfidenceScore = 94,
                    PrimaryHypothesisTitle = "Print Spooler Heap Exhaustion & Buffer Leak"
                }
            };
        }

        private async Task SeedInitialIncidentsAsync()
        {
            var inc1 = new Incident
            {
                Id = Guid.NewGuid(),
                TicketNumber = "INC-2026-8812",
                Title = "Executive Print Spooler Service Crashing & Memory Leak",
                Description = "HOST-EXEC-PRT04 spoolsv.exe process heap memory usage growing rapidly to 2.8 GB.",
                Category = "Infrastructure / EndUser Services",
                Severity = "CRITICAL",
                Status = "INVESTIGATING",
                Hostname = "HOST-EXEC-PRT04.corp.internal",
                Reporter = "Marcus Vance",
                AssignedTechnician = "Alex Thorne",
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                UpdatedAt = DateTime.UtcNow,
                AiSummary = "High-confidence print spooler heap exhaustion hypothesis.",
                AiConfidenceScore = 94,
                PrimaryHypothesisTitle = "Print Spooler Heap Exhaustion & Buffer Leak"
            };

            _db.Incidents.Add(inc1);
            await _db.SaveChangesAsync();
        }

        public async Task<IncidentResponseDto?> GetIncidentByIdAsync(Guid id)
        {
            var incident = await _db.Incidents
                .Include(i => i.DiagnosticResults)
                .Include(i => i.AuditTrail)
                .FirstOrDefaultAsync(i => i.Id == id);

            return incident == null ? null : MapToDto(incident);
        }

        public async Task<IncidentResponseDto> CreateIncidentAsync(CreateIncidentRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title)) throw new ArgumentException("Incident title is required.");

            var ticketNo = $"INC-2026-{Random.Shared.Next(1000, 9999)}";

            var incident = new Incident
            {
                TicketNumber = ticketNo,
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                Severity = dto.Severity,
                Status = "DIAGNOSING",
                Reporter = dto.Reporter,
                Hostname = dto.Hostname,
                CpuUsagePct = 95.4,
                RamUsagePct = 92.1,
                NetworkLatencyMs = 24,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // 1. Run Deterministic Diagnostic Engine (Rule Checks)
            var diagResults = _diagnosticEngine.EvaluateDeterministicRules(incident);
            incident.DiagnosticResults = diagResults;

            // 2. Run AI Synthesis Engine (Generative AI Reasoning based on Evidence)
            var aiDiagnosis = await _aiService.ClassifyAndDiagnoseAsync(incident);
            incident.AiSummary = aiDiagnosis.Summary;
            incident.AiConfidenceScore = aiDiagnosis.ConfidenceScore;
            incident.PrimaryHypothesisTitle = aiDiagnosis.PrimaryHypothesisTitle;

            // 3. Append Audit Trail
            incident.AuditTrail.Add(new AuditLogRecord
            {
                Actor = dto.Reporter,
                ActorType = "TECHNICIAN",
                ActionType = "TELEMETRY_ALERT",
                Details = $"Ticket {ticketNo} created. Evaluated {diagResults.Count} deterministic rules."
            });

            _db.Incidents.Add(incident);
            await _db.SaveChangesAsync();

            // 4. SignalR Notification
            await _hubContext.Clients.All.SendAsync("IncidentCreated", incident.Id, ticketNo, dto.Title);

            return MapToDto(incident);
        }

        public async Task<IncidentResponseDto?> UpdateStatusAsync(Guid id, string newStatus, string updatedBy)
        {
            var incident = await _db.Incidents.Include(i => i.AuditTrail).FirstOrDefaultAsync(i => i.Id == id);
            if (incident == null) return null;

            incident.Status = newStatus;
            incident.UpdatedAt = DateTime.UtcNow;

            incident.AuditTrail.Add(new AuditLogRecord
            {
                Actor = updatedBy,
                ActorType = "TECHNICIAN",
                ActionType = "STATUS_CHANGE",
                Details = $"Changed status to {newStatus}."
            });

            await _db.SaveChangesAsync();
            return MapToDto(incident);
        }

        private static IncidentResponseDto MapToDto(Incident inc)
        {
            return new IncidentResponseDto
            {
                Id = inc.Id,
                TicketNumber = inc.TicketNumber,
                Title = inc.Title,
                Description = inc.Description,
                Severity = inc.Severity,
                Status = inc.Status,
                Category = inc.Category,
                Hostname = inc.Hostname,
                Reporter = inc.Reporter,
                AssignedTechnician = inc.AssignedTechnician,
                CreatedAt = inc.CreatedAt,
                UpdatedAt = inc.UpdatedAt,
                AiSummary = inc.AiSummary,
                AiConfidenceScore = inc.AiConfidenceScore,
                PrimaryHypothesisTitle = inc.PrimaryHypothesisTitle,
                DiagnosticResults = inc.DiagnosticResults.Select(r => new DiagnosticResultDto
                {
                    RuleCode = r.RuleCode,
                    RuleName = r.RuleName,
                    Status = r.Status,
                    Evidence = r.Evidence,
                    Recommendation = r.Recommendation
                }).ToList(),
                AuditTrail = inc.AuditTrail.Select(a => new AuditLogDto
                {
                    Timestamp = a.Timestamp,
                    Actor = a.Actor,
                    ActionType = a.ActionType,
                    Details = a.Details
                }).ToList()
            };
        }
    }
}
