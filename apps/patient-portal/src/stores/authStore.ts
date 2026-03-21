import { create } from 'zustand';
import { keycloakAuth } from '@/lib/api';

export interface PatientUser {
  id: string;
  uuid?: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  insurance: {
    payer: string;
    memberId: string;
    groupNumber: string;
    planName: string;
  };
  photo?: string;
}

interface AuthState {
  user: PatientUser | null;
  isAuthenticated: boolean;
  /** Mock login — sets user directly without Keycloak (dev/demo fallback) */
  loginMock: (user: PatientUser) => void;
  /**
   * Real Keycloak login — gets JWT token, decodes it, stores token + UUID
   * in sessionStorage, then populates user from the decoded claims.
   * Throws on failure so the caller can fall back to loginMock.
   */
  loginWithKeycloak: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const MOCK_PATIENT: PatientUser = {
  id: 'PAT-00001',
  firstName: 'Robert',
  lastName: 'Johnson',
  email: 'robert.johnson@email.com',
  dateOfBirth: '1968-04-12',
  gender: 'Male',
  phone: '(614) 555-0182',
  address: {
    street: '4821 Maple Grove Drive',
    city: 'Columbus',
    state: 'OH',
    zip: '43215',
  },
  insurance: {
    payer: 'Anthem Blue Cross Blue Shield',
    memberId: 'ANT-88201045',
    groupNumber: 'GRP-774312',
    planName: 'BlueCare Plus PPO',
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  loginMock: (user) => set({ user, isAuthenticated: true }),

  loginWithKeycloak: async (email, password) => {
    const tokenResponse = await keycloakAuth.getToken(email, password);
    const claims = keycloakAuth.decodeToken(tokenResponse.access_token);

    // Persist token and patient UUID for API interceptor and hooks
    sessionStorage.setItem('primus-patient-token', tokenResponse.access_token);
    const uuid = (claims['sub'] as string | undefined) ?? '';
    sessionStorage.setItem('primus-patient-uuid', uuid);

    const user: PatientUser = {
      id: uuid,
      uuid,
      firstName: (claims['given_name'] as string | undefined) ?? '',
      lastName: (claims['family_name'] as string | undefined) ?? '',
      email: (claims['email'] as string | undefined) ?? email,
      dateOfBirth: '',
      gender: '',
      phone: '',
      address: { street: '', city: '', state: '', zip: '' },
      insurance: { payer: '', memberId: '', groupNumber: '', planName: '' },
    };

    set({ user, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem('primus-patient-token');
    sessionStorage.removeItem('primus-patient-uuid');
    set({ user: null, isAuthenticated: false });
  },
}));

// Keep legacy `login` alias so any existing callers continue to compile
export const { loginMock: login } = useAuthStore.getState();
