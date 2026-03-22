import { create } from 'zustand';

export interface EmployerUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'hr_manager' | 'viewer';
  company: string;
  companyId: string;
  phone: string;
}

interface AuthState {
  user: EmployerUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const MOCK_EMPLOYER_USER: EmployerUser = {
  id: 'EMP-USR-001',
  firstName: 'Patricia',
  lastName: 'Harrington',
  email: 'pharrington@meridiantech.com',
  role: 'admin',
  company: 'Meridian Technology Solutions',
  companyId: 'EMP-00042',
  phone: '(614) 555-0291',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (_email: string, _password: string) => {
    // Mock login — always succeeds in demo
    await new Promise((r) => setTimeout(r, 800));
    set({ user: MOCK_EMPLOYER_USER, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
