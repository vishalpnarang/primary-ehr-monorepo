import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Axios instance for the employer portal with JWT auth interceptors.
 * Attaches Bearer token from sessionStorage and X-TENANT-ID header.
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

// Request interceptor — attach JWT token and tenant ID
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('primus-employer-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const tenantId = sessionStorage.getItem('primus-employer-tenant-id');
  if (tenantId) {
    config.headers['X-TENANT-ID'] = tenantId;
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
      sessionStorage.removeItem('primus-employer-token');
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

// ─── Keycloak token endpoint (direct grant) ───────────────────────────────────

const KC_BASE = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const KC_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'primus';
const KC_CLIENT = import.meta.env.VITE_KEYCLOAK_CLIENT || 'primus-employer';

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

  decodeToken: (token: string): Record<string, unknown> => {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as Record<string, unknown>;
  },
};

// ─── Employer Dashboard API ───────────────────────────────────────────────────

export const employerDashboardApi = {
  /** GET /api/v1/employers/{id}/dashboard — KPI summary for this employer */
  getKpi: (employerId: string) =>
    api.get<ApiResponse>(`/api/v1/employers/${employerId}/dashboard`),

  /** GET /api/v1/employers/{id}/activity — recent activity feed */
  getActivity: (employerId: string) =>
    api.get<ApiResponse>(`/api/v1/employers/${employerId}/activity`),
};

// ─── Employees API ────────────────────────────────────────────────────────────

export const employeesApi = {
  /** GET /api/v1/employers/{id}/employees — list all employees */
  list: (employerId: string, params?: Record<string, unknown>) =>
    api.get<ApiResponse>(`/api/v1/employers/${employerId}/employees`, { params }),

  /** POST /api/v1/employers/{id}/employees — add a new employee */
  add: (employerId: string, data: Record<string, unknown>) =>
    api.post<ApiResponse>(`/api/v1/employers/${employerId}/employees`, data),

  /** PUT /api/v1/employers/{id}/employees/{empId} — update employee */
  update: (employerId: string, empId: string, data: Record<string, unknown>) =>
    api.put<ApiResponse>(`/api/v1/employers/${employerId}/employees/${empId}`, data),

  /** DELETE /api/v1/employers/{id}/employees/{empId} — terminate employee */
  terminate: (employerId: string, empId: string) =>
    api.delete<ApiResponse>(`/api/v1/employers/${employerId}/employees/${empId}`),
};

// ─── Employer Invoices API ────────────────────────────────────────────────────

export const employerInvoicesApi = {
  /** GET /api/v1/invoices/employer/{id} — list invoices for this employer */
  list: (employerId: string) =>
    api.get<ApiResponse>(`/api/v1/invoices/employer/${employerId}`),

  /** GET /api/v1/invoices/{id} — invoice detail */
  getById: (invoiceId: string) =>
    api.get<ApiResponse>(`/api/v1/invoices/${invoiceId}`),

  /** POST /api/v1/invoices/{id}/pay — record payment */
  pay: (invoiceId: string, data: Record<string, unknown>) =>
    api.post<ApiResponse>(`/api/v1/invoices/${invoiceId}/pay`, data),

  /** GET /api/v1/invoices/{id}/download — download PDF link */
  download: (invoiceId: string) =>
    api.get<ApiResponse>(`/api/v1/invoices/${invoiceId}/download`),
};

// ─── Membership Plans API ─────────────────────────────────────────────────────

export const employerPlansApi = {
  /** GET /api/v1/plans — all available plans */
  getAll: () =>
    api.get<ApiResponse>('/api/v1/plans'),

  /** GET /api/v1/plans/employer/{id} — plans enrolled for this employer */
  getByEmployer: (employerId: string) =>
    api.get<ApiResponse>(`/api/v1/plans/employer/${employerId}`),

  /** POST /api/v1/plans/enroll — enroll employee in a plan */
  enroll: (data: Record<string, unknown>) =>
    api.post<ApiResponse>('/api/v1/plans/enroll', data),
};
