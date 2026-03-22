/**
 * TanStack Query hooks for the broker portal.
 * Each hook tries the real backend API first.
 * Components fall back to their inline MOCK_* constants when the API is
 * unavailable — the same ?? mockData pattern used in the provider portal.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  brokerDashboardApi,
  brokerEmployersApi,
  brokerCommissionsApi,
} from '@/lib/api';

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Fetch broker KPI summary (managed employers, total enrolled, commission YTD).
 * Falls back to the computed totals in DashboardPage when the backend is down.
 */
export const useBrokerDashboard = (brokerId: string) =>
  useQuery({
    queryKey: ['broker', 'dashboard', brokerId],
    queryFn: async () => {
      const res = await brokerDashboardApi.getKpi(brokerId);
      return res.data.data;
    },
    enabled: !!brokerId,
    retry: 1,
    staleTime: 60_000,
  });

/**
 * Fetch recent event feed for the broker dashboard sidebar.
 * Falls back to MOCK_RECENT_EVENTS in DashboardPage.
 */
export const useBrokerEvents = (brokerId: string) =>
  useQuery({
    queryKey: ['broker', 'events', brokerId],
    queryFn: async () => {
      const res = await brokerDashboardApi.getEvents(brokerId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!brokerId,
    retry: 1,
    staleTime: 60_000,
  });

// ─── Employers ────────────────────────────────────────────────────────────────

/**
 * List all employer accounts managed by this broker.
 * Falls back to MOCK_EMPLOYERS / MOCK_TOP_EMPLOYERS in EmployersPage and DashboardPage.
 */
export const useBrokerEmployers = (brokerId: string) =>
  useQuery({
    queryKey: ['broker', 'employers', brokerId],
    queryFn: async () => {
      const res = await brokerEmployersApi.list(brokerId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!brokerId,
    retry: 1,
    staleTime: 2 * 60_000,
  });

export const useBrokerEmployer = (brokerId: string, employerId: string) =>
  useQuery({
    queryKey: ['broker', 'employers', brokerId, employerId],
    queryFn: async () => {
      const res = await brokerEmployersApi.getById(brokerId, employerId);
      return res.data.data;
    },
    enabled: !!brokerId && !!employerId,
    retry: 1,
    staleTime: 2 * 60_000,
  });

export const useCreateBrokerEmployer = (brokerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      brokerEmployersApi.create(brokerId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['broker', 'employers', brokerId] });
      void qc.invalidateQueries({ queryKey: ['broker', 'dashboard', brokerId] });
    },
  });
};

// ─── Commissions ──────────────────────────────────────────────────────────────

/**
 * List monthly commission records for a broker.
 * Falls back to MOCK_COMMISSIONS in CommissionsPage.
 */
export const useBrokerCommissions = (brokerId: string) =>
  useQuery({
    queryKey: ['broker', 'commissions', brokerId],
    queryFn: async () => {
      const res = await brokerCommissionsApi.list(brokerId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!brokerId,
    retry: 1,
    staleTime: 5 * 60_000,
  });

/**
 * Fetch commission YTD summary (total earned, pending, next payout date).
 */
export const useBrokerCommissionSummary = (brokerId: string) =>
  useQuery({
    queryKey: ['broker', 'commissions', 'summary', brokerId],
    queryFn: async () => {
      const res = await brokerCommissionsApi.getSummary(brokerId);
      return res.data.data;
    },
    enabled: !!brokerId,
    retry: 1,
    staleTime: 5 * 60_000,
  });
