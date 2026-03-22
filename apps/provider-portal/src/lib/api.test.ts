import { describe, it, expect } from 'vitest';
import { api, ApiResponse } from './api';
import { decodeJwt } from './pkce';

// ─── api instance ─────────────────────────────────────────────────────────────

describe('api axios instance', () => {
  it('has the correct default baseURL (localhost:8080 when VITE_API_URL is not set)', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080');
  });

  it('has Content-Type application/json header', () => {
    const contentType =
      (api.defaults.headers as Record<string, unknown>)['Content-Type'] ??
      (api.defaults.headers.common as Record<string, unknown>)?.['Content-Type'];
    expect(contentType).toBe('application/json');
  });

  it('has a 30000ms timeout', () => {
    expect(api.defaults.timeout).toBe(30000);
  });

  it('has request interceptors registered', () => {
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

// ─── decodeJwt (moved from keycloakAuth to pkce.ts) ──────────────────────────

describe('decodeJwt', () => {
  const buildJwt = (payload: Record<string, unknown>): string => {
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.fakesignature`;
  };

  it('decodes sub (subject / user ID) from JWT payload', () => {
    const token = buildJwt({ sub: 'PRV-00001', email: 'dr@clinic.com' });
    const decoded = decodeJwt(token);
    expect(decoded.sub).toBe('PRV-00001');
  });

  it('decodes email from JWT payload', () => {
    const token = buildJwt({ sub: 'u1', email: 'provider@primus.com' });
    const decoded = decodeJwt(token);
    expect(decoded.email).toBe('provider@primus.com');
  });

  it('decodes given_name and family_name', () => {
    const token = buildJwt({ sub: 'u1', given_name: 'Sarah', family_name: 'Johnson' });
    const decoded = decodeJwt(token);
    expect(decoded.given_name).toBe('Sarah');
    expect(decoded.family_name).toBe('Johnson');
  });

  it('decodes realm_access.roles array', () => {
    const token = buildJwt({ sub: 'u1', realm_access: { roles: ['provider', 'admin'] } });
    const decoded = decodeJwt(token);
    const roles = (decoded.realm_access as { roles: string[] })?.roles;
    expect(roles).toContain('provider');
  });

  it('decodes tenant_id custom claim', () => {
    const token = buildJwt({ sub: 'u1', tenant_id: '5' });
    const decoded = decodeJwt(token);
    expect(decoded.tenant_id).toBe('5');
  });

  it('returns empty object for missing claims', () => {
    const token = buildJwt({ sub: 'u1' });
    const decoded = decodeJwt(token);
    expect(decoded.email).toBeUndefined();
    expect(decoded.tenant_id).toBeUndefined();
  });

  it('handles token with extra dots gracefully', () => {
    const token = buildJwt({ sub: 'u1' });
    const decoded = decodeJwt(token);
    expect(decoded.sub).toBe('u1');
  });

  it('decodes exp (expiration) as a number', () => {
    const token = buildJwt({ sub: 'u1', exp: 9999999999 });
    const decoded = decodeJwt(token);
    expect(decoded.exp).toBe(9999999999);
  });

  it('decodes iat (issued at) as a number', () => {
    const token = buildJwt({ sub: 'u1', iat: 1700000000 });
    const decoded = decodeJwt(token);
    expect(decoded.iat).toBe(1700000000);
  });

  it('decodes preferred_username', () => {
    const token = buildJwt({ sub: 'u1', preferred_username: 'emily.chen' });
    const decoded = decodeJwt(token);
    expect(decoded.preferred_username).toBe('emily.chen');
  });
});
