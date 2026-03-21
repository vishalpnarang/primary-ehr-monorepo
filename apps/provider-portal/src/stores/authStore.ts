import { create } from 'zustand';
import { keycloakAuth } from '@/lib/api';
import type { User, UserRole } from '@primus/ui/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
  loginWithKeycloak: (email: string, password: string) => Promise<void>;
  loginMock: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

// Check for existing session on load
const existingToken = sessionStorage.getItem('primus-access-token');
const existingUser = sessionStorage.getItem('primus-user');

export const useAuthStore = create<AuthState>((set) => ({
  user: existingUser ? JSON.parse(existingUser) : null,
  isAuthenticated: !!existingToken,
  token: existingToken,
  loading: false,
  error: null,

  loginWithKeycloak: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const tokenResponse = await keycloakAuth.getToken(email, password);
      const decoded = keycloakAuth.decodeToken(tokenResponse.access_token);

      // Extract role from realm_access.roles
      const realmRoles = decoded.realm_access?.roles || [];
      const appRoles: UserRole[] = ['super_admin', 'tenant_admin', 'practice_admin', 'provider', 'nurse', 'front_desk', 'billing', 'patient'];
      const role = (appRoles.find(r => realmRoles.includes(r)) || 'provider') as UserRole;

      const user: User = {
        id: decoded.sub,
        email: decoded.email || email,
        firstName: decoded.given_name || email.split('@')[0],
        lastName: decoded.family_name || '',
        role,
        tenantId: decoded.tenant_id || 'TEN-00001',
      };

      // Persist to session
      // Extract numeric tenant ID from JWT claim; fall back to '1' if not present
      // decoded.tenant_id comes from the Keycloak realm mapper "tenant_id" claim
      const tenantId = decoded.tenant_id == null ? '1' : String(decoded.tenant_id);
      sessionStorage.setItem('primus-access-token', tokenResponse.access_token);
      sessionStorage.setItem('primus-refresh-token', tokenResponse.refresh_token);
      sessionStorage.setItem('primus-user', JSON.stringify(user));
      sessionStorage.setItem('primus-tenant-id', tenantId);

      set({ user, isAuthenticated: true, token: tokenResponse.access_token, loading: false });
    } catch {
      set({ error: 'Invalid email or password', loading: false });
    }
  },

  // Keep mock login for fallback when Keycloak isn't running
  // Tenant ID '5' matches the auto-incremented PK from the seed data
  loginMock: (user: User) => {
    sessionStorage.setItem('primus-user', JSON.stringify(user));
    sessionStorage.setItem('primus-tenant-id', '5');
    set({ user, isAuthenticated: true, loading: false });
  },

  logout: () => {
    sessionStorage.removeItem('primus-access-token');
    sessionStorage.removeItem('primus-refresh-token');
    sessionStorage.removeItem('primus-user');
    sessionStorage.removeItem('primus-tenant-id');
    set({ user: null, isAuthenticated: false, token: null });
  },

  switchRole: (role) =>
    set((state) => {
      const updated = state.user ? { ...state.user, role } : null;
      if (updated) sessionStorage.setItem('primus-user', JSON.stringify(updated));
      return { user: updated };
    }),
}));
