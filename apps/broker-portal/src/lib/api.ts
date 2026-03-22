import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Axios instance for the broker portal with JWT auth interceptors.
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
  const token = sessionStorage.getItem('primus-broker-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const tenantId = sessionStorage.getItem('primus-broker-tenant-id');
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
      sessionStorage.removeItem('primus-broker-token');
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
const KC_CLIENT = import.meta.env.VITE_KEYCLOAK_CLIENT || 'primus-broker';

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

// ─── Broker Dashboard API ─────────────────────────────────────────────────────

export const brokerDashboardApi = {
  /** GET /api/v1/brokers/{id}/dashboard — KPI summary (employers, enrollments, commission) */
  getKpi: (brokerId: string) =>
    api.get<ApiResponse>(`/api/v1/brokers/${brokerId}/dashboard`),

  /** GET /api/v1/brokers/{id}/events — recent event feed across all employers */
  getEvents: (brokerId: string) =>
    api.get<ApiResponse>(`/api/v1/brokers/${brokerId}/events`),
};

// ─── Broker Employers API ─────────────────────────────────────────────────────

export const brokerEmployersApi = {
  /** GET /api/v1/brokers/{id}/employers — all employer accounts managed by this broker */
  list: (brokerId: string, params?: Record<string, unknown>) =>
    api.get<ApiResponse>(`/api/v1/brokers/${brokerId}/employers`, { params }),

  /** GET /api/v1/brokers/{id}/employers/{employerId} — single employer detail */
  getById: (brokerId: string, employerId: string) =>
    api.get<ApiResponse>(`/api/v1/brokers/${brokerId}/employers/${employerId}`),

  /** POST /api/v1/brokers/{id}/employers — onboard a new employer account */
  create: (brokerId: string, data: Record<string, unknown>) =>
    api.post<ApiResponse>(`/api/v1/brokers/${brokerId}/employers`, data),

  /** PUT /api/v1/brokers/{id}/employers/{employerId} — update employer account */
  update: (brokerId: string, employerId: string, data: Record<string, unknown>) =>
    api.put<ApiResponse>(`/api/v1/brokers/${brokerId}/employers/${employerId}`, data),
};

// ─── Broker Commissions API ───────────────────────────────────────────────────

export const brokerCommissionsApi = {
  /** GET /api/v1/brokers/{id}/commissions — monthly commission records */
  list: (brokerId: string) =>
    api.get<ApiResponse>(`/api/v1/brokers/${brokerId}/commissions`),

  /** GET /api/v1/brokers/{id}/commissions/summary — YTD totals and pending */
  getSummary: (brokerId: string) =>
    api.get<ApiResponse>(`/api/v1/brokers/${brokerId}/commissions/summary`),

  /** GET /api/v1/brokers/{id}/commissions/{id}/download — PDF statement */
  download: (brokerId: string, commissionId: string) =>
    api.get<ApiResponse>(`/api/v1/brokers/${brokerId}/commissions/${commissionId}/download`),
};
