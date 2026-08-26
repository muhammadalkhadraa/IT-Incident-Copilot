# 🔒 IT Incident Copilot — Security Policy & Compliance Architecture

## 1. Human-In-The-Loop (HITL) Security Policy

To prevent rogue or hallucinated AI executions in production enterprise environments, the platform enforces strict **Human-In-The-Loop (HITL)** guardrails.

### Forbidden Autonomous Actions:
AI models are **STRICTLY BLOCKED** from autonomously executing:
- `ACT-SEC-DEL-ACCT` (Account Deletion)
- `ACT-NET-DISABLE-FW` (Firewall Disabling)
- `ACT-NET-CONFIG-PROD` (Production Network BGP / VLAN Re-configuration)
- `ACT-SEC-RESET-PRIV` (Resetting Privileged Admin Credentials)

### Mandatory 5-Step Execution Pipeline:
```
1. AI Recommendation ──► 2. Technician Approval ──► 3. Automation ──► 4. Execution ──► 5. Audit Log
```

Every playbook execution requires an authenticated technician identity name and security PIN.

---

## 2. Authentication & Role-Based Access Control (RBAC)

- **JWT Tokens**: Signed with HMAC-SHA256 secret keys (`X-Agent-Key` and `Bearer JWT`).
- **4 Persona Roles**:
  - `EMPLOYEE`: Self-Service ticket creation & public knowledge base access.
  - `TECHNICIAN`: Workstation diagnostic access & playbook authorization.
  - `IT_MANAGER`: Assignment matrix, SLA escalation policies, & manager hub.
  - `ADMINISTRATOR`: Live RBAC role modifier, SSO Entra ID config, & audit logs.

---

## 3. Webhook HMAC-SHA256 Signatures

Dispatches to n8n endpoints include secure signature headers:
```http
X-Webhook-Event: CRITICAL_P1_ALERT
X-Webhook-Signature: sha256=8f9a2e1d7c3b4a5f6e8d0c2b4a6f8e0d...
```

---

## 4. Audit Trail & Compliance Logging

All security events, status transitions, and playbook executions write immutable log entries to `AuditLogRecord` containing:
- `Timestamp` (UTC)
- `Actor` & `ActorType` (`TECHNICIAN`, `AI`, `SYSTEM`)
- `ActionType` (`STATUS_CHANGE`, `APPROVAL_REQUEST`, `ACTION_EXECUTED`)
- `Details` Rationale String
