import type { Incident, DiagnosticRule, KBArticle, PlaybookAction } from '../types';

export const SYSTEM_RULES: DiagnosticRule[] = [
  {
    id: 'rule-101',
    ruleCode: 'RULE-SYS-101',
    name: 'Critical CPU Saturation',
    category: 'SYSTEM',
    description: 'Evaluates if host CPU utilization remains above 90% for > 5 consecutive metric intervals.',
    condition: 'AVG(cpuUsagePct) > 90% over 5m',
  },
  {
    id: 'rule-102',
    ruleCode: 'RULE-SYS-102',
    name: 'Print Spooler Heap Exhaustion',
    category: 'APPLICATION',
    description: 'Detects memory leak pattern in spoolsv.exe process exceeding 2.5 GB committed memory.',
    condition: 'ProcessMemory(spoolsv.exe) > 2500MB',
  },
  {
    id: 'rule-103',
    ruleCode: 'RULE-NET-201',
    name: 'DNS Resolution Failure / Timeout',
    category: 'NETWORK',
    description: 'Checks if internal DNS queries fail or latency exceeds 1500ms.',
    condition: 'DNS_Query_Latency > 1500ms OR Failed_Resolutions > 3',
  },
  {
    id: 'rule-104',
    ruleCode: 'RULE-SEC-301',
    name: 'Repeated Kerberos Authentication Failure',
    category: 'SECURITY',
    description: 'Monitors Event ID 4625 for brute force or credential mismatch on Domain Controller.',
    condition: 'Count(EventID == 4625) > 10 in 60s',
  },
  {
    id: 'rule-105',
    ruleCode: 'RULE-DB-401',
    name: 'Database Storage Critical Threshold',
    category: 'DATABASE',
    description: 'Alerts when data partition free disk space falls below 5%.',
    condition: 'DiskFreePct(DataDrive) < 5%',
  },
];

export const PLAYBOOK_LIBRARY: PlaybookAction[] = [
  {
    id: 'action-1',
    code: 'ACT-SYS-RESTART-SPOOLER',
    title: 'Flush Print Queue & Cycle Spooler Service',
    description: 'Safely purges corrupt spool files from %SystemRoot%\\System32\\spool\\PRINTERS and restarts spoolsv service.',
    scriptType: 'POWERSHELL',
    riskLevel: 'LOW',
    requiresApproval: false,
    estimatedDurationSec: 15,
    scriptSnippet: `Stop-Service -Name "Spooler" -Force
Remove-Item -Path "$env:SystemRoot\\System32\\spool\\PRINTERS\\*" -Force -Recurse
Start-Service -Name "Spooler"
Get-Service -Name "Spooler" | Select-Object Status, Name`,
  },
  {
    id: 'action-2',
    code: 'ACT-NET-FLUSH-DNS',
    title: 'Flush DNS Cache & Register Host Name',
    description: 'Clears resolver cache and updates Dynamic DNS registration on primary interface.',
    scriptType: 'POWERSHELL',
    riskLevel: 'LOW',
    requiresApproval: false,
    estimatedDurationSec: 8,
    scriptSnippet: `Clear-DnsClientCache
Register-DnsClient
Test-NetConnection -ComputerName "dc01.corp.internal" -Port 53`,
  },
  {
    id: 'action-3',
    code: 'ACT-SYS-EXPAND-DISK',
    title: 'Truncate Temp Logs & Compress Database Audit Trail',
    description: 'Reclaims disk space by purging old IIS/App logs and executing log table truncation.',
    scriptType: 'POWERSHELL',
    riskLevel: 'MEDIUM',
    requiresApproval: true,
    estimatedDurationSec: 45,
    scriptSnippet: `Get-ChildItem -Path "C:\\inetpub\\logs\\LogFiles" -Recurse | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | Remove-Item -Force
Invoke-Sqlcmd -Query "ALTER DATABASE [AppAuditDB] SET RECOVERY SIMPLE; DBCC SHRINKFILE (N'AppAuditDB_Log' , 500);"`,
  },
  {
    id: 'action-4',
    code: 'ACT-SEC-ISOLATE-HOST',
    title: 'Emergency Network Host Isolation',
    description: 'Applies EDR quarantine rule to block all inbound/outbound IP traffic except security controller agent.',
    scriptType: 'POWERSHELL',
    riskLevel: 'HIGH',
    requiresApproval: true,
    estimatedDurationSec: 10,
    scriptSnippet: `New-NetFirewallRule -DisplayName "EDR_Quarantine_BlockAll" -Direction Inbound -Action Block -Enabled True
New-NetFirewallRule -DisplayName "EDR_Quarantine_BlockOut" -Direction Outbound -Action Block -Enabled True`,
  },
];

export const KNOWLEDGE_BASE_ARTICLES: KBArticle[] = [
  {
    id: 'kb-101',
    articleCode: 'KB-88392',
    title: 'Resolving Print Spooler Memory Leaks in Windows Server 2022',
    category: 'System & Services',
    tags: ['spooler', 'print', 'memory-leak', 'windows-server', 'cpu-high'],
    author: 'Sarah Connor (Principal Enterprise Architect)',
    lastUpdated: '2026-08-15',
    content: `### Symptom
Host CPU spikes to 95-100% and spoolsv.exe consumes increasing RAM until system responsiveness degrades.

### Root Cause
Third-party v4 printer driver (HP Universal Print Driver v7.1) causes a deadlock when concurrent print jobs contain malformed PDF headers.

### Resolution Steps
1. Stop the Spooler service (\`Stop-Service Spooler\`).
2. Delete files in \`C:\\Windows\\System32\\spool\\PRINTERS\\\`.
3. Update HP Driver to v7.2.1 or isolate driver in Sandbox Mode using Print Management Console.
4. Restart Spooler service.`,
  },
  {
    id: 'kb-102',
    articleCode: 'KB-90412',
    title: 'Troubleshooting Intermittent DNS Resolution Timeouts on Domain Controllers',
    category: 'Networking',
    tags: ['dns', 'active-directory', 'active-directory', 'timeout', 'kerberos'],
    author: 'David Chen (Lead Network Ops)',
    lastUpdated: '2026-07-28',
    content: `### Symptom
Workstations fail to authenticate to domain services with error \`SEC_E_OK / KDC unreachable\`.

### Root Cause
UDP DNS packet fragmentation over MTU 1500 caused by enlarged Kerberos PAC tokens.

### Resolution Steps
1. Execute \`Clear-DnsClientCache\` on impacted client endpoints.
2. Force TCP fallback for DNS queries via Registry key: \`HKLM\\SYSTEM\\CurrentControlSet\\Services\\Kdc\\MaxPacketSize = 1\`.
3. Flush DC DNS forwarding cache.`,
  },
  {
    id: 'kb-103',
    articleCode: 'KB-77109',
    title: 'Emergency Disk Cleanup Strategy for SQL Server Transaction Logs',
    category: 'Database Infrastructure',
    tags: ['sql-server', 'disk-full', 'database', 'transaction-log'],
    author: 'Elena Rostova (Database Administrator)',
    lastUpdated: '2026-08-01',
    content: `### Symptom
SQL Server Database engine drops into Read-Only emergency state due to 0 bytes remaining on \`E:\\SQLData\\\`.

### Resolution Steps
1. Backup log with \`NO_TRUNCATE\` if possible.
2. Alter DB recovery model temporarily to SIMPLE.
3. Shrink log file using DBCC SHRINKFILE.
4. Restore FULL recovery model and resume transaction log backups.`,
  },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    ticketNumber: 'TK-1001',
    title: 'Printer in Room 204 keeps jamming',
    description: 'The main HP printer on the second floor stops printing after a few pages and displays paper jam error.',
    severity: 'MEDIUM',
    status: 'DIAGNOSING',
    category: 'Hardware & Printers',
    affectedService: 'Office Printers',
    reporter: 'Sarah Connor',
    assignedTechnician: 'Alex Thorne',
    createdAt: '2026-08-26T09:30:00Z',
    updatedAt: '2026-08-26T10:05:00Z',
    slaDueDate: '2026-08-26T11:30:00Z',
    deviceTelemetry: {
      deviceId: 'DEV-WIN-9821',
      hostname: 'WORKSTATION-PC01',
      os: 'Windows 11 Enterprise',
      ipAddress: '192.168.1.105',
      lastHeartbeat: '10 seconds ago',
      agentVersion: 'v4.8.2',
      uptime: '14 days, 6 hours',
      metrics: [
        { timestamp: '10:00', cpuUsagePct: 22, ramUsagePct: 40, diskUsagePct: 35, networkLatencyMs: 12, activeThreads: 120 },
        { timestamp: '10:01', cpuUsagePct: 28, ramUsagePct: 45, diskUsagePct: 35, networkLatencyMs: 14, activeThreads: 150 },
        { timestamp: '10:02', cpuUsagePct: 31, ramUsagePct: 48, diskUsagePct: 36, networkLatencyMs: 18, activeThreads: 180 },
        { timestamp: '10:03', cpuUsagePct: 37, ramUsagePct: 52, diskUsagePct: 36, networkLatencyMs: 22, activeThreads: 190 },
      ],
      logs: [
        { id: 'log-1', timestamp: '10:02:14', level: 'WARN', source: 'PrintSpooler', eventId: 372, message: 'Print job failed: Paper Tray 2 sensor reported alignment jam.' },
      ],
    },
    diagnosticResults: [
      {
        ruleId: 'rule-101',
        ruleCode: 'RULE-PRT-101',
        ruleName: 'Printer Tray Status Check',
        status: 'WARN',
        evidence: 'Paper Tray 2 roller sensor detected physical paper obstruction.',
        evaluatedAt: '2026-08-26T10:03:30Z',
        recommendation: 'Clear paper tray rollers and reset spooler service.',
      },
    ],
    aiAnalysis: {
      incidentId: 'inc-001',
      analyzedAt: '2026-08-26T10:04:00Z',
      summary: 'Paper jam error caused by misaligned feed rollers in Printer Tray 2.',
      copilotNotes: 'Simple fix: Clear tray 2 jam and restart the printer.',
      primaryHypothesis: {
        id: 'hyp-1',
        title: 'Printer Feed Roller Jam',
        confidenceScore: 95,
        rootCauseCategory: 'Hardware Roller Misalignment',
        reasoningChain: [
          'Paper sensor reported jam in Tray 2.',
          'Cleaning rollers resolves 95% of paper feed jams.',
        ],
        evidenceFound: [
          'Paper Tray 2 roller sensor warning',
        ],
        recommendedFix: 'Open Tray 2, inspect for small paper pieces, clean the pickup roller, and try printing again.',
      },
      alternativeHypotheses: []
    },
    similarIncidents: [
      {
        id: 'sim-1',
        ticketNumber: 'TK-0982',
        title: 'Printer Tray Jam on 2nd Floor',
        similarityScore: 92,
        resolvedAt: '2025-11-12',
        resolutionSummary: 'Cleaned feed rollers and cleared paper path.',
        technician: 'Alex Thorne',
      }
    ],
    recommendedPlaybooks: [],
    executionHistory: [],
    comments: [
      {
        id: 'cmt-1',
        incidentId: 'inc-001',
        authorId: 'user-emp-01',
        authorName: 'Sarah Connor',
        authorRole: 'EMPLOYEE',
        authorAvatar: 'SC',
        timestamp: '2026-08-26T09:40:00Z',
        content: 'Hi support team, I need to print the monthly sales report. Is someone able to take a look?',
      },
      {
        id: 'cmt-2',
        incidentId: 'inc-001',
        authorId: 'user-tech-01',
        authorName: 'Alex Thorne',
        authorRole: 'TECHNICIAN',
        authorAvatar: 'AT',
        timestamp: '2026-08-26T10:05:00Z',
        content: 'Hi Sarah, I am on my way to Room 204 to clear the paper feed roller jam.',
      }
    ],
    attachments: [],
    auditTrail: [],
  },
  {
    id: 'inc-002',
    ticketNumber: 'INC-2026-8790',
    title: 'Active Directory Kerberos Ticket Timeout on DC-EAST-02',
    description: 'Multiple users in Region East reporting prompt for credentials when opening SharePoint internal portal.',
    severity: 'HIGH',
    status: 'NEW',
    category: 'Identity & Authentication',
    affectedService: 'Active Directory / Single Sign-On',
    reporter: 'System Monitor (Auto-ingest)',
    assignedTechnician: 'Unassigned',
    createdAt: '2026-08-26T08:15:00Z',
    updatedAt: '2026-08-26T08:15:00Z',
    slaDueDate: '2026-08-26T12:15:00Z',
    deviceTelemetry: {
      deviceId: 'DEV-DC-02',
      hostname: 'DC-EAST-02.corp.internal',
      os: 'Windows Server 2022 DataCenter',
      ipAddress: '10.100.4.12',
      lastHeartbeat: '2 seconds ago',
      agentVersion: 'v4.8.2-enterprise',
      uptime: '92 days, 11 hours',
      metrics: [
        { timestamp: '08:10', cpuUsagePct: 35, ramUsagePct: 45, diskUsagePct: 40, networkLatencyMs: 140, activeThreads: 310 },
        { timestamp: '08:11', cpuUsagePct: 40, ramUsagePct: 46, diskUsagePct: 40, networkLatencyMs: 380, activeThreads: 340 },
        { timestamp: '08:12', cpuUsagePct: 42, ramUsagePct: 48, diskUsagePct: 40, networkLatencyMs: 890, activeThreads: 420 },
        { timestamp: '08:13', cpuUsagePct: 45, ramUsagePct: 50, diskUsagePct: 40, networkLatencyMs: 1450, activeThreads: 560 },
        { timestamp: '08:14', cpuUsagePct: 48, ramUsagePct: 52, diskUsagePct: 40, networkLatencyMs: 1820, activeThreads: 610 },
      ],
      logs: [
        { id: 'log-201', timestamp: '08:13:22', level: 'WARN', source: 'KDC', eventId: 16, message: 'The KDC encountered an unknown error while processing a Kerberos ticket request for client user@corp.internal.' },
        { id: 'log-202', timestamp: '08:14:05', level: 'ERROR', source: 'DNS-Server', eventId: 4015, message: 'The DNS server has encountered a critical error from the Active Directory. Check AD integrity.' },
      ],
    },
    diagnosticResults: [
      {
        ruleId: 'rule-103',
        ruleCode: 'RULE-NET-201',
        ruleName: 'DNS Resolution Failure / Timeout',
        status: 'FAIL',
        evidence: 'DNS latency measured at 1820ms (> 1500ms threshold). 4 failed queries.',
        evaluatedAt: '2026-08-26T08:14:30Z',
        recommendation: 'Flush local DNS cache and verify DC port 53 listener.',
      },
    ],
    similarIncidents: [
      {
        id: 'sim-201',
        ticketNumber: 'INC-2026-6120',
        title: 'Intermittent Auth Failure post Security Patching',
        similarityScore: 89,
        resolvedAt: '2026-05-19',
        resolutionSummary: 'Flushed DNS cache on domain controllers and restarted KDC service.',
        appliedPlaybook: 'ACT-NET-FLUSH-DNS',
        technician: 'David Chen',
      }
    ],
    recommendedPlaybooks: [
      PLAYBOOK_LIBRARY[1], // Flush DNS
    ],
    executionHistory: [],
    comments: [
      {
        id: 'cmt-1',
        incidentId: 'inc-001',
        authorId: 'user-emp-01',
        authorName: 'Sarah Connor',
        authorRole: 'EMPLOYEE',
        authorAvatar: 'SC',
        timestamp: '2026-08-26T09:40:00Z',
        content: 'Hi IT Team, the print spooler issue is blocking our Q3 sales presentation delivery. Can we get an ETA?',
      },
      {
        id: 'cmt-2',
        incidentId: 'inc-001',
        authorId: 'user-tech-01',
        authorName: 'Alex Thorne',
        authorRole: 'TECHNICIAN',
        authorAvatar: 'AT',
        timestamp: '2026-08-26T10:05:00Z',
        content: 'Hi Sarah, AI Copilot identified a driver deadlock in spoolsv.exe. I am authorizing a spooler queue flush now.',
      }
    ],
    attachments: [
      {
        id: 'att-1',
        filename: 'Q3_Financials_Draft.pdf',
        filesize: '14.2 MB',
        filetype: 'application/pdf',
        uploadedBy: 'Sarah Connor',
        uploadedAt: '2026-08-26T09:30:00Z',
        url: '#'
      }
    ],
    auditTrail: [
      {
        id: 'aud-201',
        timestamp: '2026-08-26T08:15:00Z',
        actor: 'Monitoring Agent',
        actorType: 'SYSTEM',
        actionType: 'TELEMETRY_ALERT',
        details: 'Incident created from high DNS latency trigger on DC-EAST-02.',
      }
    ],
  },
  {
    id: 'inc-003',
    ticketNumber: 'INC-2026-8651',
    title: 'SQL Cluster Data Drive Disk Saturation (< 3% free)',
    description: 'Automated monitoring warning: Partition E:\\Data on SQL-PROD-CL01 is at 97.4% disk capacity. Potential service failure within 2 hours.',
    severity: 'MEDIUM',
    status: 'AWAITING_APPROVAL',
    category: 'Database Infrastructure',
    affectedService: 'Production ERP & Finance Database Cluster',
    reporter: 'Storage Sentinel Bot',
    assignedTechnician: 'Elena Rostova',
    createdAt: '2026-08-26T07:00:00Z',
    updatedAt: '2026-08-26T09:10:00Z',
    slaDueDate: '2026-08-26T15:00:00Z',
    deviceTelemetry: {
      deviceId: 'DEV-SQL-01',
      hostname: 'SQL-PROD-CL01.corp.internal',
      os: 'Windows Server 2022 Enterprise SQL Edition',
      ipAddress: '10.200.8.44',
      lastHeartbeat: '1 second ago',
      agentVersion: 'v4.8.2-enterprise',
      uptime: '180 days',
      metrics: [
        { timestamp: '09:00', cpuUsagePct: 45, ramUsagePct: 88, diskUsagePct: 96.2, networkLatencyMs: 8, activeThreads: 750 },
        { timestamp: '09:05', cpuUsagePct: 48, ramUsagePct: 89, diskUsagePct: 97.1, networkLatencyMs: 9, activeThreads: 780 },
        { timestamp: '09:10', cpuUsagePct: 52, ramUsagePct: 90, diskUsagePct: 97.4, networkLatencyMs: 8, activeThreads: 810 },
      ],
      logs: [
        { id: 'log-301', timestamp: '09:08:12', level: 'WARN', source: 'MSSQLSERVER', eventId: 1827, message: 'CREATE DATABASE or ALTER DATABASE failed because the disk partition E:\\SQLData is full.' },
      ],
    },
    diagnosticResults: [
      {
        ruleId: 'rule-105',
        ruleCode: 'RULE-DB-401',
        ruleName: 'Database Storage Critical Threshold',
        status: 'FAIL',
        evidence: 'Partition E:\\ free space is 2.6% (Threshold < 5%).',
        evaluatedAt: '2026-08-26T09:09:00Z',
        recommendation: 'Execute automated log truncation and temp file reclamation playbook.',
      }
    ],
    aiAnalysis: {
      incidentId: 'inc-003',
      analyzedAt: '2026-08-26T09:09:30Z',
      summary: 'Unbacked transaction log growth in SQL Server database AppAuditDB has consumed 480 GB of partition E:\\. Playbook ACT-SYS-EXPAND-DISK recommended.',
      copilotNotes: 'Requires Tier-2 DBA approval prior to executing log shrink command to prevent breaking transaction chain backup history.',
      primaryHypothesis: {
        id: 'hyp-301',
        title: 'Transaction Log Accumulation on FULL Recovery Model DB',
        confidenceScore: 98,
        rootCauseCategory: 'Storage Saturation',
        reasoningChain: [
          'Event ID 1827 explicitly indicates drive E:\\ is out of space.',
          'Telemetry confirms linear disk growth over past 48 hours.',
          'AppAuditDB transaction log file size is 482 GB.',
        ],
        evidenceFound: ['Event ID 1827', 'Disk metric 97.4% full'],
        recommendedFix: 'Approve and execute ACT-SYS-EXPAND-DISK script to purge old temp IIS logs and shrink transaction log file.',
      },
      alternativeHypotheses: []
    },
    similarIncidents: [
      {
        id: 'sim-301',
        ticketNumber: 'INC-2026-2219',
        title: 'ERP Database Log Drive Full',
        similarityScore: 95,
        resolvedAt: '2026-03-14',
        resolutionSummary: 'Truncate temp logs and executed DBCC SHRINKFILE.',
        appliedPlaybook: 'ACT-SYS-EXPAND-DISK',
        technician: 'Elena Rostova',
      }
    ],
    recommendedPlaybooks: [
      PLAYBOOK_LIBRARY[2], // Truncate logs
    ],
    executionHistory: [],
    comments: [
      {
        id: 'cmt-1',
        incidentId: 'inc-001',
        authorId: 'user-emp-01',
        authorName: 'Sarah Connor',
        authorRole: 'EMPLOYEE',
        authorAvatar: 'SC',
        timestamp: '2026-08-26T09:40:00Z',
        content: 'Hi IT Team, the print spooler issue is blocking our Q3 sales presentation delivery. Can we get an ETA?',
      },
      {
        id: 'cmt-2',
        incidentId: 'inc-001',
        authorId: 'user-tech-01',
        authorName: 'Alex Thorne',
        authorRole: 'TECHNICIAN',
        authorAvatar: 'AT',
        timestamp: '2026-08-26T10:05:00Z',
        content: 'Hi Sarah, AI Copilot identified a driver deadlock in spoolsv.exe. I am authorizing a spooler queue flush now.',
      }
    ],
    attachments: [
      {
        id: 'att-1',
        filename: 'Q3_Financials_Draft.pdf',
        filesize: '14.2 MB',
        filetype: 'application/pdf',
        uploadedBy: 'Sarah Connor',
        uploadedAt: '2026-08-26T09:30:00Z',
        url: '#'
      }
    ],
    auditTrail: [
      {
        id: 'aud-301',
        timestamp: '2026-08-26T07:00:00Z',
        actor: 'Storage Sentinel Bot',
        actorType: 'SYSTEM',
        actionType: 'TELEMETRY_ALERT',
        details: 'Threshold alert: E:\\ drive space dropped below 5%.',
      },
      {
        id: 'aud-302',
        timestamp: '2026-08-26T09:09:30Z',
        actor: 'AI Incident Copilot',
        actorType: 'AI',
        actionType: 'AI_INFERENCE',
        details: 'AI diagnosis created. Playbook execution queued for approval.',
      }
    ],
  }
];
