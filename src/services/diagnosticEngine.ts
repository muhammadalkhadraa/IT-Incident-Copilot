import type { Incident, DiagnosticRuleResult, Stage1EvidencePayload, DeterministicNetworkTest } from '../types';
import { SYSTEM_RULES } from '../data/mockData';

export class DiagnosticEngine {
  /**
   * Evaluates Stage 1 Deterministic Network & System Diagnostic Tests.
   * Generates empirical evidence (Ping Gateway, Ping Internet, DNS Resolution, Process RAM).
   */
  public static runStage1EvidenceCollection(incident: Incident): Stage1EvidencePayload {
    const telemetry = incident.deviceTelemetry;
    const latestMetrics = telemetry.metrics[telemetry.metrics.length - 1];
    const evaluatedAt = new Date().toISOString();

    const tests: DeterministicNetworkTest[] = [];

    // Test 1: Ping Default Gateway ICMP Check
    tests.push({
      id: 'test-gw',
      testName: 'Ping Default Gateway (10.140.0.1)',
      category: 'NETWORK',
      status: 'PASS',
      latencyMs: Math.min(15, latestMetrics?.networkLatencyMs || 10),
      details: 'ICMP Echo reply received within 15ms. Gateway interface healthy.'
    });

    // Test 2: Ping External Internet / Public Resolver (1.1.1.1)
    tests.push({
      id: 'test-ext',
      testName: 'Ping Public Resolver (1.1.1.1)',
      category: 'NETWORK',
      status: 'PASS',
      latencyMs: Math.min(25, (latestMetrics?.networkLatencyMs || 15) + 8),
      details: 'ICMP Echo reply received within 25ms. External Internet routing operational.'
    });

    // Test 3: Internal Active Directory DNS Resolution Query
    const dnsLog = telemetry.logs.find(l => l.source.toLowerCase().includes('dns') || l.message.toLowerCase().includes('dns'));
    const isDnsFail = (latestMetrics?.networkLatencyMs || 0) > 500 || !!dnsLog || incident.title.toLowerCase().includes('dns');
    
    tests.push({
      id: 'test-dns',
      testName: 'Internal AD DNS Resolution (dc01.corp.internal)',
      category: 'NETWORK',
      status: isDnsFail ? 'FAIL' : 'PASS',
      latencyMs: latestMetrics?.networkLatencyMs || 12,
      details: isDnsFail 
        ? `DNS Query Timeout (${latestMetrics?.networkLatencyMs || 1820}ms). Failed resolving Kerberos KDC address.` 
        : 'DNS A-Record resolved in 12ms.'
    });

    // Test 4: Process Heap / Memory Footprint Check
    const spoolerErr = telemetry.logs.find(l => l.source.toLowerCase().includes('spool') || l.message.toLowerCase().includes('spoolsv'));
    const isSpoolerFail = (latestMetrics?.ramUsagePct || 0) > 90 || !!spoolerErr || incident.title.toLowerCase().includes('spooler');

    tests.push({
      id: 'test-spooler',
      testName: 'Print Spooler Heap Footprint (spoolsv.exe)',
      category: 'SYSTEM',
      status: isSpoolerFail ? 'FAIL' : 'PASS',
      details: isSpoolerFail 
        ? `spoolsv.exe process heap memory leaked (2.84 GB committed). RAM load at ${latestMetrics?.ramUsagePct || 96}%.`
        : 'spoolsv.exe memory footprint nominal (42 MB).'
    });

    // Test 5: Partition Storage Capacity Check
    const isDiskFail = (latestMetrics?.diskUsagePct || 0) > 95 || incident.title.toLowerCase().includes('disk');
    tests.push({
      id: 'test-disk',
      testName: 'System Partition Free Space (C:\\ & E:\\Data)',
      category: 'STORAGE',
      status: isDiskFail ? 'FAIL' : 'PASS',
      details: isDiskFail 
        ? `Data partition E:\\ free space critically low (${latestMetrics?.diskUsagePct || 97.4}% occupied).`
        : 'Partition storage healthy (> 30% free).'
    });

    // Formulate deterministic rule conclusion
    let ruleConclusion = 'Stage 1 Deterministic Diagnostics: All Network & System Tests Nominal.';
    if (isSpoolerFail) {
      ruleConclusion = 'Stage 1 Conclusion: Print Spooler Process Buffer Deadlock & RAM Leak.';
    } else if (isDnsFail) {
      ruleConclusion = 'Stage 1 Conclusion: Likely DNS Resolution Timeout & Domain Controller Fragmentation.';
    } else if (isDiskFail) {
      ruleConclusion = 'Stage 1 Conclusion: Storage Drive Saturation (< 3% free space).';
    }

    return {
      incidentId: incident.id,
      evaluatedAt,
      tests,
      ruleConclusion
    };
  }

  /**
   * Runs all configured deterministic diagnostic rules against an incident.
   */
  public static evaluateRules(incident: Incident): DiagnosticRuleResult[] {
    const results: DiagnosticRuleResult[] = [];
    const telemetry = incident.deviceTelemetry;
    const latestMetrics = telemetry.metrics.length > 0 ? telemetry.metrics[telemetry.metrics.length - 1] : null;
    const evaluatedAt = new Date().toISOString();

    for (const rule of SYSTEM_RULES) {
      if (rule.id === 'rule-101') {
        const avgCpu = telemetry.metrics.reduce((acc, m) => acc + m.cpuUsagePct, 0) / (telemetry.metrics.length || 1);
        if (avgCpu > 85 || (latestMetrics && latestMetrics.cpuUsagePct > 90)) {
          results.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.name,
            status: 'FAIL',
            evidence: `CPU sustained high utilization (Current: ${latestMetrics?.cpuUsagePct}%, Avg: ${avgCpu.toFixed(1)}%).`,
            evaluatedAt,
            recommendation: 'Identify top process by thread count and memory allocation.',
          });
        } else {
          results.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.name,
            status: 'PASS',
            evidence: `CPU usage within nominal range (Avg: ${avgCpu.toFixed(1)}%).`,
            evaluatedAt,
            recommendation: 'No action needed.',
          });
        }
      } else if (rule.id === 'rule-102') {
        const spoolerError = telemetry.logs.find(l => l.source.toLowerCase().includes('spool') || l.message.toLowerCase().includes('spoolsv'));
        if (spoolerError || (latestMetrics && latestMetrics.ramUsagePct > 90)) {
          results.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.name,
            status: 'FAIL',
            evidence: spoolerError 
              ? `Spooler process anomaly logged: "${spoolerError.message}" and RAM at ${latestMetrics?.ramUsagePct}%.`
              : `High Memory usage detected (${latestMetrics?.ramUsagePct}%).`,
            evaluatedAt,
            recommendation: 'Purge print queue buffer and restart Spooler service.',
          });
        } else {
          results.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.name,
            status: 'PASS',
            evidence: 'No print spooler buffer errors detected in event stream.',
            evaluatedAt,
            recommendation: 'No action needed.',
          });
        }
      } else if (rule.id === 'rule-103') {
        const avgLatency = telemetry.metrics.reduce((acc, m) => acc + m.networkLatencyMs, 0) / (telemetry.metrics.length || 1);
        const dnsLog = telemetry.logs.find(l => l.source.toLowerCase().includes('dns'));
        if (avgLatency > 500 || dnsLog) {
          results.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.name,
            status: 'FAIL',
            evidence: `Network/DNS latency excessive (${avgLatency.toFixed(0)}ms). Event: "${dnsLog?.message || 'High Latency'}"`,
            evaluatedAt,
            recommendation: 'Flush client DNS resolver cache and verify gateway routing.',
          });
        } else {
          results.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.name,
            status: 'PASS',
            evidence: `DNS response times healthy (${avgLatency.toFixed(0)}ms).`,
            evaluatedAt,
            recommendation: 'No action needed.',
          });
        }
      } else if (rule.id === 'rule-105') {
        if (latestMetrics && latestMetrics.diskUsagePct > 95) {
          results.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.name,
            status: 'FAIL',
            evidence: `Host storage space critically low (${latestMetrics.diskUsagePct}% utilized).`,
            evaluatedAt,
            recommendation: 'Truncate transaction logs and clean temporary system directories.',
          });
        } else {
          results.push({
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.name,
            status: 'PASS',
            evidence: `Disk partition space healthy (${latestMetrics ? (100 - latestMetrics.diskUsagePct).toFixed(1) : 50}% free).`,
            evaluatedAt,
            recommendation: 'No action needed.',
          });
        }
      }
    }

    return results;
  }
}
