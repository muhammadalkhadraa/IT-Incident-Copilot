import { useState } from 'react';
import type { Incident, UserProfile, PlaybookAction, ActionExecutionResult } from './types';
import { INITIAL_INCIDENTS } from './data/mockData';
import { MOCK_USERS as INITIAL_USERS } from './data/mockUsers';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IncidentList } from './components/IncidentList';
import { IncidentWorkstation } from './components/IncidentDetail/IncidentWorkstation';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AdminControlCenter } from './components/AdminControlCenter';
import { EmployeePortal } from './components/EmployeePortal';
import { AssetsView } from './components/AssetsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AutomationsView } from './components/AutomationsView';
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
          
          {/* Workstation Detail View */}
              {/* Employee Portal View */}
              {activeView === 'employee-portal' && (
                <EmployeePortal
                  user={currentUser}
                  incidents={incidents}
                  onReportIncident={(title: string, category: string, description: string, attachmentName?: string) => {
                    const newInc: Incident = {
                      id: `inc-${Date.now()}`,
                      ticketNumber: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      title,
                      description,
                      category,
                      severity: 'MEDIUM',
                      status: 'NEW',
                      affectedService: category,
                      reporter: currentUser.name,
                      reporterId: currentUser.id,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      slaDueDate: new Date(Date.now() + 86400000).toISOString(),
                      deviceTelemetry: {
                        deviceId: `dev-${Date.now()}`,
                        hostname: 'HOST-EXEC-PRT04',
                        os: 'Windows 11 Enterprise',
                        ipAddress: '10.140.12.88',
                        lastHeartbeat: new Date().toISOString(),
                        agentVersion: 'v4.8.2',
                        uptime: '14 days',
                        metrics: [],
                        logs: []
                      },
                      diagnosticResults: [],
                      similarIncidents: [],
                      recommendedPlaybooks: [],
                      attachments: attachmentName ? [{
                        id: `att-${Date.now()}`,
                        filename: attachmentName,
                        filesize: '1.4 MB',
                        filetype: 'PNG',
                        uploadedBy: currentUser.name,
                        uploadedAt: new Date().toISOString(),
                        url: '#'
                      }] : [],
                      executionHistory: [],
                      auditTrail: [],
                      comments: []
                    };
                    setIncidents([newInc, ...incidents]);
                    setSelectedIncidentId(newInc.id);
                    setActiveView('incidents');
                  }}
                  onAddComment={(incidentId: string, text: string) => {
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

              {/* Incidents Master List & Detail Workstation */}
              {activeView === 'incidents' && (
                selectedIncident ? (
                  <IncidentWorkstation
                    incident={selectedIncident}
                    onBack={() => setSelectedIncidentId(null)}
                    onUpdateStatus={handleUpdateStatus}
                    onExecutePlaybook={async (action: PlaybookAction, approverName?: string) => {
                      if (!selectedIncidentId) return;
                      const log: ActionExecutionResult = {
                        actionId: action.code,
                        executedBy: approverName || currentUser.name,
                        startedAt: new Date().toISOString(),
                        completedAt: new Date().toISOString(),
                        success: true,
                        outputLog: `[EXECUTION OK] ${action.code} executed successfully by ${approverName || currentUser.name}.`,
                        exitCode: 0
                      };
                      setIncidents(prev => prev.map(i => i.id === selectedIncidentId ? {
                        ...i,
                        executionHistory: [log, ...i.executionHistory]
                      } : i));
                    }}
                    onReRunDiagnostics={() => {
                      alert('Re-running diagnostic rule framework...');
                    }}
                  />
                ) : (
                  <IncidentList
                    incidents={incidents}
                    selectedIncidentId={selectedIncidentId}
                    onSelectIncident={(id) => setSelectedIncidentId(id)}
                    onNewIncidentClick={() => setActiveView('employee-portal')}
                    searchQuery={searchQuery}
                  />
                )
              )}

              {/* Diagnostics, Copilot & Similar Incidents inside Workstation */}
              {(activeView === 'diagnostics' || activeView === 'copilot' || activeView === 'similar') && (
                <IncidentWorkstation
                  incident={selectedIncident || incidents[0]}
                  onBack={() => setActiveView('incidents')}
                  onUpdateStatus={handleUpdateStatus}
                  onExecutePlaybook={async (action: PlaybookAction, approverName?: string) => {
                    const targetId = selectedIncidentId || incidents[0]?.id;
                    if (!targetId) return;
                    const log: ActionExecutionResult = {
                      actionId: action.code,
                      executedBy: approverName || currentUser.name,
                      startedAt: new Date().toISOString(),
                      completedAt: new Date().toISOString(),
                      success: true,
                      outputLog: `[EXECUTION OK] ${action.code} executed successfully by ${approverName || currentUser.name}.`,
                      exitCode: 0
                    };
                    setIncidents(prev => prev.map(i => i.id === targetId ? {
                      ...i,
                      executionHistory: [log, ...i.executionHistory]
                    } : i));
                  }}
                  onReRunDiagnostics={() => {
                    alert('Re-running diagnostic rule framework...');
                  }}
                />
              )}

              {/* Knowledge Base View */}
              {(activeView === 'knowledge' || activeView === 'knowledge-base') && (
                <KnowledgeBase />
              )}

              {/* Automations View */}
              {activeView === 'automations' && (
                <AutomationsView />
              )}

              {/* CMDB Assets View */}
              {activeView === 'assets' && (
                <AssetsView />
              )}

              {/* Analytics & Dashboard View */}
              {(activeView === 'analytics' || activeView === 'dashboard') && (
                <AnalyticsView />
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

        </main>
      </div>

    </div>
  );
}
