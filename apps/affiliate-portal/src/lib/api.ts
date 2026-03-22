import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Axios instance for the affiliate portal with JWT auth interceptors.
 * Attaches Bearer token from sessionStorage and X-TENANT-ID header.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach JWT token and tenant ID
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('primus-affiliate-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const tenantId = sessionStorage.getItem('primus-affiliate-tenant-id');
  config.headers['X-TENANT-ID'] = tenantId || '5';
  return config;
});

// Response interceptor — handle 401 (redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('primus-affiliate-token');
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
const KC_CLIENT = import.meta.env.VITE_KEYCLOAK_CLIENT || 'primus-affiliate';

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

// ─── Affiliate Dashboard API ──────────────────────────────────────────────────

export const affiliateDashboardApi = {
  /** GET /api/v1/affiliates/{id}/dashboard — referral KPI summary */
  getStats: (affiliateId: string) =>
    api.get<ApiResponse>(`/api/v1/affiliates/${affiliateId}/dashboard`),

  /** GET /api/v1/affiliates/{id}/recent-referrals — recent referral list */
  getRecentReferrals: (affiliateId: string) =>
    api.get<ApiResponse>(`/api/v1/affiliates/${affiliateId}/recent-referrals`),
};

// ─── Affiliate Patients (Referred) API ───────────────────────────────────────

export const affiliatePatientsApi = {
  /** GET /api/v1/affiliates/{id}/patients — all patients referred by this affiliate */
  list: (affiliateId: string, params?: Record<string, unknown>) =>
    api.get<ApiResponse>(`/api/v1/affiliates/${affiliateId}/patients`, { params }),

  /** POST /api/v1/affiliates/{id}/referrals — submit a new patient referral */
  refer: (affiliateId: string, data: Record<string, unknown>) =>
    api.post<ApiResponse>(`/api/v1/affiliates/${affiliateId}/referrals`, data),

  /** GET /api/v1/affiliates/{id}/referrals/{referralId} — referral status detail */
  getReferral: (affiliateId: string, referralId: string) =>
    api.get<ApiResponse>(`/api/v1/affiliates/${affiliateId}/referrals/${referralId}`),
};

// ─── Affiliate Payments API ───────────────────────────────────────────────────

export const affiliatePaymentsApi = {
  /** GET /api/v1/affiliates/{id}/commissions — commission payment history */
  getCommissions: (affiliateId: string) =>
    api.get<ApiResponse>(`/api/v1/affiliates/${affiliateId}/commissions`),

  /** GET /api/v1/affiliates/{id}/commissions/summary — totals and pending */
  getSummary: (affiliateId: string) =>
    api.get<ApiResponse>(`/api/v1/affiliates/${affiliateId}/commissions/summary`),
};
