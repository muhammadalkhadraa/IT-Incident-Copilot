using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Application.Diagnostics
{
    public class DiagnosticContext
    {
        public Guid IncidentId { get; set; }
        public string Hostname { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public double CpuUsagePct { get; set; }
        public double RamUsagePct { get; set; }
        public double DiskUsagePct { get; set; }
        public int NetworkLatencyMs { get; set; }
    }

    public class StructuredEvidenceResult
    {
        public string Test { get; set; } = string.Empty;
        public string Category { get; set; } = "NETWORK";
        public bool Success { get; set; }
        public string Output { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int LatencyMs { get; set; }
    }

    public interface IDiagnosticTest
    {
        string Name { get; }
        string Category { get; }
        Task<StructuredEvidenceResult> ExecuteAsync(DiagnosticContext context, CancellationToken cancellationToken = default);
    }

    public class PingGatewayTest : IDiagnosticTest
    {
        public string Name => "Ping Gateway";
        public string Category => "NETWORK";

        public Task<StructuredEvidenceResult> ExecuteAsync(DiagnosticContext context, CancellationToken cancellationToken)
        {
            return Task.FromResult(new StructuredEvidenceResult
            {
                Test = Name,
                Category = Category,
                Success = true,
                Output = "ICMP Echo reply from default gateway 10.140.0.1 in 12ms",
                Timestamp = DateTime.UtcNow,
                LatencyMs = 12
            });
        }
    }

    public class PingInternetTest : IDiagnosticTest
    {
        public string Name => "Ping Internet";
        public string Category => "NETWORK";

        public Task<StructuredEvidenceResult> ExecuteAsync(DiagnosticContext context, CancellationToken cancellationToken)
        {
            return Task.FromResult(new StructuredEvidenceResult
            {
                Test = Name,
                Category = Category,
                Success = true,
                Output = "ICMP Echo reply from public resolver 1.1.1.1 in 22ms",
                Timestamp = DateTime.UtcNow,
                LatencyMs = 22
            });
        }
    }

    public class DnsResolutionTest : IDiagnosticTest
    {
        public string Name => "DNS Resolution";
        public string Category => "NETWORK";

        public Task<StructuredEvidenceResult> ExecuteAsync(DiagnosticContext context, CancellationToken cancellationToken)
        {
            bool success = context.NetworkLatencyMs < 500;
            return Task.FromResult(new StructuredEvidenceResult
            {
                Test = Name,
                Category = Category,
                Success = success,
                Output = success 
                    ? "Successfully resolved dc01.corp.internal (10.140.0.10)" 
                    : $"Unable to resolve dc01.corp.internal (Timeout {context.NetworkLatencyMs}ms)",
                Timestamp = DateTime.UtcNow,
                LatencyMs = context.NetworkLatencyMs
            });
        }
    }

    public class IpConfigurationTest : IDiagnosticTest
    {
        public string Name => "IP Configuration";
        public string Category => "NETWORK";

        public Task<StructuredEvidenceResult> ExecuteAsync(DiagnosticContext context, CancellationToken cancellationToken)
        {
            return Task.FromResult(new StructuredEvidenceResult
            {
                Test = Name,
                Category = Category,
                Success = true,
                Output = $"Interface Ethernet0 configured with IP {context.IpAddress}/24 Gateway 10.140.0.1",
                Timestamp = DateTime.UtcNow,
                LatencyMs = 0
            });
        }
    }

    public class CpuUsageTest : IDiagnosticTest
    {
        public string Name => "CPU Usage";
        public string Category => "SYSTEM";

        public Task<StructuredEvidenceResult> ExecuteAsync(DiagnosticContext context, CancellationToken cancellationToken)
        {
            bool success = context.CpuUsagePct <= 85.0;
            return Task.FromResult(new StructuredEvidenceResult
            {
                Test = Name,
                Category = Category,
                Success = success,
                Output = success 
                    ? $"CPU utilization nominal ({context.CpuUsagePct}%)" 
                    : $"High CPU utilization warning ({context.CpuUsagePct}% sustained across thread pool)",
                Timestamp = DateTime.UtcNow,
                LatencyMs = 0
            });
        }
    }

    public class MemoryUsageTest : IDiagnosticTest
    {
        public string Name => "Memory Usage";
        public string Category => "SYSTEM";

        public Task<StructuredEvidenceResult> ExecuteAsync(DiagnosticContext context, CancellationToken cancellationToken)
        {
            bool success = context.RamUsagePct <= 90.0;
            return Task.FromResult(new StructuredEvidenceResult
            {
                Test = Name,
                Category = Category,
                Success = success,
                Output = success 
                    ? $"RAM utilization healthy ({context.RamUsagePct}%)" 
                    : $"Heap memory exhaustion detected ({context.RamUsagePct}% committed)",
                Timestamp = DateTime.UtcNow,
                LatencyMs = 0
            });
        }
    }
}
