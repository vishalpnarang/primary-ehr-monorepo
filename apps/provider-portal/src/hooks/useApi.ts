/**
 * TanStack Query hooks wrapping real backend API.
 * Each hook tries the real API first. If the backend is down or returns
 * no data, components fall back to their inline mock data gracefully.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dashboardApi, patientApi, appointmentApi, encounterApi,
  orderApi, prescriptionApi, billingApi, messagingApi,
  inboxApi, notificationApi, settingsApi,
} from '@/lib/api';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const useProviderDashboard = (providerId?: string) =>
  useQuery({
    queryKey: ['dashboard', 'provider', providerId],
    queryFn: () => dashboardApi.provider(providerId).then(r => r.data.data),
    retry: 1,
    staleTime: 30_000,
  });

export const useNurseDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'nurse'],
    queryFn: () => dashboardApi.nurse().then(r => r.data.data),
    retry: 1,
  });

export const useFrontDeskDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'frontdesk'],
    queryFn: () => dashboardApi.frontdesk().then(r => r.data.data),
    retry: 1,
  });

export const useBillingDashboard = () =>
  useQuery({
    queryKey: ['dashboard', 'billing'],
    queryFn: () => dashboardApi.billing().then(r => r.data.data),
    retry: 1,
  });

// ─── Patients ────────────────────────────────────────────────────────────────

export const usePatientList = (page = 0, size = 20) =>
  useQuery({
    queryKey: ['patients', 'list', page, size],
    queryFn: () => patientApi.list(page, size).then(r => r.data.data),
    retry: 1,
  });

export const usePatientSearch = (query: string) =>
  useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: () => patientApi.search(query).then(r => r.data.data),
    enabled: query.length >= 2,
    retry: 1,
  });

export const usePatient = (uuid: string) =>
  useQuery({
    queryKey: ['patients', uuid],
    queryFn: () => patientApi.getById(uuid).then(r => r.data.data),
    enabled: !!uuid,
    retry: 1,
  });

export const usePatientTimeline = (uuid: string) =>
  useQuery({
    queryKey: ['patients', uuid, 'timeline'],
    queryFn: () => patientApi.getTimeline(uuid).then(r => r.data.data),
    enabled: !!uuid,
    retry: 1,
  });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => patientApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
};

// ─── Appointments ────────────────────────────────────────────────────────────

export const useTodaysAppointments = () =>
  useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => appointmentApi.today().then(r => r.data.data),
    retry: 1,
    refetchInterval: 60_000, // Refresh every minute
  });

export const useAvailableSlots = (providerId: string, date: string) =>
  useQuery({
    queryKey: ['appointments', 'slots', providerId, date],
    queryFn: () => appointmentApi.availableSlots(providerId, date).then(r => r.data.data),
    enabled: !!providerId && !!date,
    retry: 1,
  });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => appointmentApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
};

export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: string }) =>
      appointmentApi.updateStatus(uuid, status).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
};

// ─── Encounters ──────────────────────────────────────────────────────────────

export const usePatientEncounters = (patientUuid: string) =>
  useQuery({
    queryKey: ['encounters', 'patient', patientUuid],
    queryFn: () => encounterApi.list(patientUuid).then(r => r.data.data),
    enabled: !!patientUuid,
    retry: 1,
  });

export const useCreateEncounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => encounterApi.create(data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  });
};

export const useSignEncounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => encounterApi.sign(uuid).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  });
};

// ─── Billing ─────────────────────────────────────────────────────────────────

export const useBillingKpi = () =>
  useQuery({
    queryKey: ['billing', 'kpi'],
    queryFn: () => billingApi.getKpi().then(r => r.data.data),
    retry: 1,
  });

export const useClaims = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['billing', 'claims', params],
    queryFn: () => billingApi.getClaims(params).then(r => r.data.data),
    retry: 1,
  });

// ─── Messaging ───────────────────────────────────────────────────────────────

export const useMessageThreads = () =>
  useQuery({
    queryKey: ['messages', 'threads'],
    queryFn: () => messagingApi.getThreads().then(r => r.data.data),
    retry: 1,
  });

export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadUuid, body }: { threadUuid: string; body: string }) =>
      messagingApi.sendMessage(threadUuid, body).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
};

// ─── Inbox ───────────────────────────────────────────────────────────────────

export const useInboxItems = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['inbox', params],
    queryFn: () => inboxApi.list(params).then(r => r.data.data),
    retry: 1,
  });

export const useInboxCounts = () =>
  useQuery({
    queryKey: ['inbox', 'counts'],
    queryFn: () => inboxApi.counts().then(r => r.data.data),
    retry: 1,
    refetchInterval: 60_000,
  });

// ─── Notifications ───────────────────────────────────────────────────────────

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationApi.unreadCount().then(r => r.data.data),
    retry: 1,
    refetchInterval: 30_000,
  });

// ─── Settings ────────────────────────────────────────────────────────────────

export const useOrganization = () =>
  useQuery({
    queryKey: ['settings', 'organization'],
    queryFn: () => settingsApi.getOrganization().then(r => r.data.data),
    retry: 1,
  });

export const useLocations = () =>
  useQuery({
    queryKey: ['settings', 'locations'],
    queryFn: () => settingsApi.getLocations().then(r => r.data.data),
    retry: 1,
  });

export const useUsers = () =>
  useQuery({
    queryKey: ['settings', 'users'],
    queryFn: () => settingsApi.getUsers().then(r => r.data.data),
    retry: 1,
  });
