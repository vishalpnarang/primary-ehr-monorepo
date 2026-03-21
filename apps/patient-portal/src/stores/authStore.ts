import { create } from 'zustand';

export interface PatientUser {
  id: string;
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
  login: (user: PatientUser) => void;
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
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
