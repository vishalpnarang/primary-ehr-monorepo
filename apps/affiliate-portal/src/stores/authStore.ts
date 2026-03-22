import { create } from 'zustand';

export interface AffiliateUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  organizationId: string;
  affiliateType: 'wellness_center' | 'gym' | 'clinic' | 'pharmacy' | 'other';
  phone: string;
}

interface AuthState {
  user: AffiliateUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const MOCK_AFFILIATE_USER: AffiliateUser = {
  id: 'AFF-USR-001',
  firstName: 'Danielle',
  lastName: 'Reyes',
  email: 'dreyes@greenleafwellness.com',
  organization: 'Green Leaf Wellness Center',
  organizationId: 'AFF-00018',
  affiliateType: 'wellness_center',
  phone: '(614) 555-0144',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (_email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    set({ user: MOCK_AFFILIATE_USER, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
