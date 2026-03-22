import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { startPkceLogin, refreshAccessToken, decodeJwt, keycloakLogout } from '@/lib/pkce';
import type { User, UserRole } from '@primus/ui/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  tokenExpiresAt: number | null;
  loading: boolean;
  error: string | null;

  /** Initiate PKCE Authorization Code flow (redirects to Keycloak). */
  loginWithPkce: () => Promise<void>;

  /** Called by AuthCallbackPage after Keycloak redirects back with tokens. */
  setAuthFromPkce: (
    user: User,
    accessToken: string,
    refreshToken: string,
    tenantId?: string
  ) => void;

  /** Mock login for local development without Keycloak. */
  loginMock: (user: User) => void;

  /** Logout — clears state and redirects to Keycloak logout. */
  logout: () => void;

  /** Switch active role within the same session. */
  switchRole: (role: UserRole) => void;

  /** Silently refresh the access token using the refresh token. */
  silentRefresh: () => Promise<boolean>;
}

/** Milliseconds before token expiry to trigger a refresh. */
const REFRESH_BUFFER_MS = 60_000; // 1 minute before expiry

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefresh(expiresIn: number, refreshFn: () => Promise<boolean>) {
  if (refreshTimer) clearTimeout(refreshTimer);
  const delay = Math.max((expiresIn * 1000) - REFRESH_BUFFER_MS, 10_000);
  refreshTimer = setTimeout(() => {
    refreshFn().catch(() => {
      // Refresh failed — user will be redirected on next API call
    });
  }, delay);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      tenantId: null,
      tokenExpiresAt: null,
      loading: false,
      error: null,

      loginWithPkce: async () => {
        set({ loading: true, error: null });
        await startPkceLogin(); // Redirects — won't return
      },

      setAuthFromPkce: (user, accessToken, newRefreshToken, tenantId) => {
        const decoded = decodeJwt(accessToken);
        const expiresIn = (decoded.exp as number) - Math.floor(Date.now() / 1000);

        set({
          user,
          isAuthenticated: true,
          token: accessToken,
          refreshToken: newRefreshToken,
          tenantId: tenantId || null,
          tokenExpiresAt: (decoded.exp as number) * 1000,
          loading: false,
          error: null,
        });

        // Schedule automatic token refresh
        scheduleRefresh(expiresIn, get().silentRefresh);
      },

      loginMock: (user: User) => {
        if (!import.meta.env.DEV) {
          console.warn('Mock login is disabled in production');
          return;
        }
        set({
          user,
          isAuthenticated: true,
          tenantId: '5',
          loading: false,
          tokenExpiresAt: Date.now() + 3600_000,
        });
      },

      logout: () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          tenantId: null,
          tokenExpiresAt: null,
        });
        keycloakLogout();
      },

      switchRole: (role) =>
        set((state) => {
          const updated = state.user ? { ...state.user, role } : null;
          return { user: updated };
        }),

      silentRefresh: async () => {
        const { refreshToken: currentRefreshToken } = get();
        if (!currentRefreshToken) return false;

        try {
          const tokenResponse = await refreshAccessToken(currentRefreshToken);
          const decoded = decodeJwt(tokenResponse.access_token);
          const expiresIn = (decoded.exp as number) - Math.floor(Date.now() / 1000);

          set({
            token: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token, // Rotated
            tokenExpiresAt: (decoded.exp as number) * 1000,
          });

          // Schedule the next refresh
          scheduleRefresh(expiresIn, get().silentRefresh);
          return true;
        } catch {
          // Refresh token expired — force re-login
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            refreshToken: null,
            tenantId: null,
            tokenExpiresAt: null,
            error: 'Session expired. Please log in again.',
          });
          return false;
        }
      },
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
        tokenExpiresAt: state.tokenExpiresAt,
      }),
      onRehydrate: (_state, _options) => {
        // After rehydration from sessionStorage, schedule refresh if token exists
        return (rehydratedState) => {
          if (rehydratedState?.tokenExpiresAt && rehydratedState?.refreshToken) {
            const secondsLeft = Math.floor(
              (rehydratedState.tokenExpiresAt - Date.now()) / 1000
            );
            if (secondsLeft > 0) {
              scheduleRefresh(secondsLeft, rehydratedState.silentRefresh);
            } else {
              // Token already expired — try refresh immediately
              rehydratedState.silentRefresh();
            }
          }
        };
      },
    }
  )
);
