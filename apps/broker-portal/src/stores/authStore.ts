import { create } from 'zustand';

export interface BrokerUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  agencyName: string;
  agencyId: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  phone: string;
  npn: string;
}

interface AuthState {
  user: BrokerUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const MOCK_BROKER_USER: BrokerUser = {
  id: 'BRK-USR-001',
  firstName: 'Raymond',
  lastName: 'Castellano',
  email: 'rcastellano@apexbenefitsgroup.com',
  agencyName: 'Apex Benefits Group LLC',
  agencyId: 'BRK-00031',
  licenseNumber: 'OH-LIC-884291',
  licenseState: 'Ohio',
  licenseExpiry: '2027-06-30',
  phone: '(614) 555-0378',
  npn: '8842917',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (_email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    set({ user: MOCK_BROKER_USER, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
