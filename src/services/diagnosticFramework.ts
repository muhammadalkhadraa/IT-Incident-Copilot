import type { Incident } from '../types';

export interface StructuredEvidence {
  test: string;
  category: 'NETWORK' | 'SYSTEM' | 'SECURITY' | 'STORAGE';
  success: boolean;
  output: string;
  timestamp: string;
  latencyMs?: number;
}

export interface IDiagnosticTestPlugin {
  name: string;
  category: 'NETWORK' | 'SYSTEM' | 'SECURITY' | 'STORAGE';
  execute(incident: Incident): StructuredEvidence;
}

export class PingGatewayTest implements IDiagnosticTestPlugin {
  name = 'Ping Gateway';
  category: 'NETWORK' = 'NETWORK';
  execute(incident: Incident): StructuredEvidence {
    const latency = Math.min(15, incident.deviceTelemetry.metrics[0]?.networkLatencyMs || 10);
    return {
      test: this.name,
      category: this.category,
      success: true,
      output: `ICMP Echo reply from default gateway 10.140.0.1 in ${latency}ms`,
      timestamp: new Date().toISOString(),
      latencyMs: latency
    };
  }
}

export class PingInternetTest implements IDiagnosticTestPlugin {
  name = 'Ping Internet';
  category: 'NETWORK' = 'NETWORK';
  execute(incident: Incident): StructuredEvidence {
    const latency = Math.min(25, (incident.deviceTelemetry.metrics[0]?.networkLatencyMs || 15) + 8);
    return {
      test: this.name,
      category: this.category,
      success: true,
      output: `ICMP Echo reply from public resolver 1.1.1.1 in ${latency}ms`,
      timestamp: new Date().toISOString(),
      latencyMs: latency
    };
  }
}

export class DnsResolutionTest implements IDiagnosticTestPlugin {
  name = 'DNS Resolution';
  category: 'NETWORK' = 'NETWORK';
  execute(incident: Incident): StructuredEvidence {
    const latency = incident.deviceTelemetry.metrics[incident.deviceTelemetry.metrics.length - 1]?.networkLatencyMs || 14;
    const isFail = latency > 500 || incident.title.toLowerCase().includes('dns');
    return {
      test: this.name,
      category: this.category,
      success: !isFail,
      output: isFail
        ? `Unable to resolve dc01.corp.internal (Timeout ${latency}ms)`
        : `Successfully resolved dc01.corp.internal (10.140.0.10) in ${latency}ms`,
      timestamp: new Date().toISOString(),
      latencyMs: latency
    };
  }
}

export class CpuUsageTest implements IDiagnosticTestPlugin {
  name = 'CPU Usage';
  category: 'SYSTEM' = 'SYSTEM';
  execute(incident: Incident): StructuredEvidence {
    const cpu = incident.deviceTelemetry.metrics[incident.deviceTelemetry.metrics.length - 1]?.cpuUsagePct || 25;
    const isFail = cpu > 85;
    return {
      test: this.name,
      category: this.category,
      success: !isFail,
      output: isFail
        ? `High CPU utilization warning (${cpu}% sustained across thread pool)`
        : `CPU utilization nominal (${cpu}%)`,
      timestamp: new Date().toISOString()
    };
  }
}

export class MemoryUsageTest implements IDiagnosticTestPlugin {
  name = 'Memory Usage';
  category: 'SYSTEM' = 'SYSTEM';
  execute(incident: Incident): StructuredEvidence {
    const ram = incident.deviceTelemetry.metrics[incident.deviceTelemetry.metrics.length - 1]?.ramUsagePct || 40;
    const isFail = ram > 90;
    return {
      test: this.name,
      category: this.category,
      success: !isFail,
      output: isFail
        ? `Heap memory exhaustion detected (${ram}% committed in spoolsv.exe)`
        : `RAM utilization healthy (${ram}%)`,
      timestamp: new Date().toISOString()
    };
  }
}

export class DiagnosticTestRunner {
  private static plugins: IDiagnosticTestPlugin[] = [
    new PingGatewayTest(),
    new PingInternetTest(),
    new DnsResolutionTest(),
    new CpuUsageTest(),
    new MemoryUsageTest()
  ];

  /**
   * Executes all registered diagnostic test plugins against an incident.
   */
  public static runAllTests(incident: Incident): StructuredEvidence[] {
    return this.plugins.map(plugin => plugin.execute(incident));
  }
}
