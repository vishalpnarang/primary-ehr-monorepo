import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, keycloakAuth, ApiResponse } from './api';

// ─── api instance ─────────────────────────────────────────────────────────────

describe('api axios instance', () => {
  it('has the correct default baseURL (localhost:8080 when VITE_API_URL is not set)', () => {
    // import.meta.env.VITE_API_URL is undefined in test environment
    expect(api.defaults.baseURL).toBe('http://localhost:8080');
  });

  it('has Content-Type application/json header', () => {
    // Axios stores defaults as a AxiosHeaders object
    const contentType =
      (api.defaults.headers as Record<string, unknown>)['Content-Type'] ??
      (api.defaults.headers.common as Record<string, unknown>)?.['Content-Type'];
    expect(contentType).toBe('application/json');
  });

  it('has a 30000ms timeout', () => {
    expect(api.defaults.timeout).toBe(30000);
  });

  it('has request interceptors registered', () => {
    // Axios stores interceptors in an internal handlers array
    // Access via the non-public manager — just confirm at least one is present
    const interceptorCount = (api.interceptors.request as unknown as { handlers: unknown[] }).handlers.filter(Boolean).length;
    expect(interceptorCount).toBeGreaterThan(0);
  });

  it('has response interceptors registered', () => {
    const interceptorCount = (api.interceptors.response as unknown as { handlers: unknown[] }).handlers.filter(Boolean).length;
    expect(interceptorCount).toBeGreaterThan(0);
  });
});

// ─── ApiResponse type shape ───────────────────────────────────────────────────

describe('ApiResponse interface', () => {
  it('can be constructed with all required fields', () => {
    const response: ApiResponse<{ id: string }> = {
      timestamp: '2026-03-21T12:00:00Z',
      status: 200,
      code: 'SUCCESS',
      message: 'OK',
      data: { id: 'PAT-10001' },
      errors: null,
    };

    expect(response.status).toBe(200);
    expect(response.data.id).toBe('PAT-10001');
    expect(response.errors).toBeNull();
  });

  it('can hold an errors array', () => {
    const response: ApiResponse = {
      timestamp: '2026-03-21T12:00:00Z',
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      data: null,
      errors: [{ field: 'email', message: 'Email is required' }],
    };

    expect(response.errors).toHaveLength(1);
    expect(response.errors![0].field).toBe('email');
  });
});

// ─── keycloakAuth.decodeToken ─────────────────────────────────────────────────

describe('keycloakAuth.decodeToken', () => {
  /**
   * Build a minimal JWT string with a known payload.
   * The real function does: JSON.parse(atob(token.split('.')[1]))
   * We use the real btoa to create a valid base64 payload.
   */
  const buildJwt = (payload: Record<string, unknown>): string => {
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const sig = 'fakesignature';
    return `${header}.${body}.${sig}`;
  };

  it('decodes sub (subject / user ID) from JWT payload', () => {
    const token = buildJwt({ sub: 'PRV-00001', email: 'dr@clinic.com' });
    const decoded = keycloakAuth.decodeToken(token);
    expect(decoded.sub).toBe('PRV-00001');
  });

  it('decodes email from JWT payload', () => {
    const token = buildJwt({ sub: 'u1', email: 'provider@primaryplus.com' });
    const decoded = keycloakAuth.decodeToken(token);
    expect(decoded.email).toBe('provider@primaryplus.com');
  });

  it('decodes given_name and family_name', () => {
    const token = buildJwt({ sub: 'u1', given_name: 'Sarah', family_name: 'Johnson' });
    const decoded = keycloakAuth.decodeToken(token);
    expect(decoded.given_name).toBe('Sarah');
    expect(decoded.family_name).toBe('Johnson');
  });

  it('decodes realm_access.roles array', () => {
    const token = buildJwt({
      sub: 'u1',
      realm_access: { roles: ['provider', 'offline_access', 'uma_authorization'] },
    });
    const decoded = keycloakAuth.decodeToken(token);
    expect(decoded.realm_access.roles).toContain('provider');
  });

  it('decodes tenant_id custom claim', () => {
    const token = buildJwt({ sub: 'u1', tenant_id: 'TEN-00001' });
    const decoded = keycloakAuth.decodeToken(token);
    expect(decoded.tenant_id).toBe('TEN-00001');
  });

  it('decodes numeric exp (expiry) field', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = buildJwt({ sub: 'u1', exp });
    const decoded = keycloakAuth.decodeToken(token);
    expect(decoded.exp).toBe(exp);
  });

  it('handles payload with no optional fields gracefully', () => {
    const token = buildJwt({ sub: 'minimal-user' });
    const decoded = keycloakAuth.decodeToken(token);
    expect(decoded.sub).toBe('minimal-user');
    expect(decoded.email).toBeUndefined();
    expect(decoded.realm_access).toBeUndefined();
  });

  it('throws when given an invalid JWT string', () => {
    // Malformed token — base64 decode of the payload will fail
    expect(() => keycloakAuth.decodeToken('not.a.jwt')).toThrow();
  });
});

// ─── keycloakAuth.getToken ────────────────────────────────────────────────────

describe('keycloakAuth.getToken', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('calls the Keycloak token endpoint with correct params', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 300,
        token_type: 'Bearer',
      }),
    } as Response);

    await keycloakAuth.getToken('provider@clinic.com', 'password123');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/realms/');
    expect(String(url)).toContain('openid-connect/token');
    expect((options as RequestInit).method).toBe('POST');
  });

  it('returns access_token and refresh_token on success', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'eyJ.abc.def',
        refresh_token: 'eyJ.refresh.token',
        expires_in: 300,
        token_type: 'Bearer',
      }),
    } as Response);

    const result = await keycloakAuth.getToken('user@clinic.com', 'pass');
    expect(result.access_token).toBe('eyJ.abc.def');
    expect(result.refresh_token).toBe('eyJ.refresh.token');
  });

  it('throws when Keycloak returns a non-OK response', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'invalid_credentials' }),
    } as Response);

    await expect(keycloakAuth.getToken('bad@clinic.com', 'wrong')).rejects.toThrow(
      'Authentication failed'
    );
  });
});
