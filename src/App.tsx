import { useState } from 'react';
import type { Incident, UserProfile } from './types';
import { INITIAL_INCIDENTS } from './data/mockData';
import { MOCK_USERS as INITIAL_USERS } from './data/mockUsers';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IncidentList } from './components/IncidentList';
import { IncidentWorkstation } from './components/IncidentDetail/IncidentWorkstation';
import { KnowledgeBase } from './components/KnowledgeBase';
import { ManagerHub } from './components/ManagerHub';
import { AdminControlCenter } from './components/AdminControlCenter';
import { EmployeePortal } from './components/EmployeePortal';
import { AssetsView } from './components/AssetsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AutomationsView } from './components/AutomationsView';
import { DiagnosticEngine } from './services/diagnosticEngine';
import { AICopilotService } from './services/aiCopilotService';
import { AutomationWebhookEngine } from './services/automationWebhookEngine';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[1]); // Alex Thorne (Technician)
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);

  const [activeView, setActiveView] = useState<string>('incidents');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Switching Persona User
  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);

    // Contextual view routing per persona
    if (user.role === 'EMPLOYEE') setActiveView('incidents');
    else if (user.role === 'TECHNICIAN') setActiveView('incidents');
    else if (user.role === 'IT_MANAGER') setActiveView('analytics');
    else if (user.role === 'ADMINISTRATOR') setActiveView('users');
  };

  // Select active incident for workstation diagnosis
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  // Navigation Handler
  const handleNavigate = (view: string) => {
    setActiveView(view);
    setSelectedIncidentId(null);
  };

  // Re-run diagnostics action
  const handleReRunDiagnostics = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== incidentId) return inc;
      const diagResults = DiagnosticEngine.evaluateRules(inc);
      const aiAnalysis = AICopilotService.analyzeIncident(inc);
      return {
        ...inc,
        diagnosticResults: diagResults,
        aiAnalysis: aiAnalysis
      };
    }));
  };

  // Update incident status with State Machine audit logging & n8n webhook dispatch
  const handleUpdateStatus = (incidentId: string, newStatus: any, reopenReason?: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== incidentId) return inc;
      const oldStatus = inc.status;
      const details = oldStatus === 'CLOSED' && newStatus === 'NEW'
        ? `EXPLICIT REOPEN: Reopened ticket ${inc.ticketNumber}. Reason: ${reopenReason || 'User requested re-investigation'}`
        : `State transition: ${oldStatus} → ${newStatus}`;

      const updated = {
        ...inc,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        auditTrail: [
          ...inc.auditTrail,
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: currentUser.name,
            actorType: 'TECHNICIAN' as const,
            actionType: 'STATUS_CHANGE' as const,
            details: details
          }
        ]
      };

      // WHEN incident is resolved THEN send user notification n8n webhook
      if (newStatus === 'RESOLVED') {
        AutomationWebhookEngine.triggerEvent('TICKET_RESOLVED_NOTIFY_USER', updated);
      }

      return updated;
    }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      
      {/* Top Enterprise Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        incidents={incidents}
        onSearchChange={setSearchQuery}
        activeTab={activeView}
        onTabChange={(tab) => handleNavigate(tab)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentRole={currentUser.role}
          activeView={activeView}
          onNavigate={handleNavigate}
          incidentsCount={incidents.length}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          
          {/* Workstation Detail View (If an incident is selected) */}
          {selectedIncident ? (
            <IncidentWorkstation
              incident={selectedIncident}
              onBack={() => setSelectedIncidentId(null)}
              onUpdateStatus={handleUpdateStatus}
              onExecutePlaybook={async () => {}}
              onReRunDiagnostics={() => handleReRunDiagnostics(selectedIncident.id)}
            />
          ) : (
            <>
              {/* Employee Persona Portal View */}
              {currentUser.role === 'EMPLOYEE' && activeView === 'incidents' && (
                <EmployeePortal
                  user={currentUser}
                  incidents={incidents.filter(i => i.reporter.toLowerCase().includes(currentUser.name.toLowerCase()) || i.reporter === 'Sarah Connor')}
                  onReportIncident={(title, category, description, attachmentName) => {
                    const newIncId = `inc-${Date.now()}`;
                    const newInc: Incident = {
                      id: newIncId,
                      ticketNumber: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      title,
                      description,
                      severity: 'MEDIUM',
                      status: 'NEW',
                      category,
                      reporter: currentUser.name,
                      assignedTechnician: 'Unassigned',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      slaDueDate: new Date(Date.now() + 14400000).toISOString(),
                      affectedService: category,
                      deviceTelemetry: {
                        deviceId: `dev-${Date.now()}`,
                        hostname: 'workstation-user.corp.internal',
                        os: 'Windows 11 Enterprise',
                        ipAddress: '10.140.12.110',
                        lastHeartbeat: new Date().toISOString(),
                        agentVersion: 'v2.4.1',
                        uptime: '14 days',
                        metrics: [{ timestamp: new Date().toISOString(), cpuUsagePct: 15, ramUsagePct: 35, diskUsagePct: 40, networkLatencyMs: 12, activeThreads: 120 }],
                        logs: []
                      },
                      attachments: attachmentName ? [{
                        id: `att-${Date.now()}`,
                        filename: attachmentName,
                        filesize: '1.2 MB',
                        filetype: 'PNG',
                        uploadedBy: currentUser.name,
                        uploadedAt: new Date().toISOString(),
                        url: '#'
                      }] : [],
                      diagnosticResults: [],
                      recommendedPlaybooks: [],
                      executionHistory: [],
                      auditTrail: [],
                      comments: [],
                      similarIncidents: []
                    };
                    setIncidents([newInc, ...incidents]);
                  }}
                  onAddComment={(incidentId, text) => {
                    setIncidents(prev => prev.map(inc => {
                      if (inc.id !== incidentId) return inc;
                      return {
                        ...inc,
                        comments: [
                          ...inc.comments,
                          {
                            id: `cmt-${Date.now()}`,
                            incidentId: incidentId,
                            authorId: currentUser.id,
                            authorName: currentUser.name,
                            authorRole: currentUser.role,
                            authorAvatar: currentUser.avatar,
                            content: text,
                            timestamp: new Date().toLocaleTimeString()
                          }
                        ]
                      };
                    }));
                  }}
                />
              )}

              {/* Incidents Master View */}
              {activeView === 'incidents' && currentUser.role !== 'EMPLOYEE' && (
                <IncidentList
                  incidents={incidents}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={(id) => setSelectedIncidentId(id)}
                  onNewIncidentClick={() => {}}
                  searchQuery={searchQuery}
                />
              )}

              {/* Knowledge Base View */}
              {(activeView === 'knowledge' || activeView === 'similar' || activeView === 'copilot' || activeView === 'diagnostics') && (
                <KnowledgeBase />
              )}

              {activeView === 'knowledge-base' && <KnowledgeBase />}
              {activeView === 'automations' && <AutomationsView />}
              {activeView === 'assets' && <AssetsView />}

              {/* Analytics & Dashboard View */}
              {(activeView === 'analytics' || activeView === 'dashboard') && <AnalyticsView />}

              {/* Automations View */}
              {activeView === 'automations' && (
                <ManagerHub
                  user={currentUser}
                  incidents={incidents}
                  onAssignTechnician={(id, tech) => {
                    setIncidents(prev => prev.map(i => i.id === id ? { ...i, assignedTechnician: tech } : i));
                  }}
                  onEscalateSeverity={(id, sev) => {
                    setIncidents(prev => prev.map(i => i.id === id ? { ...i, severity: sev } : i));
                  }}
                />
              )}

              {/* Admin & Users View */}
              {(activeView === 'users' || activeView === 'settings' || activeView === 'audit') && (
                <AdminControlCenter
                  currentUser={currentUser}
                  auditTrail={[]}
                  users={users}
                  onUpdateUserRole={(id, role) => setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))}
                  onAddUser={(name, email, role, dept, title) => {
                    const newUser: UserProfile = {
                      id: `usr-${Date.now()}`,
                      name,
                      email,
                      role,
                      department: dept,
                      title,
                      avatar: name.split(' ').map(n => n[0]).join('')
                    };
                    setUsers([...users, newUser]);
                  }}
                />
              )}
            </>
          )}

        </main>
      </div>

    </div>
  );
}
