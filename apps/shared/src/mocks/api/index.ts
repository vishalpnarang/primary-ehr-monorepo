/**
 * Shared Mock API Service Layer
 * Both portals use these functions. In Phase 2+, swap implementations to real HTTP calls.
 * All functions return Promises to match real API patterns.
 */

import { mockPatients, getPatientById } from '../data/patients';
import { mockAppointments, getTodaysAppointments, getAppointmentsByPatient } from '../data/appointments';
import { mockEncounters, getEncountersByPatient } from '../data/encounters';
import {
  mockProblems, mockMedications, mockLabResults, mockVitals,
  mockImmunizations, mockReferrals, mockCareGaps,
  getProblemsByPatient, getMedicationsByPatient, getLabResultsByPatient,
  getVitalsByPatient, getCareGapsByPatient,
} from '../data/clinical';
import { mockClaims, mockBillingKpi, getClaimsByStatus } from '../data/billing';
import { mockInboxItems, mockMessageThreads, mockTasks, getUnreadInboxCount } from '../data/inbox';
import { mockTenant, mockLocations, mockSmartPhrases } from '../data/settings';
import { mockUsers, getUserByRole } from '../data/users';
import { mockPatientTimeline, getPatientTimeline } from '../data/timeline';

// Simulate network delay
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Patient API ─────────────────────────────────────────────────────────────

export const patientApi = {
  list: async () => { await delay(); return mockPatients; },
  getById: async (id: string) => { await delay(); return getPatientById(id); },
  search: async (query: string) => {
    await delay(100);
    const q = query.toLowerCase();
    return mockPatients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.dob.includes(q)
    );
  },
};

// ─── Appointment API ─────────────────────────────────────────────────────────

export const appointmentApi = {
  list: async () => { await delay(); return mockAppointments; },
  getTodays: async () => { await delay(); return getTodaysAppointments(); },
  getByPatient: async (patientId: string) => { await delay(); return getAppointmentsByPatient(patientId); },
  getUpcoming: async (patientId: string) => {
    await delay();
    return getAppointmentsByPatient(patientId).filter(a => a.status !== 'completed' && a.status !== 'cancelled' && a.status !== 'no_show');
  },
  getPast: async (patientId: string) => {
    await delay();
    return getAppointmentsByPatient(patientId).filter(a => a.status === 'completed');
  },
};

// ─── Encounter API ───────────────────────────────────────────────────────────

export const encounterApi = {
  list: async () => { await delay(); return mockEncounters; },
  getByPatient: async (patientId: string) => { await delay(); return getEncountersByPatient(patientId); },
};

// ─── Clinical API ────────────────────────────────────────────────────────────

export const clinicalApi = {
  getProblems: async (patientId: string) => { await delay(); return getProblemsByPatient(patientId); },
  getAllProblems: async () => { await delay(); return mockProblems; },
  getMedications: async (patientId: string) => { await delay(); return getMedicationsByPatient(patientId); },
  getAllMedications: async () => { await delay(); return mockMedications; },
  getLabResults: async (patientId: string) => { await delay(); return getLabResultsByPatient(patientId); },
  getAllLabResults: async () => { await delay(); return mockLabResults; },
  getVitals: async (patientId: string) => { await delay(); return getVitalsByPatient(patientId); },
  getAllVitals: async () => { await delay(); return mockVitals; },
  getImmunizations: async () => { await delay(); return mockImmunizations; },
  getReferrals: async () => { await delay(); return mockReferrals; },
  getCareGaps: async (patientId: string) => { await delay(); return getCareGapsByPatient(patientId); },
  getTimeline: async (patientId: string) => { await delay(); return getPatientTimeline(patientId); },
};

// ─── Billing API ─────────────────────────────────────────────────────────────

export const billingApi = {
  getClaims: async () => { await delay(); return mockClaims; },
  getClaimsByStatus: async (status: string) => { await delay(); return getClaimsByStatus(status as any); },
  getKpi: async () => { await delay(); return mockBillingKpi; },
  getPatientBalance: async (patientId: string) => {
    await delay();
    const claims = mockClaims.filter(c => c.patientId === patientId);
    const total = claims.reduce((sum, c) => sum + (c.patientResponsibility ?? 0), 0);
    return { patientId, balance: total, claims };
  },
};

// ─── Inbox API ───────────────────────────────────────────────────────────────

export const inboxApi = {
  getItems: async () => { await delay(); return mockInboxItems; },
  getUnreadCount: async () => { await delay(); return getUnreadInboxCount(); },
  getThreads: async () => { await delay(); return mockMessageThreads; },
  getTasks: async () => { await delay(); return mockTasks; },
};

// ─── User / Auth API ─────────────────────────────────────────────────────────

export const userApi = {
  list: async () => { await delay(); return mockUsers; },
  getByRole: async (role: string) => { await delay(); return getUserByRole(role as any); },
};

// ─── Settings / Org API ──────────────────────────────────────────────────────

export const settingsApi = {
  getTenant: async () => { await delay(); return mockTenant; },
  getLocations: async () => { await delay(); return mockLocations; },
  getSmartPhrases: async () => { await delay(); return mockSmartPhrases; },
};
