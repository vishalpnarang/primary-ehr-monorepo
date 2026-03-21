import type { User } from '../../types';

export const mockUsers: User[] = [
  {
    id: 'USR-00001',
    email: 'alex.morgan@thinkitive.com',
    firstName: 'Alex',
    lastName: 'Morgan',
    role: 'super_admin',
    tenantId: 'TEN-00001',
    title: 'Super Administrator',
  },
  {
    id: 'USR-00002',
    email: 'james.wilson@primusdemomedical.com',
    firstName: 'James',
    lastName: 'Wilson',
    role: 'tenant_admin',
    tenantId: 'TEN-00001',
    title: 'Clinic Owner',
  },
  {
    id: 'USR-00003',
    email: 'maria.garcia@primusdemomedical.com',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'practice_admin',
    tenantId: 'TEN-00001',
    title: 'Office Manager',
  },
  {
    id: 'USR-00004',
    email: 'emily.chen@primusdemomedical.com',
    firstName: 'Emily',
    lastName: 'Chen',
    role: 'provider',
    tenantId: 'TEN-00001',
    providerId: 'PRV-00001',
    title: 'MD',
    specialty: 'Internal Medicine',
    npi: '1234567890',
  },
  {
    id: 'USR-00005',
    email: 'sarah.thompson@primusdemomedical.com',
    firstName: 'Sarah',
    lastName: 'Thompson',
    role: 'nurse',
    tenantId: 'TEN-00001',
    title: 'RN',
  },
  {
    id: 'USR-00006',
    email: 'david.kim@primusdemomedical.com',
    firstName: 'David',
    lastName: 'Kim',
    role: 'front_desk',
    tenantId: 'TEN-00001',
  },
  {
    id: 'USR-00007',
    email: 'lisa.patel@primusdemomedical.com',
    firstName: 'Lisa',
    lastName: 'Patel',
    role: 'billing',
    tenantId: 'TEN-00001',
    title: 'Billing Specialist',
  },
  {
    id: 'USR-00008',
    email: 'robert.johnson@email.com',
    firstName: 'Robert',
    lastName: 'Johnson',
    role: 'patient',
    tenantId: 'TEN-00001',
  },
];

export const mockCurrentUser: User = mockUsers[3]; // Dr. Emily Chen as default

export const getUserById = (id: string): User | undefined =>
  mockUsers.find((u) => u.id === id);

export const getUserByRole = (role: User['role']): User | undefined =>
  mockUsers.find((u) => u.role === role);
