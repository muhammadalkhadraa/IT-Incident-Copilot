# 🔌 IT Incident Copilot — RESTful API & Webhook Specifications

## Base URL
- **Production API**: `https://api.copilot.corp.internal/v1`
- **Local Dev API**: `https://localhost:7091/api`

---

## 1. Authentication Endpoints

### POST `/api/auth/login`
Authenticates user and returns JWT bearer token + refresh token.

**Request Body**:
```json
{
  "email": "alex.thorne@corp.internal",
  "password": "Password123!"
}
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "rf_98a72b1c6e4d...",
  "user": {
    "id": "u-102",
    "name": "Alex Thorne",
    "email": "alex.thorne@corp.internal",
    "role": "TECHNICIAN"
  }
}
```

---

## 2. Incident Management Endpoints

### GET `/api/incidents`
Retrieves master list of incident tickets with filtering, sorting, and pagination.

**Query Parameters**:
- `status`: `OPEN`, `TRIAGED`, `INVESTIGATING`, `DIAGNOSED`, `RESOLVED`, `CLOSED`
- `severity`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- `assignedTo`: Technician User ID
- `search`: Search query string
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)

### POST `/api/incidents`
Submits a new IT incident ticket.

**Request Body**:
```json
{
  "title": "Executive Print Queue Crash",
  "description": "HOST-EXEC-PRT04 spoolsv.exe memory leak consuming 98% CPU.",
  "category": "Infrastructure / EndUser Services",
  "deviceId": "DEV-WIN-9821",
  "businessImpact": 4,
  "affectedUsersCount": 150,
  "serviceCriticality": 4
}
```

---

## 3. Real Telemetry Ingestion Endpoint

### POST `/api/telemetry/ingest`
Ingests safe telemetry metrics from C# Windows Device Agent.

**Headers**:
- `X-Agent-Key`: `X-Agent-Key-Corp-Secure-2026`
- `Content-Type`: `application/json`

**Request Payload**:
```json
{
  "hostname": "HOST-EXEC-PRT04.corp.internal",
  "ipAddress": "10.140.12.88",
  "defaultGateway": "10.140.0.1",
  "cpuUsagePct": 98.4,
  "ramUsagePct": 97.2,
  "diskUsagePct": 67.0,
  "networkLatencyMs": 24,
  "monitoredServices": [
    { "serviceName": "spoolsv", "status": "RUNNING", "memoryBytes": 2840000000 }
  ]
}
```

---

## 4. n8n Webhook Integration

Automated event triggers dispatch HMAC SHA-256 signed JSON payloads to n8n endpoints (`http://localhost:5678/webhook/*`).

**Headers**:
- `X-Webhook-Event`: `CRITICAL_P1_ALERT` | `TICKET_RESOLVED_NOTIFY_USER`
- `X-Webhook-Signature`: `sha256=8f9a2e1d7c3b4a5f6e8d0c2b4a6f8e0d...`

**Payload**:
```json
{
  "event": "CRITICAL_P1_ALERT",
  "ticket": "INC-2026-8812",
  "severity": "CRITICAL",
  "reporter": "Marcus Vance",
  "timestamp": "2026-08-26T11:18:00Z"
}
```
