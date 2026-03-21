import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi, appointmentApi, messagingApi, recordsApi, billingApi } from '@/lib/api';

/**
 * Reads the authenticated patient UUID from sessionStorage.
 * Set by authStore after Keycloak login (decoded from JWT sub claim).
 */
const getPatientUuid = (): string =>
  sessionStorage.getItem('primus-patient-uuid') ?? '';

// ─── Profile ──────────────────────────────────────────────────────────────────

export const useMyProfile = () =>
  useQuery({
    queryKey: ['patient', 'profile'],
    queryFn: async () => {
      const res = await patientApi.getMyProfile();
      return res.data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

// ─── Appointments ─────────────────────────────────────────────────────────────

export const useUpcomingAppointments = () =>
  useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const res = await appointmentApi.getUpcoming();
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    retry: false,
    staleTime: 2 * 60 * 1000,
  });

export const usePastAppointments = () =>
  useQuery({
    queryKey: ['appointments', 'past'],
    queryFn: async () => {
      const res = await appointmentApi.getPast();
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => appointmentApi.book(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => appointmentApi.cancel(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// ─── Messaging ────────────────────────────────────────────────────────────────

export const useMessageThreads = () =>
  useQuery({
    queryKey: ['messages', 'threads'],
    queryFn: async () => {
      const res = await messagingApi.getThreads();
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    retry: false,
    staleTime: 60 * 1000,
  });

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadUuid, body }: { threadUuid: string; body: string }) =>
      messagingApi.sendMessage(threadUuid, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

// ─── Records ─────────────────────────────────────────────────────────────────

export const useLabResults = () =>
  useQuery({
    queryKey: ['labs'],
    queryFn: async () => {
      const uuid = getPatientUuid();
      if (!uuid) return [];
      const res = await recordsApi.getLabResults(uuid);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useMedications = () =>
  useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const uuid = getPatientUuid();
      if (!uuid) return [];
      const res = await recordsApi.getMedications(uuid);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

// ─── Billing ──────────────────────────────────────────────────────────────────

export const useBalance = () =>
  useQuery({
    queryKey: ['billing', 'balance'],
    queryFn: async () => {
      const uuid = getPatientUuid();
      if (!uuid) return null;
      const res = await billingApi.getBalance(uuid);
      return res.data.data as { balance: number; currency: string } | null;
    },
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
