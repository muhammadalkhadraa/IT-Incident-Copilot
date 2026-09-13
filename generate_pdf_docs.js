import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const doc = new PDFDocument({
  margin: 40,
  size: 'A4',
  bufferPages: true
});

const outputPath = path.join(process.cwd(), 'IT_Incident_Copilot_Documentation.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Color Palette
const COLORS = {
  primary: '#0e7490',     // Cyan 700
  secondary: '#0284c7',   // Sky 600
  dark: '#0f172a',        // Slate 900
  gray: '#334155',        // Slate 700
  lightGray: '#f8fafc',   // Slate 50
  accent: '#7c3aed',      // Violet 600
  border: '#cbd5e1'       // Slate 300
};

// Helper function to draw header bar on pages
function drawHeader(title) {
  doc.rect(40, 25, 515, 30).fill(COLORS.primary);
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold').text(title, 50, 34);
}

// Helper function to draw footer
function drawFooter() {
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.font('Helvetica').fontSize(8).fillColor('#94a3b8');
    doc.text(
      `IT Incident Copilot - Official Enterprise System Documentation | Page ${i + 1} of ${pageCount}`,
      40,
      780,
      { align: 'center', width: 515 }
    );
  }
}

// --- COVER PAGE ---
doc.rect(0, 0, 595, 842).fill('#0b0f17');

doc.fillColor('#06b6d4').fontSize(28).font('Helvetica-Bold').text('IT INCIDENT COPILOT', 50, 220, { align: 'center' });
doc.fillColor('#38bdf8').fontSize(16).font('Helvetica').text('Comprehensive Enterprise System & Feature Documentation', 50, 260, { align: 'center' });

doc.moveTo(150, 290).lineTo(445, 290).strokeColor('#0891b2').lineWidth(2).stroke();

doc.fillColor('#94a3b8').fontSize(11).font('Helvetica').text('Complete Guide to Features, Architecture, Database Persistence & Security', 50, 310, { align: 'center' });

// Box info
doc.rect(100, 420, 395, 180).fillColor('#1e293b').fillAndStroke('#1e293b', '#0891b2');
doc.fillColor('#f8fafc').fontSize(12).font('Helvetica-Bold').text('SYSTEM SPECIFICATIONS SUMMARY', 120, 440);

doc.font('Helvetica').fontSize(10).fillColor('#cbd5e1');
doc.text('• Frontend Stack: Vite, React 19, TailwindCSS, Lucide Icons', 130, 470);
doc.text('• Backend Stack: ASP.NET Core 9/10 C#, EF Core, BCrypt, JWT', 130, 490);
doc.text('• Primary Database: PostgreSQL (Port 5432 / DBeaver Sync)', 130, 510);
doc.text('• Fallback Engine: SQLite (it_copilot.db) & Global Cloud KV Bin', 130, 530);
doc.text('• Deployment Targets: Vercel Cloud & Local Host (Port 5000 / 5173)', 130, 550);

doc.fillColor('#64748b').fontSize(10).text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`, 50, 720, { align: 'center' });

doc.addPage();

// --- SECTION 1: EXECUTIVE OVERVIEW ---
drawHeader('1. EXECUTIVE SUMMARY & SYSTEM OVERVIEW');

let y = 70;
doc.fillColor(COLORS.dark).fontSize(14).font('Helvetica-Bold').text('1.1 Purpose & Core Mission', 40, y);
y += 22;
doc.fillColor(COLORS.gray).fontSize(10).font('Helvetica').text(
  'The IT Incident Copilot is an enterprise-grade ticketing and diagnostic automation platform designed to make support management simple, fast, and accessible for everyone. It bridges non-technical staff with Tier-2 systems engineers through intelligent automation, real-time PC telemetry diagnostics, and simple English communication.',
  40, y, { width: 515, align: 'justify' }
);
y += 55;

doc.fillColor(COLORS.dark).fontSize(14).font('Helvetica-Bold').text('1.2 Key Architectural Pillars', 40, y);
y += 22;

const pillars = [
  { title: 'Pure & Simple Ticketing UI', desc: 'Streamlined ticket lifecycle management written in plain, accessible English with full multi-language translation support.' },
  { title: 'Automated Device Telemetry', desc: 'Extracts real-time PC performance metrics (CPU, RAM, Disk, Network Latency, Event Logs) to pinpoint root causes automatically.' },
  { title: 'Multi-Engine Persistence', desc: 'Connects to PostgreSQL for DBeaver live inspection, SQLite for zero-config local runs, and Global Cloud KV Store for Vercel deployments.' },
  { title: 'Enterprise Security & RBAC', desc: 'BCrypt password hashing, JWT authorization, email duplicate enforcement, and auto-fill credential protection.' }
];

pillars.forEach((p, idx) => {
  doc.rect(40, y, 515, 45).fillColor(COLORS.lightGray).fillAndStroke(COLORS.lightGray, COLORS.border);
  doc.fillColor(COLORS.primary).fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. ${p.title}`, 50, y + 8);
  doc.fillColor(COLORS.gray).fontSize(9.5).font('Helvetica').text(p.desc, 50, y + 24, { width: 495 });
  y += 52;
});

y += 15;

// --- SECTION 2: SYSTEM ARCHITECTURE ---
doc.fillColor(COLORS.dark).fontSize(14).font('Helvetica-Bold').text('2. SYSTEM ARCHITECTURE & DATABASE SYNC', 40, y);
y += 22;

doc.fillColor(COLORS.gray).fontSize(10).font('Helvetica').text(
  'The system implements a triple-redundant data persistence architecture ensuring reliability across local development, SQL tools (DBeaver), and Vercel cloud deployments:',
  40, y, { width: 515 }
);
y += 35;

doc.rect(40, y, 515, 120).fillColor('#0f172a').fill();
doc.fillColor('#38bdf8').fontSize(11).font('Helvetica-Bold').text('PERSISTENCE TIER ARCHITECTURE', 55, y + 12);
doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica');
doc.text('1. Primary Database (PostgreSQL - Port 5432):', 55, y + 32);
doc.fillColor('#cbd5e1').text('   - Configured in backend/appsettings.json (Host=localhost;Database=it_copilot).', 55, y + 44);
doc.text('   - Directly synced with DBeaver SQL IDE for live table inspection & auditing.', 55, y + 56);
doc.fillColor('#ffffff').text('2. Local Zero-Config Fallback (SQLite - it_copilot.db):', 55, y + 72);
doc.fillColor('#cbd5e1').text('   - Automatic fallback if PostgreSQL server is offline during local development.', 55, y + 84);
doc.fillColor('#ffffff').text('3. Global Cloud Bin Sync (Vercel Cloud Deployment):', 55, y + 100);
doc.fillColor('#cbd5e1').text('   - Syncs registered accounts across ALL devices globally when deployed on Vercel.', 55, y + 112);

doc.addPage();

// --- SECTION 3: CORE FEATURES & MODULES ---
drawHeader('3. CORE FEATURES & MODULE SPECIFICATIONS');

y = 70;

const features = [
  {
    name: '3.1 User Authentication & Role Control (RBAC)',
    details: [
      'BCrypt Password Hashing & JWT Token Issuance.',
      'Strict Email Uniqueness Check: Prevents creating duplicate accounts with the same email address both on backend API and frontend storage.',
      'Auto-Fill & URL Protection: Credentials are never pre-filled by browser autofill and are strictly sent via POST body payload—never in website URLs.',
      'Persona Switching: Toggle between Administrator (Lead System Admin), Technician (Senior Systems Engineer), and Employee (Staff Member).'
    ]
  },
  {
    name: '3.2 Simplified Employee Support Portal',
    details: [
      'Self-Service Ticket Submission: Staff can report IT issues using plain, simple English.',
      'Automated PC Telemetry Attachment: Extracts computer hostname, IP address, and MAC address automatically.',
      'Attachment Support: Attach screenshot logs or error dumps directly to support tickets.',
      'My Support Tickets: Employees view and track only their own reported incidents.'
    ]
  },
  {
    name: '3.3 Technician Incident Workstation & AI Copilot',
    details: [
      'Real-Time Telemetry Diagnostic Engine: Monitors CPU, Memory Heap, Disk Utilization, Network Latency, and Event Logs.',
      'Deterministic Rule Engine: Evaluates 5 diagnostic rules against live telemetry metrics.',
      'Automated Playbook Recommendations: Suggests automated remediation procedures for rapid resolution.',
      'State Machine Audit Trail: Records every status transition (NEW -> INVESTIGATING -> RESOLVED -> CLOSED) with actor tracking.'
    ]
  },
  {
    name: '3.4 Manager Analytics & Metrics Dashboard',
    details: [
      'Resolution SLA Metrics: Tracks ticket resolution speed and SLA compliance in real time.',
      'Category Distribution Breakdown: Visualizes incidents by category (EndUser, Infrastructure, Identity, Database).',
      'User Control Center: Admins can elevate user roles (Employee -> Technician -> Administrator).'
    ]
  }
];

features.forEach(f => {
  doc.fillColor(COLORS.dark).fontSize(13).font('Helvetica-Bold').text(f.name, 40, y);
  y += 18;
  f.details.forEach(detail => {
    doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold').text('•', 50, y);
    doc.fillColor(COLORS.gray).fontSize(9.5).font('Helvetica').text(detail, 62, y, { width: 490 });
    y += 20;
  });
  y += 10;
});

// --- SECTION 4: API REFERENCE ---
doc.fillColor(COLORS.dark).fontSize(13).font('Helvetica-Bold').text('4. BACKEND API ENDPOINT REFERENCE', 40, y);
y += 20;

const endpoints = [
  { method: 'POST', path: '/api/auth/register', desc: 'Registers new user account with BCrypt hash & email uniqueness check.' },
  { method: 'POST', path: '/api/auth/login', desc: 'Authenticates credentials and returns JWT access & refresh tokens.' },
  { method: 'GET ', path: '/api/auth/users', desc: 'Lists all system accounts for Admin Control Center.' },
  { method: 'PUT ', path: '/api/auth/users/{id}/role', desc: 'Updates user role (EMPLOYEE, TECHNICIAN, ADMINISTRATOR).' },
  { method: 'POST', path: '/api/auth/reset-password', desc: 'Resets account password with validation.' },
  { method: 'GET ', path: '/api/incidents', desc: 'Fetches enterprise support tickets.' },
  { method: 'POST', path: '/api/incidents', desc: 'Creates new ticket with telemetry data.' },
  { method: 'PUT ', path: '/api/incidents/{id}/status', desc: 'Modifies incident lifecycle state with audit logging.' }
];

endpoints.forEach(ep => {
  doc.rect(40, y, 515, 22).fillColor('#f1f5f9').fillAndStroke('#f1f5f9', '#cbd5e1');
  const mColor = ep.method.trim() === 'POST' ? '#0284c7' : ep.method.trim() === 'PUT' ? '#7c3aed' : '#059669';
  doc.fillColor(mColor).fontSize(9).font('Helvetica-Bold').text(ep.method, 48, y + 6);
  doc.fillColor(COLORS.dark).fontSize(9).font('Helvetica-Bold').text(ep.path, 95, y + 6);
  doc.fillColor(COLORS.gray).fontSize(8.5).font('Helvetica').text(ep.desc, 260, y + 6, { width: 285 });
  y += 26;
});

doc.addPage();

// --- SECTION 5: DBEAVER & SETUP GUIDE ---
drawHeader('5. SETUP, DBEAVER SYNC & DEPLOYMENT GUIDE');

y = 70;

doc.fillColor(COLORS.dark).fontSize(13).font('Helvetica-Bold').text('5.1 Running Locally & DBeaver Database Connection', 40, y);
y += 20;

doc.fillColor(COLORS.gray).fontSize(10).font('Helvetica').text(
  'To inspect live database records using DBeaver or run the project locally:',
  40, y, { width: 515 }
);
y += 20;

const steps = [
  { step: '1', title: 'Start PostgreSQL Server', detail: 'Ensure PostgreSQL is running locally on port 5432.' },
  { step: '2', title: 'Configure appsettings.json', detail: 'backend/appsettings.json sets "DefaultConnection": "Host=localhost;Database=it_copilot;Username=postgres".' },
  { step: '3', title: 'Run C# Backend API', detail: 'Execute "dotnet run" inside backend/ folder. The API initializes tables and seeds default users.' },
  { step: '4', title: 'Start Frontend Web App', detail: 'Execute "npm run dev" in root workspace to launch Vite dev server at http://localhost:5173/.' },
  { step: '5', title: 'Connect DBeaver', detail: 'Open DBeaver -> Connect PostgreSQL -> Host: localhost, Database: it_copilot. Open "Users" table and press F5 to refresh.' }
];

steps.forEach(s => {
  doc.rect(40, y, 22, 22).fillColor(COLORS.primary).fill();
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text(s.step, 47, y + 5);
  doc.fillColor(COLORS.dark).fontSize(10).font('Helvetica-Bold').text(s.title, 72, y + 2);
  doc.fillColor(COLORS.gray).fontSize(9).font('Helvetica').text(s.detail, 72, y + 15, { width: 470 });
  y += 36;
});

y += 15;

doc.fillColor(COLORS.dark).fontSize(13).font('Helvetica-Bold').text('5.2 Deploying to Vercel Cloud', 40, y);
y += 20;

doc.fillColor(COLORS.gray).fontSize(10).font('Helvetica').text(
  'The repository is connected to Vercel. Pushing to origin/main automatically triggers production deployments. The built-in Global Cloud KV Store ensures all users created on Vercel persist globally across all devices.',
  40, y, { width: 515, align: 'justify' }
);

drawFooter();

doc.end();

stream.on('finish', () => {
  console.log('PDF generation complete: IT_Incident_Copilot_Documentation.pdf');
});
