# 🚀 IT Incident Copilot — Enterprise AI-Powered Service Desk & Remediation Engine

[![CI/CD Pipeline](https://github.com/muhammadalkhadraa/IT-Incident-Copilot/actions/workflows/ci.yml/badge.svg)](https://github.com/muhammadalkhadraa/IT-Incident-Copilot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![PostgreSQL pgvector](https://img.shields.io/badge/PostgreSQL-pgvector-blue.svg)](https://github.com/pgvector/pgvector)

**IT Incident Copilot** is a state-of-the-art enterprise SaaS application for IT Service Desks, Telemetry Diagnostics, and Automated Remediation. It combines **deterministic empirical diagnostics** with **Generative AI Root Cause Analysis (RCA)**, **RAG vector knowledge search**, and **n8n automation webhooks**.

---

## 🌟 Key Features

- 🔬 **Two-Stage Diagnostic Pipeline**: Separates empirical technical tests (ICMP, DNS, process RAM) from LLM reasoning.
- 🧮 **Multi-Factor Priority Engine**: Calculates ticket priority automatically using weighted vectors ($\text{Business Impact} + \text{Users Affected} + \text{Criticality} + \text{Severity}$).
- 🔒 **Human-In-The-Loop (HITL) Security**: Guardrails blocking autonomous AI execution of dangerous actions (account deletion, firewall disabling, credential resets).
- 📚 **RAG Knowledge Base & Citations**: Multi-format document ingestion (`PDF`, `TXT`, `DOCX`, `MD`) with 1536d `pgvector` embeddings and strict source citations (`Source: KB-88392 Page 12`).
- ⚡ **n8n Automation Engine**: WHEN-THEN automation rules emitting HMAC-SHA256 signed webhooks to n8n.
- 💻 **Real C# Windows Device Agent**: Collects safe system telemetry over TLS 1.3 HTTPS with offline queue buffering.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS (Vanilla Glassmorphism UI), Lucide Icons.
- **Backend API**: ASP.NET Core 9.0 Web API, Entity Framework Core 9, SignalR Hubs, JWT Auth.
- **Database**: PostgreSQL 16 + `pgvector` 1536-dimensional vector similarity store.
- **Agent**: C# .NET Worker Daemon Service.
- **Automation**: n8n Webhook Integration.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ & npm
- .NET 9.0 SDK
- Docker Desktop

### 1. Run via Docker Compose
```bash
docker-compose up -d --build
```

### 2. Run Local Development
```bash
# Frontend
npm install
npm run dev

# Backend API
cd backend
dotnet run
```

Access the frontend at `http://localhost:5173/` and Swagger API docs at `https://localhost:7091/swagger`.

---

## 👥 Demo Accounts & Role Switcher

| User Role | Persona Name | Primary Capabilities |
|---|---|---|
| **EMPLOYEE** | Marcus Vance | Self-Service Ticket Creation, Runbook Search |
| **TECHNICIAN** | Alex Thorne | Incident Workstation, Telemetry, Playbooks |
| **IT_MANAGER** | Sarah Connor | Analytics, Technician Assignment, SLA Metrics |
| **ADMINISTRATOR** | Elena Rostova | RBAC Role Modifier, RAG Settings, Audit Logs |

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
