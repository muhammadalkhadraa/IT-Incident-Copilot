using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ITIncidentCopilot.Api.Hubs
{
    public class IncidentHub : Hub
    {
        public async Task JoinIncidentGroup(string incidentId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, incidentId);
        }

        public async Task LeaveIncidentGroup(string incidentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, incidentId);
        }

        public async Task BroadcastTelemetryPulse(string hostname, double cpuPct, double ramPct)
        {
            await Clients.All.SendAsync("ReceiveTelemetryPulse", hostname, cpuPct, ramPct);
        }
    }
}
