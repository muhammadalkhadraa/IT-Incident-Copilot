# 💻 IT Incident Copilot — Developer Guide & Setup

## 1. Local Environment Requirements

- **Node.js**: v18.0.0 or higher
- **.NET SDK**: 9.0.100 or higher
- **Docker & Docker Compose**: v24.0+
- **PostgreSQL**: 16+ (with `pgvector` extension)

---

## 2. Setting Up the Local Workspace

### Step 1: Clone Repository
```bash
git clone https://github.com/muhammadalkhadraa/IT-Incident-Copilot.git
cd IT-Incident-Copilot
```

### Step 2: Install Frontend Dependencies & Start Dev Server
```bash
npm install
npm run dev
```

The React/Vite development server will start at `http://localhost:5173/`.

### Step 3: Run C# ASP.NET Core Backend API
```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

The ASP.NET Core Web API will start at `https://localhost:7091/` (Swagger UI at `/swagger`).

---

## 3. Containerized Setup via Docker Compose

Spin up PostgreSQL (pgvector), ASP.NET Core API, n8n, and React Web App with a single command:

```bash
docker-compose up -d --build
```

### Service Map:
- **Web SaaS Frontend**: `http://localhost:5173/`
- **ASP.NET Core Web API**: `https://localhost:7091/`
- **PostgreSQL Database**: `localhost:5432`
- **n8n Webhook Automation**: `http://localhost:5678/`

---

## 4. Running Automated Tests

### Run C# Backend XUnit Tests
```bash
cd backend
dotnet test
```

### Run Frontend TypeScript Tests
```bash
npm run test
```

---

## 5. Coding Standards & Lints

- **TypeScript / React**: Strict type annotations, zero unused variables (`tsc -b`), functional components.
- **C# / .NET**: Standard C# naming conventions, thin controllers, application services, central exception handling middleware.
