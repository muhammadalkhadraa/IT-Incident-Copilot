import type { Incident, AIAnalysisResult, AIHypothesis } from '../types';

export class AICopilotService {
  /**
   * Generates AI-assisted Root Cause Analysis & Resolution synthesis.
   */
  public static analyzeIncident(incident: Incident): AIAnalysisResult {
    const failedRules = incident.diagnosticResults.filter(r => r.status === 'FAIL');
    const logs = incident.deviceTelemetry.logs;
    const latestMetrics = incident.deviceTelemetry.metrics[incident.deviceTelemetry.metrics.length - 1];

    let primaryHypothesis: AIHypothesis;
    let alternativeHypotheses: AIHypothesis[] = [];
    let summary = '';
    let copilotNotes = '';

    if (failedRules.some(r => r.ruleCode.includes('SYS-101') || r.ruleCode.includes('SYS-102'))) {
      primaryHypothesis = {
        id: `hyp-${Date.now()}-1`,
        title: 'Buffer Overrun & Memory Exhaustion in Print Spooler Subsystem',
        confidenceScore: 94,
        rootCauseCategory: 'Software Subsystem & Driver Memory Leak',
        reasoningChain: [
          `Detected CPU utilization at ${latestMetrics?.cpuUsagePct || 98}% with high thread count (${latestMetrics?.activeThreads || 1080}).`,
          `Rule ${failedRules[0]?.ruleCode || 'RULE-SYS-102'} triggered due to abnormal memory footprint in spoolsv.exe.`,
          `Event log ID ${logs[0]?.eventId || 1000} pinpointed module collision in printer driver binary.`,
          `Correlated with recent document submission by user "${incident.reporter}".`,
        ],
        evidenceFound: logs.map(l => `Event ${l.eventId} [${l.source}]: ${l.message}`),
        recommendedFix: 'Execute playbook ACT-SYS-RESTART-SPOOLER to flush invalid print jobs from buffer and cycle the Print Spooler service.',
      };

      alternativeHypotheses = [
        {
          id: `hyp-${Date.now()}-2`,
          title: 'Cascading OS Pagefile Thrashing',
          confidenceScore: 38,
          rootCauseCategory: 'System Resource Constraints',
          reasoningChain: [
            'System RAM utilization exceeded 95%.',
            'Virtual memory manager thrashing page file on system disk.',
          ],
          evidenceFound: ['RAM usage metric > 95%'],
          recommendedFix: 'Expand virtual memory allocation or reboot physical host.',
        }
      ];

      summary = `Primary root cause identified with 94% confidence: Print Spooler buffer deadlock in ${incident.deviceTelemetry.hostname}. Rapid remediation available via single-click automated spooler cycle playbook.`;
      copilotNotes = 'High similarity (96%) with past incident INC-2025-4109. No underlying network or storage hardware failure detected.';
    } else if (failedRules.some(r => r.ruleCode.includes('NET-201'))) {
      primaryHypothesis = {
        id: `hyp-${Date.now()}-1`,
        title: 'Active Directory Domain Controller DNS Forwarding Timeout',
        confidenceScore: 91,
        rootCauseCategory: 'Network Infrastructure & Name Resolution',
        reasoningChain: [
          `DNS query latency spiked to ${latestMetrics?.networkLatencyMs || 1800}ms (Threshold: 500ms).`,
          'Kerberos authentication tickets timing out for client endpoints.',
          'Event ID 4015 logged on Domain Controller interface.',
        ],
        evidenceFound: logs.map(l => `Event ${l.eventId}: ${l.message}`),
        recommendedFix: 'Execute ACT-NET-FLUSH-DNS to clear resolver cache and force UDP/TCP socket re-binding.',
      };
      summary = 'DNS latency bottleneck causing SSO and Kerberos ticket validation delays.';
      copilotNotes = 'Recommend executing DNS Cache Flush. Low risk execution (Risk Score: LOW).';
    } else {
      primaryHypothesis = {
        id: `hyp-${Date.now()}-1`,
        title: 'Storage Capacity Exhaustion on Primary Data Partition',
        confidenceScore: 96,
        rootCauseCategory: 'Database & Storage',
        reasoningChain: [
          `Data partition free space dropped below critical threshold (${latestMetrics?.diskUsagePct || 97}% occupied).`,
          'SQL Server database engine failing transaction log autogrow.',
        ],
        evidenceFound: logs.map(l => `Event ${l.eventId}: ${l.message}`),
        recommendedFix: 'Execute playbook ACT-SYS-EXPAND-DISK to reclaim temp storage and shrink transaction log.',
      };
      summary = 'Disk capacity exhaustion imminent. DBA approval requested for log truncation playbook.';
      copilotNotes = 'High urgency ticket. Approaching SLA deadline.';
    }

    return {
      incidentId: incident.id,
      analyzedAt: new Date().toISOString(),
      primaryHypothesis,
      alternativeHypotheses,
      summary,
      copilotNotes,
    };
  }

  /**
   * Interactive Q&A method for technician asking the Copilot questions about the incident.
   */
  public static answerQuestion(incident: Incident, question: string): string {
    const qLower = question.toLowerCase();
    
    if (qLower.includes('why') || qLower.includes('cause') || qLower.includes('reason')) {
      return `Based on telemetry & log correlation, the root cause is **${incident.aiAnalysis?.primaryHypothesis.title}** (Confidence: ${incident.aiAnalysis?.primaryHypothesis.confidenceScore}%). The evidence includes: ${incident.aiAnalysis?.primaryHypothesis.evidenceFound.slice(0, 2).join(', ')}.`;
    }
    
    if (qLower.includes('what should i do') || qLower.includes('next') || qLower.includes('fix') || qLower.includes('action')) {
      return `I recommend executing the playbook: **${incident.recommendedPlaybooks[0]?.title}**. ${incident.recommendedPlaybooks[0]?.requiresApproval ? '⚠️ Note: This script requires Tier-2 technician approval before execution.' : '✅ This is a safe, low-risk action.'}`;
    }

    if (qLower.includes('seen') || qLower.includes('similar') || qLower.includes('past') || qLower.includes('before')) {
      if (incident.similarIncidents.length > 0) {
        const topSim = incident.similarIncidents[0];
        return `Yes, we resolved a matching incident **${topSim.ticketNumber}** ("${topSim.title}") with **${topSim.similarityScore}% similarity**. Resolution applied by ${topSim.technician}: *"${topSim.resolutionSummary}"*.`;
      }
      return 'No exact historical duplicates found in the knowledge vector store for this specific telemetry pattern.';
    }

    return `Analyzing query regarding incident **${incident.ticketNumber}** on host **${incident.deviceTelemetry.hostname}**... Primary recommendation: ${incident.aiAnalysis?.primaryHypothesis.recommendedFix}`;
  }
}
