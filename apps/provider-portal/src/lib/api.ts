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
});

// Request interceptor — attach JWT token and tenant ID from Zustand persisted store
api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('primus-auth');
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
      config.headers['X-TENANT-ID'] = state?.tenantId || '5';
    } catch {
      config.headers['X-TENANT-ID'] = '5';
    }
  } else {
    config.headers['X-TENANT-ID'] = '5';
  }

  return config;
});

// Response interceptor — handle 401 (redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('primus-access-token');
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
