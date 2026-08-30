using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Application.DTOs;
using ITIncidentCopilot.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace ITIncidentCopilot.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IncidentsController : ControllerBase
    {
        private readonly IIncidentService _incidentService;

        public IncidentsController(IIncidentService incidentService)
        {
            _incidentService = incidentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IncidentResponseDto>>> GetIncidents([FromQuery] string? severity, [FromQuery] string? status)
        {
            var incidents = await _incidentService.GetIncidentsAsync(severity, status);
            return Ok(incidents);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IncidentResponseDto>> GetIncidentById(Guid id)
        {
            var incident = await _incidentService.GetIncidentByIdAsync(id);
            if (incident == null) return NotFound();
            return Ok(incident);
        }

        [HttpPost]
        public async Task<ActionResult<IncidentResponseDto>> CreateIncident([FromBody] CreateIncidentRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.IpAddress))
            {
                var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                if (!string.IsNullOrEmpty(remoteIp))
                {
                    dto.IpAddress = remoteIp == "::1" ? "127.0.0.1 (Localhost)" : remoteIp;
                }
                else
                {
                    dto.IpAddress = "192.168.1.105";
                }
            }

            var result = await _incidentService.CreateIncidentAsync(dto);
            return CreatedAtAction(nameof(GetIncidentById), new { id = result.Id }, result);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<IncidentResponseDto>> UpdateStatus(Guid id, [FromBody] UpdateStatusRequestDto dto)
        {
            var updatedBy = User.Identity?.Name ?? "Technician";
            var result = await _incidentService.UpdateStatusAsync(id, dto.NewStatus, updatedBy);
            if (result == null) return NotFound();
            return Ok(result);
        }
    }
}
