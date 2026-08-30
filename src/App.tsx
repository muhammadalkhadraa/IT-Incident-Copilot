import { useState, useEffect } from 'react';
import type { Incident, UserProfile, PlaybookAction, ActionExecutionResult, UserRole } from './types';
import { INITIAL_INCIDENTS } from './data/mockData';
import { MOCK_USERS as INITIAL_USERS } from './data/mockUsers';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IncidentList } from './components/IncidentList';
import { IncidentWorkstation } from './components/IncidentDetail/IncidentWorkstation';
// import { KnowledgeBase } from './components/KnowledgeBase';
import { AdminControlCenter } from './components/AdminControlCenter';
import { EmployeePortal } from './components/EmployeePortal';
// import { AssetsView } from './components/AssetsView';
import { AnalyticsView } from './components/AnalyticsView';
// import { AutomationsView } from './components/AutomationsView';
import { AuthModal } from './components/AuthModal';
import { AutomationWebhookEngine } from './services/automationWebhookEngine';
import { apiService } from './services/apiService';

export function App() {
  // Session Storage Persistence:
  // 1. Page Refresh (F5): sessionStorage persists -> User stays logged in on the exact same page.
  // 2. Tab/Window Closed & Reopened: sessionStorage automatically wipes -> Website opens on Login Page.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('copilot_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUser = sessionStorage.getItem('copilot_user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch {}
    }
    return INITIAL_USERS[1];
  });

  const [activeView, setActiveView] = useState<string>(() => {
    return sessionStorage.getItem('copilot_view') || 'incidents';
  });

  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync session state to sessionStorage
  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('copilot_auth', 'true');
      sessionStorage.setItem('copilot_user', JSON.stringify(currentUser));
      sessionStorage.setItem('copilot_view', activeView);
    } else {
      sessionStorage.removeItem('copilot_auth');
      sessionStorage.removeItem('copilot_user');
      sessionStorage.removeItem('copilot_view');
    }
  }, [isAuthenticated, currentUser, activeView]);

  // Fetch initial incidents and user directory from ASP.NET Core backend API on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const fetchedIncidents = await apiService.fetchIncidents();
        if (fetchedIncidents && fetchedIncidents.length > 0) {
          setIncidents(fetchedIncidents);
        }
      } catch (err) {
        console.warn('Backend API offline or unreachable, using local fallback incidents data.', err);
      }

      try {
        const fetchedUsers = await apiService.fetchUsers();
        if (fetchedUsers && fetchedUsers.length > 0) {
          setUsers(fetchedUsers);
        }
      } catch (err) {
        console.warn('Could not fetch user directory from backend API, using initial users.', err);
      }
    }
    loadBackendData();
  }, []);

  // Handle Switching Persona User
  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);

    // Contextual view routing per persona (Standard User -> Employee Portal; Developer -> Incidents/Admin)
    const targetView = user.role === 'EMPLOYEE' ? 'employee-portal'
      : user.role === 'TECHNICIAN' ? 'incidents'
      : user.role === 'IT_MANAGER' ? 'analytics'
      : 'users';

    setActiveView(targetView);
    sessionStorage.setItem('copilot_user', JSON.stringify(user));
    sessionStorage.setItem('copilot_view', targetView);
  };

  // Handle Login & Registration Success
  const handleLoginSuccess = (user: UserProfile) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setUsers(prev => {
      if (prev.some(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase())) {
        return prev.map(u => u.email.toLowerCase() === user.email.toLowerCase() ? user : u);
      }
      return [...prev, user];
    });

    const targetView = user.role === 'EMPLOYEE' ? 'employee-portal' : 'incidents';
    setActiveView(targetView);

    sessionStorage.setItem('copilot_auth', 'true');
    sessionStorage.setItem('copilot_user', JSON.stringify(user));
    sessionStorage.setItem('copilot_view', targetView);
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setSelectedIncidentId(null);
  };

  // Handle Updating User Role (Developer Control Panel)
  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }

    try {
      await apiService.updateUserRole(userId, newRole);
    } catch (err) {
      console.warn('Could not persist role update to backend API:', err);
    }
  };

  // Select active incident for workstation diagnosis
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  // Navigation Handler
  const handleNavigate = (view: string) => {
    setActiveView(view);
    setSelectedIncidentId(null);
    sessionStorage.setItem('copilot_view', view);
  };

  // Update incident status with State Machine audit logging, n8n webhook dispatch & backend API persistence
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

    // Async backend API persistence
    apiService.updateIncidentStatus(incidentId, newStatus).catch(err => {
      console.warn('Could not persist status update to backend API:', err);
    });
  };

  // Filter incidents for current user persona:
  // Standard Users (EMPLOYEE) see ONLY their own tickets
  // Developers / Technicians / Admins see ALL tickets across the enterprise
  const isDeveloperOrAdmin = currentUser.role === 'TECHNICIAN' || currentUser.role === 'IT_MANAGER' || currentUser.role === 'ADMINISTRATOR';

  const userVisibleIncidents = isDeveloperOrAdmin
    ? incidents
    : incidents.filter(i => {
        if (!i.reporter) return false;
        const rep = i.reporter.toLowerCase();
        const uName = currentUser.name.toLowerCase();
        const uFirstName = uName.split(' ')[0];
        return (i.reporterId && i.reporterId === currentUser.id) || rep === uName || (uFirstName.length > 2 && rep.includes(uFirstName));
      });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070a11] text-slate-100 flex items-center justify-center relative overflow-hidden font-sans">
        {/* Ambient background lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

        <AuthModal
          isOpen={true}
          isMandatory={true}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      
      {/* Auth Modal (Account Switcher) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Top Enterprise Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        incidents={userVisibleIncidents}
        onSearchChange={setSearchQuery}
        activeTab={activeView}
        onTabChange={(tab) => handleNavigate(tab)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentRole={currentUser.role}
          activeView={activeView}
          onNavigate={handleNavigate}
          incidentsCount={userVisibleIncidents.length}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          
          {/* Workstation Detail View */}
              {/* Employee Portal View */}
              {activeView === 'employee-portal' && (
                <EmployeePortal
                  user={currentUser}
                  incidents={incidents}
                  onReportIncident={async (title: string, category: string, description: string, attachmentName?: string, hostname?: string, ipAddress?: string, macAddress?: string, assignedTech?: string) => {
                    try {
                      const persistedInc = await apiService.createIncident({
                        title,
                        description,
                        category,
                        reporter: currentUser.name,
                        hostname: hostname || 'WORKSTATION-PC01',
                        ipAddress: ipAddress || '192.168.1.105',
                        macAddress: macAddress || '00:1A:2B:7C:8D:9E',
                        severity: 'MEDIUM'
                      });
                      if (assignedTech) {
                        persistedInc.assignedTechnician = assignedTech;
                      }
                      if (attachmentName) {
                        persistedInc.attachments = [{
                          id: `att-${Date.now()}`,
                          filename: attachmentName,
                          filesize: '1.4 MB',
                          filetype: 'PNG',
                          uploadedBy: currentUser.name,
                          uploadedAt: new Date().toISOString(),
                          url: '#'
                        }];
                      }
                      setIncidents(prev => [persistedInc, ...prev]);
                      setSelectedIncidentId(persistedInc.id);
                      setActiveView('incidents');
                    } catch (err) {
                      console.error('Failed to save ticket to backend database, creating local ticket:', err);
                      const nextSeq = String(incidents.length + 1).padStart(4, '0');
                      const newInc: Incident = {
                        id: `inc-${Date.now()}`,
                        ticketNumber: `INC-2026-${nextSeq}`,
                        title,
                        description,
                        category,
                        severity: 'MEDIUM',
                        status: 'NEW',
                        affectedService: category,
                        reporter: currentUser.name,
                        reporterId: currentUser.id,
                        assignedTechnician: assignedTech || 'Alex Thorne',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        slaDueDate: new Date(Date.now() + 86400000).toISOString(),
                        deviceTelemetry: {
                          deviceId: `dev-${Date.now()}`,
                          hostname: hostname || 'WORKSTATION-PC01',
                          os: 'Windows 11 Enterprise',
                          ipAddress: ipAddress || '192.168.1.105',
                          macAddress: macAddress || '00:1A:2B:7C:8D:9E',
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
                      setIncidents(prev => [newInc, ...prev]);
                      setSelectedIncidentId(newInc.id);
                      setActiveView('incidents');
                    }
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
                    incidents={userVisibleIncidents}
                    selectedIncidentId={selectedIncidentId}
                    onSelectIncident={(id) => setSelectedIncidentId(id)}
                    onNewIncidentClick={() => setActiveView('employee-portal')}
                    searchQuery={searchQuery}
                    onAcceptTicket={(id) => handleUpdateStatus(id, 'DIAGNOSING')}
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

              {/* Commented out for future work: Knowledge Base, Automations, CMDB Assets */}
              {/* 
              {(activeView === 'knowledge' || activeView === 'knowledge-base') && (
                <KnowledgeBase />
              )}

              {activeView === 'automations' && (
                <AutomationsView />
              )}

              {activeView === 'assets' && (
                <AssetsView />
              )}
              */}

              {/* Analytics & Dashboard View */}
              {(activeView === 'analytics' || activeView === 'dashboard') && (
                <AnalyticsView />
              )}

              {/* Admin & Users View (Developer User Control Section) */}
              {(activeView === 'users' || activeView === 'settings' || activeView === 'audit') && (
                <AdminControlCenter
                  currentUser={currentUser}
                  initialTab={activeView === 'settings' ? 'settings' : activeView === 'audit' ? 'audit' : 'users'}
                  auditTrail={[]}
                  users={users}
                  onUpdateUserRole={handleUpdateUserRole}
                  onAddUser={async (name, email, role, dept, title) => {
                    try {
                      const res = await apiService.register(name, email, 'Password123!', role);
                      setUsers(prev => [...prev, res.user]);
                    } catch (err) {
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
                    }
                  }}
                />
              )}

        </main>
      </div>

    </div>
  );
}
