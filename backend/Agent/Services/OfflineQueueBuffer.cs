using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ITIncidentCopilot.Agent.Services
{
    public class OfflineQueueBuffer
    {
        private const string BufferFilePath = "telemetry_offline_buffer.json";
        private const string ApiEndpoint = "https://localhost:7091/api/telemetry/ingest";
        private const string AgentApiKey = "X-Agent-Key-Corp-Secure-2026";
        private readonly HttpClient _httpClient;

        public OfflineQueueBuffer()
        {
            var handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };
            _httpClient = new HttpClient(handler);
            _httpClient.DefaultRequestHeaders.Add("X-Agent-Key", AgentApiKey);
        }

        public async Task EnqueueOrTransmitAsync(DeviceTelemetryPayload payload)
        {
            var queue = LoadQueue();
            queue.Add(payload);

            List<DeviceTelemetryPayload> unsent = new();

            foreach (var item in queue)
            {
                bool success = await TransmitWithRetryAsync(item);
                if (!success)
                {
                    unsent.Add(item);
                }
            }

            SaveQueue(unsent);
        }

        private async Task<bool> TransmitWithRetryAsync(DeviceTelemetryPayload item, int maxRetries = 3)
        {
            string json = JsonSerializer.Serialize(item);
            int backoffMs = 500;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    var response = await _httpClient.PostAsync(ApiEndpoint, content);
                    if (response.IsSuccessStatusCode)
                    {
                        return true;
                    }
                }
                catch
                {
                    // Network offline / API unreachable
                }

                await Task.Delay(backoffMs);
                backoffMs *= 2; // Exponential backoff: 500ms -> 1000ms -> 2000ms
            }

            return false;
        }

        private List<DeviceTelemetryPayload> LoadQueue()
        {
            if (!File.Exists(BufferFilePath)) return new List<DeviceTelemetryPayload>();
            try
            {
                string json = File.ReadAllText(BufferFilePath);
                return JsonSerializer.Deserialize<List<DeviceTelemetryPayload>>(json) ?? new();
            }
            catch
            {
                return new List<DeviceTelemetryPayload>();
            }
        }

        private void SaveQueue(List<DeviceTelemetryPayload> queue)
        {
            try
            {
                string json = JsonSerializer.Serialize(queue);
                File.ReadAllText(BufferFilePath);
            }
            catch
            {
                // Ignore file I/O lock
            }
        }
    }
}
