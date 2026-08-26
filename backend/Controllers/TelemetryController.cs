using System;
using System.Threading.Tasks;
using ITIncidentCopilot.Agent.Services;
using ITIncidentCopilot.Api.Data;
using ITIncidentCopilot.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITIncidentCopilot.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TelemetryController : ControllerBase
    {
        private readonly AppDbContext _dbContext;

        public TelemetryController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("ingest")]
        public async Task<IActionResult> IngestTelemetry([FromHeader(Name = "X-Agent-Key")] string agentKey, [FromBody] DeviceTelemetryPayload payload)
        {
            if (string.IsNullOrWhiteSpace(agentKey) || !agentKey.StartsWith("X-Agent-Key"))
            {
                return Unauthorized(new { message = "Invalid or missing Agent API Key." });
            }

            var device = await _dbContext.Devices.FirstOrDefaultAsync(d => d.Hostname == payload.Hostname);
            if (device == null)
            {
                device = new Device
                {
                    Id = Guid.NewGuid(),
                    Hostname = payload.Hostname,
                    IpAddress = payload.IpAddress,
                    OS = payload.OS,
                    AgentVersion = "v4.8.2-enterprise",
                    Status = "HEALTHY"
                };
                _dbContext.Devices.Add(device);
            }

            device.CpuUsagePct = payload.CpuUsagePct;
            device.RamUsagePct = payload.RamUsagePct;
            device.DiskUsagePct = payload.DiskUsagePct;
            device.NetworkLatencyMs = payload.NetworkLatencyMs;
            device.Status = payload.CpuUsagePct > 90 ? "CRITICAL" : payload.CpuUsagePct > 80 ? "DEGRADED" : "HEALTHY";

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                status = "SUCCESS",
                message = $"Telemetry ingested for {payload.Hostname}",
                receivedAt = DateTime.UtcNow
            });
        }
    }
}
