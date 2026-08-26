import type { UserProfile } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-emp-01',
    name: 'Sarah Connor',
    email: 'sarah.connor@corp.internal',
    role: 'EMPLOYEE',
    avatar: 'SC',
    department: 'Sales & Operations',
    title: 'Senior Account Executive',
  },
  {
    id: 'user-tech-01',
    name: 'Alex Thorne',
    email: 'alex.thorne@corp.internal',
    role: 'TECHNICIAN',
    avatar: 'AT',
    department: 'IT Service Desk',
    title: 'Tier-2 Incident Engineer',
  },
  {
    id: 'user-mgr-01',
    name: 'Marcus Vance',
    email: 'marcus.vance@corp.internal',
    role: 'IT_MANAGER',
    avatar: 'MV',
    department: 'IT Operations Management',
    title: 'IT Operations Director',
  },
  {
    id: 'user-admin-01',
    name: 'System Admin',
    email: 'admin@corp.internal',
    role: 'ADMINISTRATOR',
    avatar: 'SA',
    department: 'Enterprise Security & Admin',
    title: 'Principal Systems Administrator',
  },
];
