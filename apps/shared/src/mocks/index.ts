// ============================================================
// Primus EHR — Mock Data Barrel Export
// ============================================================

// Users
export {
  mockUsers,
  mockCurrentUser,
  getUserById,
  getUserByRole,
} from './data/users';

// Patients
export {
  mockPatients,
  getPatientById,
} from './data/patients';

// Appointments
export {
  mockAppointments,
  getAppointmentById,
  getAppointmentsByPatient,
  getTodaysAppointments,
} from './data/appointments';

// Encounters
export {
  mockEncounters,
  getEncounterById,
  getEncountersByPatient,
} from './data/encounters';

// Clinical Data
export {
  mockProblems,
  mockMedications,
  mockLabResults,
  mockVitals,
  mockImmunizations,
  mockReferrals,
  mockCareGaps,
  getProblemsByPatient,
  getMedicationsByPatient,
  getLabResultsByPatient,
  getVitalsByPatient,
  getCareGapsByPatient,
} from './data/clinical';

// Billing
export {
  mockClaims,
  mockBillingKpi,
  getClaimsByPatient,
  getClaimsByStatus,
} from './data/billing';

// Inbox
export {
  mockInboxItems,
  mockMessageThreads,
  mockTasks,
  getInboxByAssignee,
  getUnreadInboxCount,
  getTasksByAssignee,
} from './data/inbox';

// Settings
export {
  mockTenant,
  mockTenantWithLocations,
  mockLocations,
  mockSmartPhrases,
} from './data/settings';

// Timeline
export {
  mockPatientTimeline,
  getPatientTimeline,
} from './data/timeline';

// API Service Layer (both portals use these)
export {
  patientApi,
  appointmentApi,
  encounterApi,
  clinicalApi,
  billingApi,
  inboxApi,
  userApi,
  settingsApi,
} from './api';
