import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Axios instance with auth interceptors.
 * Automatically attaches Bearer token and X-TENANT-ID header.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true, // Send cookies (CSRF token, httpOnly session)
});

/**
 * Read the XSRF-TOKEN cookie set by Spring Security's CookieCsrfTokenRepository.
 */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Request interceptor — attach JWT, tenant ID, and CSRF token
api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('primus-auth');
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
      if (state?.tenantId) {
        config.headers['X-TENANT-ID'] = state.tenantId;
      }
    } catch {
      // Session corrupt — will redirect on 401
    }
  }

  // Attach CSRF token for mutating requests
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  return config;
});

// Response interceptor — handle 401 and 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('primus-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Typed API response wrapper.
 * Backend always returns: { timestamp, status, code, message, data, errors }
 */
export interface ApiResponse<T = unknown> {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  data: T;
  errors: Array<{ field: string; message: string }> | null;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse>('/api/v1/auth/login', { email, password }),

  me: () =>
    api.get<ApiResponse>('/api/v1/auth/me'),

  switchRole: (role: string) =>
    api.post<ApiResponse>('/api/v1/auth/switch-role', { role }),
};

// ─── Keycloak token endpoint (direct, bypasses Spring) ───────────────────────

const KC_BASE = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const KC_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'primus';
const KC_CLIENT = import.meta.env.VITE_KEYCLOAK_CLIENT || 'primus-frontend';

export const keycloakAuth = {
  /**
   * Get JWT token from Keycloak using Resource Owner Password flow.
   * For production, use PKCE Authorization Code flow instead.
   */
  getToken: async (username: string, password: string) => {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: KC_CLIENT,
      username,
      password,
    });

    const response = await fetch(
      `${KC_BASE}/realms/${KC_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      }
    );

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return response.json() as Promise<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    }>;
  },

  /** Decode JWT payload without verification (client-side only) */
  decodeToken: (token: string) => {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  },
};

// ─── Patient API ─────────────────────────────────────────────────────────────

export const patientApi = {
  list: (page = 0, size = 20) =>
    api.get<ApiResponse>('/api/v1/patients', { params: { page, size } }),

  search: (query: string) =>
    api.get<ApiResponse>('/api/v1/patients/search', { params: { q: query } }),

  getById: (uuid: string) =>
    api.get<ApiResponse>(`/api/v1/patients/${uuid}`),

  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/patients', data),

  update: (uuid: string, data: Record<string, unknown>) =>
    api.put<ApiResponse>(`/api/v1/patients/${uuid}`, data),

  delete: (uuid: string) =>
    api.delete<ApiResponse>(`/api/v1/patients/${uuid}`),

  addAllergy: (uuid: string, data: Record<string, unknown>) =>
    api.post<ApiResponse>(`/api/v1/patients/${uuid}/allergies`, data),

  addProblem: (uuid: string, data: Record<string, unknown>) =>
    api.post<ApiResponse>(`/api/v1/patients/${uuid}/problems`, data),

  recordVitals: (uuid: string, data: Record<string, unknown>) =>
    api.post<ApiResponse>(`/api/v1/patients/${uuid}/vitals`, data),

  getTimeline: (uuid: string) =>
    api.get<ApiResponse>(`/api/v1/patients/${uuid}/timeline`),
};

// ─── Appointment API ─────────────────────────────────────────────────────────

export const appointmentApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse>('/api/v1/appointments', { params }),

  today: () =>
    api.get<ApiResponse>('/api/v1/appointments/today'),

  getById: (uuid: string) =>
    api.get<ApiResponse>(`/api/v1/appointments/${uuid}`),

  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/appointments', data),

  updateStatus: (uuid: string, status: string) =>
    api.patch<ApiResponse>(`/api/v1/appointments/${uuid}/status`, { status }),

  availableSlots: (providerId: string, date: string) =>
    api.get<ApiResponse>('/api/v1/appointments/available-slots', {
      params: { providerId, date },
    }),
};

// ─── Encounter API ───────────────────────────────────────────────────────────

export const encounterApi = {
  list: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/encounters/patient/${patientUuid}`),

  getById: (uuid: string) =>
    api.get<ApiResponse>(`/api/v1/encounters/${uuid}`),

  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/encounters', data),

  update: (uuid: string, data: Record<string, unknown>) =>
    api.put<ApiResponse>(`/api/v1/encounters/${uuid}`, data),

  sign: (uuid: string) =>
    api.post<ApiResponse>(`/api/v1/encounters/${uuid}/sign`),
};

// ─── Order API ───────────────────────────────────────────────────────────────

export const orderApi = {
  createLab: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/orders/lab', data),

  createImaging: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/orders/imaging', data),

  createReferral: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/orders/referral', data),

  getByPatient: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/orders/patient/${patientUuid}`),
};

// ─── Prescription API ────────────────────────────────────────────────────────

export const prescriptionApi = {
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/prescriptions', data),

  getByPatient: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/prescriptions/patient/${patientUuid}`),

  send: (uuid: string) =>
    api.post<ApiResponse>(`/api/v1/prescriptions/${uuid}/send`),

  interactionCheck: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/prescriptions/interaction-check', data),
};

// ─── Billing API ─────────────────────────────────────────────────────────────

export const billingApi = {
  getClaims: (params?: Record<string, unknown>) =>
    api.get<ApiResponse>('/api/v1/billing/claims', { params }),

  getKpi: () =>
    api.get<ApiResponse>('/api/v1/billing/kpi'),

  submitClaim: (uuid: string) =>
    api.post<ApiResponse>(`/api/v1/billing/claims/${uuid}/submit`),

  getPatientBalance: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/billing/patient/${patientUuid}/balance`),

  getArAging: () =>
    api.get<ApiResponse>('/api/v1/billing/ar-aging'),

  recordPayment: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/billing/payments', data),
};

// ─── Messaging API ───────────────────────────────────────────────────────────

export const messagingApi = {
  getThreads: () =>
    api.get<ApiResponse>('/api/v1/messages/threads'),

  getThread: (uuid: string) =>
    api.get<ApiResponse>(`/api/v1/messages/threads/${uuid}`),

  sendMessage: (threadUuid: string, body: string) =>
    api.post<ApiResponse>(`/api/v1/messages/threads/${threadUuid}/messages`, { body }),

  markRead: (threadUuid: string) =>
    api.patch<ApiResponse>(`/api/v1/messages/threads/${threadUuid}/read`),

  unreadCount: () =>
    api.get<ApiResponse>('/api/v1/messages/unread-count'),
};

// ─── Inbox API ───────────────────────────────────────────────────────────────

export const inboxApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse>('/api/v1/inbox', { params }),

  counts: () =>
    api.get<ApiResponse>('/api/v1/inbox/count'),

  action: (uuid: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse>(`/api/v1/inbox/${uuid}/action`, data),

  archive: (uuid: string) =>
    api.patch<ApiResponse>(`/api/v1/inbox/${uuid}/archive`),
};

// ─── Notification API ────────────────────────────────────────────────────────

export const notificationApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<ApiResponse>('/api/v1/notifications', { params }),

  markRead: (uuid: string) =>
    api.patch<ApiResponse>(`/api/v1/notifications/${uuid}/read`),

  markAllRead: () =>
    api.patch<ApiResponse>('/api/v1/notifications/read-all'),

  unreadCount: () =>
    api.get<ApiResponse>('/api/v1/notifications/unread-count'),
};

// ─── Dashboard API ───────────────────────────────────────────────────────────

export const dashboardApi = {
  provider: (providerId?: string) =>
    api.get<ApiResponse>('/api/v1/dashboard/provider', { params: providerId ? { providerId } : {} }),

  nurse: () =>
    api.get<ApiResponse>('/api/v1/dashboard/nurse'),

  frontdesk: () =>
    api.get<ApiResponse>('/api/v1/dashboard/frontdesk'),

  billing: () =>
    api.get<ApiResponse>('/api/v1/dashboard/billing'),

  admin: () =>
    api.get<ApiResponse>('/api/v1/dashboard/admin'),
};

// ─── Settings API ────────────────────────────────────────────────────────────

export const settingsApi = {
  getOrganization: () =>
    api.get<ApiResponse>('/api/v1/settings/organization'),

  updateOrganization: (data: Record<string, unknown>) =>
    api.put<ApiResponse>('/api/v1/settings/organization', data),

  getLocations: () =>
    api.get<ApiResponse>('/api/v1/settings/locations'),

  addLocation: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/settings/locations', data),

  getUsers: () =>
    api.get<ApiResponse>('/api/v1/settings/users'),

  inviteUser: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/settings/users/invite', data),

  getTenants: () =>
    api.get<ApiResponse>('/api/v1/settings/tenants'),

  provisionTenant: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/settings/tenants', data),
};

// ─── Patient History API ─────────────────────────────────────────────────────
export const patientHistoryApi = {
  getFamilyHistory: (patientId: string) => api.get<ApiResponse>(`/api/v1/patients/${patientId}/history/family`),
  addFamilyHistory: (patientId: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/patients/${patientId}/history/family`, data),
  getSocialHistory: (patientId: string) => api.get<ApiResponse>(`/api/v1/patients/${patientId}/history/social`),
  saveSocialHistory: (patientId: string, data: Record<string, unknown>) => api.put<ApiResponse>(`/api/v1/patients/${patientId}/history/social`, data),
  getSurgicalHistory: (patientId: string) => api.get<ApiResponse>(`/api/v1/patients/${patientId}/history/surgical`),
  addSurgicalHistory: (patientId: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/patients/${patientId}/history/surgical`, data),
  getMedicalHistory: (patientId: string) => api.get<ApiResponse>(`/api/v1/patients/${patientId}/history/medical`),
  addMedicalHistory: (patientId: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/patients/${patientId}/history/medical`, data),
  getEmergencyContacts: (patientId: string) => api.get<ApiResponse>(`/api/v1/patients/${patientId}/history/emergency-contacts`),
  addEmergencyContact: (patientId: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/patients/${patientId}/history/emergency-contacts`, data),
  getFlags: (patientId: string) => api.get<ApiResponse>(`/api/v1/patients/${patientId}/history/flags`),
  addFlag: (patientId: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/patients/${patientId}/history/flags`, data),
};

// ─── Directory API ───────────────────────────────────────────────────────────
export const directoryApi = {
  getPharmacies: () => api.get<ApiResponse>('/api/v1/directory/pharmacies'),
  createPharmacy: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/directory/pharmacies', data),
  getContacts: (type?: string) => api.get<ApiResponse>('/api/v1/directory/contacts', { params: { type } }),
  createContact: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/directory/contacts', data),
  linkPharmacy: (patientId: string, pharmacyId: string) => api.post<ApiResponse>(`/api/v1/directory/patients/${patientId}/pharmacies/${pharmacyId}`),
  getPatientPharmacies: (patientId: string) => api.get<ApiResponse>(`/api/v1/directory/patients/${patientId}/pharmacies`),
};

// ─── Scheduling Admin API ────────────────────────────────────────────────────
export const schedulingAdminApi = {
  getAppointmentTypes: () => api.get<ApiResponse>('/api/v1/scheduling/admin/appointment-types'),
  createAppointmentType: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/scheduling/admin/appointment-types', data),
  getAvailability: (providerId: string) => api.get<ApiResponse>(`/api/v1/scheduling/admin/availability/${providerId}`),
  setAvailability: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/scheduling/admin/availability', data),
  getBlockDays: (providerId: string, from?: string, to?: string) => api.get<ApiResponse>(`/api/v1/scheduling/admin/block-days/${providerId}`, { params: { from, to } }),
  createBlockDay: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/scheduling/admin/block-days', data),
};

// ─── Clinical Templates API ──────────────────────────────────────────────────
export const clinicalTemplateApi = {
  getMacros: () => api.get<ApiResponse>('/api/v1/clinical-templates/macros'),
  createMacro: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/clinical-templates/macros', data),
  expandMacro: (abbreviation: string) => api.get<ApiResponse>(`/api/v1/clinical-templates/macros/expand/${abbreviation}`),
  getSoapTemplates: () => api.get<ApiResponse>('/api/v1/clinical-templates/soap-templates'),
  createSoapTemplate: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/clinical-templates/soap-templates', data),
};

// ─── Encounter Details API ───────────────────────────────────────────────────
export const encounterDetailApi = {
  getDiagnoses: (encounterUuid: string) => api.get<ApiResponse>(`/api/v1/encounters/${encounterUuid}/diagnoses`),
  addDiagnosis: (encounterUuid: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/encounters/${encounterUuid}/diagnoses`, data),
  getProcedures: (encounterUuid: string) => api.get<ApiResponse>(`/api/v1/encounters/${encounterUuid}/procedures`),
  addProcedure: (encounterUuid: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/encounters/${encounterUuid}/procedures`, data),
  getComments: (encounterUuid: string) => api.get<ApiResponse>(`/api/v1/encounters/${encounterUuid}/comments`),
  addComment: (encounterUuid: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/encounters/${encounterUuid}/comments`, data),
};

// ─── Care Plans API ──────────────────────────────────────────────────────────
export const carePlanApi = {
  getByPatient: (patientId: string) => api.get<ApiResponse>(`/api/v1/care-plans/patient/${patientId}`),
  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/care-plans', data),
  update: (id: string, data: Record<string, unknown>) => api.put<ApiResponse>(`/api/v1/care-plans/${id}`, data),
  getGoals: (planId: string) => api.get<ApiResponse>(`/api/v1/care-plans/${planId}/goals`),
  addGoal: (planId: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/care-plans/${planId}/goals`, data),
};

// ─── Labs API ────────────────────────────────────────────────────────────────
export const labApi = {
  getOrderSets: () => api.get<ApiResponse>('/api/v1/labs/order-sets'),
  createOrderSet: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/labs/order-sets', data),
  searchCatalog: (query: string) => api.get<ApiResponse>('/api/v1/labs/catalog/search', { params: { q: query } }),
  getPocResults: (patientId: string) => api.get<ApiResponse>(`/api/v1/labs/poc-results/patient/${patientId}`),
  recordPocResult: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/labs/poc-results', data),
};

// ─── Formulary API ───────────────────────────────────────────────────────────
export const formularyApi = {
  search: (query: string) => api.get<ApiResponse>('/api/v1/formulary/search', { params: { q: query } }),
  getAll: () => api.get<ApiResponse>('/api/v1/formulary'),
  getIntolerances: (patientId: string) => api.get<ApiResponse>(`/api/v1/formulary/patient/${patientId}/intolerances`),
  addIntolerance: (patientId: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/formulary/patient/${patientId}/intolerances`, data),
};

// ─── Inventory API ───────────────────────────────────────────────────────────
export const inventoryApi = {
  getItems: () => api.get<ApiResponse>('/api/v1/inventory/items'),
  createItem: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/inventory/items', data),
  getLowStock: () => api.get<ApiResponse>('/api/v1/inventory/low-stock'),
  recordTransaction: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/inventory/transactions', data),
};

// ─── Invoice API ─────────────────────────────────────────────────────────────
export const invoiceApi = {
  getByPatient: (patientId: string) => api.get<ApiResponse>(`/api/v1/invoices/patient/${patientId}`),
  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/invoices', data),
  send: (id: string) => api.post<ApiResponse>(`/api/v1/invoices/${id}/send`),
  void_: (id: string) => api.post<ApiResponse>(`/api/v1/invoices/${id}/void`),
  addLineItem: (id: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/invoices/${id}/line-items`, data),
};

// ─── Payment API ─────────────────────────────────────────────────────────────
export const paymentApi = {
  record: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/payments', data),
  getHistory: (patientId: string) => api.get<ApiResponse>(`/api/v1/payments/patient/${patientId}`),
  getMethods: (patientId: string) => api.get<ApiResponse>(`/api/v1/payments/methods/${patientId}`),
  saveMethod: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/payments/methods', data),
};

// ─── Membership Plans API ────────────────────────────────────────────────────
export const planApi = {
  getAll: () => api.get<ApiResponse>('/api/v1/plans'),
  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/plans', data),
  enroll: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/plans/enroll', data),
  getEnrollment: (patientId: string) => api.get<ApiResponse>(`/api/v1/plans/patient/${patientId}`),
};

// ─── RBAC API ────────────────────────────────────────────────────────────────
export const rbacApi = {
  getRoles: () => api.get<ApiResponse>('/api/v1/rbac/roles'),
  getPermissions: (roleId: string) => api.get<ApiResponse>(`/api/v1/rbac/roles/${roleId}/permissions`),
  getFeatures: () => api.get<ApiResponse>('/api/v1/rbac/features'),
  toggleFeature: (featureId: string) => api.put<ApiResponse>(`/api/v1/rbac/features/${featureId}/toggle`),
};

// ─── CRM API ─────────────────────────────────────────────────────────────────
export const crmApi = {
  getTickets: () => api.get<ApiResponse>('/api/v1/crm/tickets'),
  createTicket: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/crm/tickets', data),
  updateTicket: (id: string, data: Record<string, unknown>) => api.put<ApiResponse>(`/api/v1/crm/tickets/${id}`, data),
  getLeads: () => api.get<ApiResponse>('/api/v1/crm/leads'),
  createLead: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/crm/leads', data),
  getCampaigns: () => api.get<ApiResponse>('/api/v1/crm/campaigns'),
  createCampaign: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/crm/campaigns', data),
};

// ─── Employer API ────────────────────────────────────────────────────────────
export const employerApi = {
  getAll: () => api.get<ApiResponse>('/api/v1/employers'),
  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/employers', data),
  getEmployees: (employerId: string) => api.get<ApiResponse>(`/api/v1/employers/${employerId}/employees`),
  addEmployee: (employerId: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/employers/${employerId}/employees`, data),
};

// ─── Analytics API ───────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboards: () => api.get<ApiResponse>('/api/v1/analytics/dashboards'),
  getReports: () => api.get<ApiResponse>('/api/v1/analytics/reports'),
  runReport: (id: string, params?: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/analytics/reports/${id}/run`, params),
  getPatientVolume: () => api.get<ApiResponse>('/api/v1/analytics/stats/patient-volume'),
  getRevenue: () => api.get<ApiResponse>('/api/v1/analytics/stats/revenue'),
};

// ─── Notification Admin API ──────────────────────────────────────────────────
export const notificationAdminApi = {
  registerDevice: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/notifications/admin/devices', data),
  getPreferences: () => api.get<ApiResponse>('/api/v1/notifications/admin/preferences'),
  updatePreferences: (data: Record<string, unknown>) => api.put<ApiResponse>('/api/v1/notifications/admin/preferences', data),
  getLog: () => api.get<ApiResponse>('/api/v1/notifications/admin/log'),
  getEmailTemplates: () => api.get<ApiResponse>('/api/v1/notifications/admin/email-templates'),
};

// ─── Form Templates API ──────────────────────────────────────────────────────
export const formTemplateApi = {
  getAll: (category?: string) => api.get<ApiResponse>('/api/v1/form-templates', { params: { category } }),
  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/form-templates', data),
  publish: (id: string) => api.post<ApiResponse>(`/api/v1/form-templates/${id}/publish`),
  submit: (id: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/form-templates/${id}/submit`, data),
  getSubmissions: (patientId: string) => api.get<ApiResponse>(`/api/v1/form-templates/submissions/patient/${patientId}`),
};

// ─── Questionnaire API ───────────────────────────────────────────────────────
export const questionnaireApi = {
  getAll: () => api.get<ApiResponse>('/api/v1/questionnaires'),
  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/api/v1/questionnaires', data),
  respond: (id: string, data: Record<string, unknown>) => api.post<ApiResponse>(`/api/v1/questionnaires/${id}/respond`, data),
  getPatientResponses: (patientId: string) => api.get<ApiResponse>(`/api/v1/questionnaires/patient/${patientId}/responses`),
};
