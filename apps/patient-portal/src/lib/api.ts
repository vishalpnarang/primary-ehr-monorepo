import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Axios instance for the patient portal with JWT auth interceptors.
 * Automatically attaches Bearer token from sessionStorage.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,
});

function getCsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('primus-patient-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }
  return config;
});

// Response interceptor — handle 401 (redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('primus-patient-token');
      sessionStorage.removeItem('primus-patient-uuid');
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

// ─── Keycloak token endpoint (direct grant, bypasses Spring) ─────────────────

const KC_BASE = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const KC_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'primus';
const KC_CLIENT = import.meta.env.VITE_KEYCLOAK_CLIENT || 'primus-patient';

export const keycloakAuth = {
  /**
   * Get JWT token from Keycloak using Resource Owner Password flow.
   * For production, replace with PKCE Authorization Code flow.
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
  decodeToken: (token: string): Record<string, unknown> => {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as Record<string, unknown>;
  },
};

// ─── Patient API ─────────────────────────────────────────────────────────────

export const patientApi = {
  /** GET /api/v1/patients/me — profile of the currently authenticated patient */
  getMyProfile: () =>
    api.get<ApiResponse>('/api/v1/patients/me'),

  /** GET /api/v1/patients/{uuid} — profile by UUID extracted from JWT */
  getById: (uuid: string) =>
    api.get<ApiResponse>(`/api/v1/patients/${uuid}`),
};

// ─── Appointment API ──────────────────────────────────────────────────────────

export const appointmentApi = {
  /** GET /api/v1/appointments?status=SCHEDULED,CONFIRMED */
  getUpcoming: () =>
    api.get<ApiResponse>('/api/v1/appointments', {
      params: { status: 'SCHEDULED,CONFIRMED' },
    }),

  /** GET /api/v1/appointments?status=COMPLETED */
  getPast: () =>
    api.get<ApiResponse>('/api/v1/appointments', {
      params: { status: 'COMPLETED' },
    }),

  /** POST /api/v1/appointments */
  book: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/appointments', data),

  /** PATCH /api/v1/appointments/{uuid}/status */
  cancel: (uuid: string) =>
    api.patch<ApiResponse>(`/api/v1/appointments/${uuid}/status`, {
      status: 'CANCELLED',
    }),

  /** GET /api/v1/appointments/available-slots */
  availableSlots: (providerId: string, date: string) =>
    api.get<ApiResponse>('/api/v1/appointments/available-slots', {
      params: { providerId, date },
    }),
};

// ─── Messaging API ────────────────────────────────────────────────────────────

export const messagingApi = {
  /** GET /api/v1/messages/threads */
  getThreads: () =>
    api.get<ApiResponse>('/api/v1/messages/threads'),

  /** GET /api/v1/messages/threads/{uuid} */
  getThread: (threadUuid: string) =>
    api.get<ApiResponse>(`/api/v1/messages/threads/${threadUuid}`),

  /** POST /api/v1/messages/threads/{uuid}/messages */
  sendMessage: (threadUuid: string, body: string) =>
    api.post<ApiResponse>(`/api/v1/messages/threads/${threadUuid}/messages`, { body }),

  /** PATCH /api/v1/messages/threads/{uuid}/read */
  markRead: (threadUuid: string) =>
    api.patch<ApiResponse>(`/api/v1/messages/threads/${threadUuid}/read`),
};

// ─── Records API ──────────────────────────────────────────────────────────────

export const recordsApi = {
  /** GET /api/v1/patients/{uuid}/labs */
  getLabResults: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/patients/${patientUuid}/labs`),

  /** GET /api/v1/prescriptions/patient/{uuid} */
  getMedications: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/prescriptions/patient/${patientUuid}`),

  /** GET /api/v1/patients/{uuid}/encounters */
  getEncounters: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/patients/${patientUuid}/encounters`),

  /** GET /api/v1/patients/{uuid}/immunizations */
  getImmunizations: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/patients/${patientUuid}/immunizations`),
};

// ─── Billing API ──────────────────────────────────────────────────────────────

export const billingApi = {
  /** GET /api/v1/billing/patient/{uuid}/balance */
  getBalance: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/billing/patient/${patientUuid}/balance`),

  /** POST /api/v1/billing/payments */
  makePayment: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/billing/payments', data),

  /** GET /api/v1/billing/patient/{uuid}/statements */
  getStatements: (patientUuid: string) =>
    api.get<ApiResponse>(`/api/v1/billing/patient/${patientUuid}/statements`),
};
