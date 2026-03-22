import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '@primus/ui/types';

// Mock the api module so loginWithKeycloak doesn't hit the network
vi.mock('@/lib/api', () => ({
  keycloakAuth: {
    getToken: vi.fn(),
    decodeToken: vi.fn(),
  },
}));

const mockProvider: User = {
  id: 'PRV-00001',
  email: 'dr.johnson@primaryplus.com',
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: 'provider',
  tenantId: 'TEN-00001',
};

const mockNurse: User = {
  id: 'PRV-00002',
  email: 'nurse.smith@primaryplus.com',
  firstName: 'Emily',
  lastName: 'Smith',
  role: 'nurse',
  tenantId: 'TEN-00001',
};

/** Helper to read the Zustand persisted auth state from sessionStorage */
function getPersistedAuth() {
  const raw = sessionStorage.getItem('primus-auth');
  if (!raw) return null;
  return JSON.parse(raw).state;
}

describe('authStore', () => {
  beforeEach(() => {
    // Reset store and clear sessionStorage before each test
    sessionStorage.clear();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      tenantId: null,
      loading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('has null user when no session exists', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('has isAuthenticated as false when no session exists', () => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('has null token when no session exists', () => {
      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('has loading as false initially', () => {
      const { loading } = useAuthStore.getState();
      expect(loading).toBe(false);
    });

    it('has null error initially', () => {
      const { error } = useAuthStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('loginMock', () => {
    it('sets user and isAuthenticated to true', () => {
      const { loginMock } = useAuthStore.getState();
      loginMock(mockProvider);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockProvider);
      expect(state.isAuthenticated).toBe(true);
    });

    it('persists user to sessionStorage via Zustand persist', () => {
      const { loginMock } = useAuthStore.getState();
      loginMock(mockProvider);

      const persisted = getPersistedAuth();
      expect(persisted).not.toBeNull();
      expect(persisted.user).toEqual(mockProvider);
    });

    it('sets loading to false after mock login', () => {
      const { loginMock } = useAuthStore.getState();
      loginMock(mockProvider);

      const { loading } = useAuthStore.getState();
      expect(loading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user after logout', () => {
      const { loginMock, logout } = useAuthStore.getState();
      loginMock(mockProvider);
      logout();

      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('sets isAuthenticated to false after logout', () => {
      const { loginMock, logout } = useAuthStore.getState();
      loginMock(mockProvider);
      logout();

      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('sets token to null after logout', () => {
      useAuthStore.setState({ token: 'some-jwt-token' });
      const { logout } = useAuthStore.getState();
      logout();

      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('clears user from persisted state on logout', () => {
      const { loginMock, logout } = useAuthStore.getState();
      loginMock(mockProvider);
      expect(getPersistedAuth()?.user).not.toBeNull();

      logout();
      expect(getPersistedAuth()?.user).toBeNull();
    });

    it('clears token from persisted state on logout', () => {
      useAuthStore.setState({ token: 'some-token', isAuthenticated: true });
      const { logout } = useAuthStore.getState();
      logout();

      expect(getPersistedAuth()?.token).toBeNull();
    });

    it('clears refreshToken from persisted state on logout', () => {
      useAuthStore.setState({ refreshToken: 'some-refresh-token' });
      const { logout } = useAuthStore.getState();
      logout();

      expect(getPersistedAuth()?.refreshToken).toBeNull();
    });

    it('clears tenantId from persisted state on logout', () => {
      useAuthStore.setState({ tenantId: '5' });
      const { logout } = useAuthStore.getState();
      logout();

      expect(getPersistedAuth()?.tenantId).toBeNull();
    });
  });

  describe('switchRole', () => {
    it('updates user role when logged in', () => {
      const { loginMock, switchRole } = useAuthStore.getState();
      loginMock(mockProvider);
      switchRole('nurse');

      const { user } = useAuthStore.getState();
      expect(user?.role).toBe('nurse');
    });

    it('preserves other user fields when switching role', () => {
      const { loginMock, switchRole } = useAuthStore.getState();
      loginMock(mockProvider);
      switchRole('billing');

      const { user } = useAuthStore.getState();
      expect(user?.id).toBe(mockProvider.id);
      expect(user?.email).toBe(mockProvider.email);
      expect(user?.firstName).toBe(mockProvider.firstName);
      expect(user?.lastName).toBe(mockProvider.lastName);
      expect(user?.tenantId).toBe(mockProvider.tenantId);
    });

    it('updates persisted state with new role', () => {
      const { loginMock, switchRole } = useAuthStore.getState();
      loginMock(mockProvider);
      switchRole('front_desk');

      const persisted = getPersistedAuth();
      expect(persisted.user.role).toBe('front_desk');
    });

    it('handles switchRole when no user is logged in (returns null user)', () => {
      const { switchRole } = useAuthStore.getState();
      // Should not throw
      switchRole('provider');

      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('can switch between multiple roles', () => {
      const { loginMock, switchRole } = useAuthStore.getState();
      loginMock(mockNurse);

      switchRole('provider');
      expect(useAuthStore.getState().user?.role).toBe('provider');

      switchRole('practice_admin');
      expect(useAuthStore.getState().user?.role).toBe('practice_admin');
    });
  });
});
