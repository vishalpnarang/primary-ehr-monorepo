import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { keycloakAuth } from '@/lib/api';
import type { User, UserRole } from '@primus/ui/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
  loginWithKeycloak: (email: string, password: string) => Promise<void>;
  loginMock: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      tenantId: null,
      loading: false,
      error: null,

      loginWithKeycloak: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const tokenResponse = await keycloakAuth.getToken(email, password);
          const decoded = keycloakAuth.decodeToken(tokenResponse.access_token);

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

          // Extract tenant ID from JWT claim; fall back to '5' (seeded Primus Think tenant)
          const tenantId = decoded.tenant_id != null ? String(decoded.tenant_id) : '5';

          set({
            user,
            isAuthenticated: true,
            token: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            tenantId,
            loading: false,
          });
        } catch {
          set({ error: 'Invalid email or password', loading: false });
        }
      },

      // Keep mock login for fallback when Keycloak isn't running
      // Tenant ID '5' matches the auto-incremented PK from the seed data
      loginMock: (user: User) => {
        set({ user, isAuthenticated: true, tenantId: '5', loading: false });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          tenantId: null,
        });
      },

      switchRole: (role) =>
        set((state) => {
          const updated = state.user ? { ...state.user, role } : null;
          return { user: updated };
        }),
    }),
    {
      name: 'primus-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
        tenantId: state.tenantId,
      }),
    }
  )
);
