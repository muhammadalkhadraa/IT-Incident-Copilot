# 🏛️ IT Incident Copilot — System Architecture & Design

## 1. High-Level System Architecture

The application adopts a 5-layer enterprise architecture maintaining strict separation of concerns between deterministic rule evaluation and generative AI synthesis:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LAYER 1: FRONTEND                                │
│ React / Angular TypeScript • Glassmorphism Enterprise SaaS UI • SignalR Hub │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS REST / WSS
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LAYER 2: API CONTROLLERS                         │
│ IncidentsController • TelemetryController • AuthController • SignalR Hubs  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Service Invocations
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LAYER 3: APPLICATION / BUSINESS LOGIC                 │
│ IncidentService • PriorityCalculationEngine • IncidentStateMachine          │
│ IDiagnosticTest Framework • AiCopilotEngine • RagKnowledgeService           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Domain Entities & Mappings
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LAYER 4: DOMAIN ENTITIES                         │
│ 17 C# Domain Entities (User, Role, Device, Incident, DiagnosticRun, etc.)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ EF Core 9 Provider
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LAYER 5: INFRASTRUCTURE & DATABASE                    │
│ PostgreSQL 16 DB • pgvector Extension (1536d) • n8n Webhook Engine          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Two-Stage Diagnostic Pipeline (AI Separation Rule)

To maintain absolute reliability and explainability, technical empirical checks are decoupled from LLM inference:

```
                    ┌─────────────────────────┐
                    │    INCIDENT TRIGGERED   │
                    └────────────┬────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: DETERMINISTIC RULES ENGINE (IDiagnosticTest Plugins)           │
│ • ICMP Gateway Echo (10.140.0.1)                                        │
│ • Public Resolver Echo (1.1.1.1)                                        │
│ • DNS Resolution (dc01.corp.internal)                                   │
│ • Process Heap & Memory Footprint (spoolsv.exe)                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Structured Evidence Payload JSON
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: GENERATIVE AI REASONING & EVIDENCE SYNTHESIS                   │
│ • Correlates Stage 1 Structured Evidence                                │
│ • Generates RCA Root Cause Hypothesis & Confidence %                    │
│ • Recommends Remediation Playbook (Subject to HITL Authorization)       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Human-In-The-Loop (HITL) Security Architecture

Autonomous execution of dangerous actions is strictly forbidden by policy guardrails:

```
AI Recommendation ──► Technician Approval ──► Automation ──► Execution ──► Audit Log
```

Forbidden Autonomous Actions:
- `ACT-SEC-DEL-ACCT` (Delete Account)
- `ACT-NET-DISABLE-FW` (Disable Firewall)
- `ACT-NET-CONFIG-PROD` (Change Production Network Configuration)
- `ACT-SEC-RESET-PRIV` (Reset Privileged Credentials)

---

## 4. RAG Vector Knowledge Store Design

- **Embedding Model**: 1536-dimensional vector space mapped in PostgreSQL `pgvector`.
- **Chunking Strategy**: 500-character recursive chunks preserving sentence boundaries.
- **Retrieval Index**: HNSW index for sub-10ms similarity searches ($\cos \theta \ge 0.75$).
- **Source Citation**: Every answer renders `Source: Document Name (Page X)`.
