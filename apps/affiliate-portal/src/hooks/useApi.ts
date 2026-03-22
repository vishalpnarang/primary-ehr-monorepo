/**
 * TanStack Query hooks for the affiliate portal.
 * Each hook tries the real backend API first.
 * Components fall back to their inline MOCK_* constants when the API is
 * unavailable — the same ?? mockData pattern used in the provider portal.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  affiliateDashboardApi,
  affiliatePatientsApi,
  affiliatePaymentsApi,
} from '@/lib/api';

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Fetch referral KPI stats for the affiliate dashboard.
 * Falls back to MOCK_STATS in DashboardPage when the backend is down.
 */
export const useAffiliateDashboard = (affiliateId: string) =>
  useQuery({
    queryKey: ['affiliate', 'dashboard', affiliateId],
    queryFn: async () => {
      const res = await affiliateDashboardApi.getStats(affiliateId);
      return res.data.data;
    },
    enabled: !!affiliateId,
    retry: 1,
    staleTime: 60_000,
  });

/**
 * Fetch recent referrals for the dashboard panel.
 * Falls back to MOCK_RECENT_REFERRALS in DashboardPage.
 */
export const useRecentReferrals = (affiliateId: string) =>
  useQuery({
    queryKey: ['affiliate', 'recent-referrals', affiliateId],
    queryFn: async () => {
      const res = await affiliateDashboardApi.getRecentReferrals(affiliateId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!affiliateId,
    retry: 1,
    staleTime: 60_000,
  });

// ─── Patients (Referred) ──────────────────────────────────────────────────────

/**
 * List all referred patients for an affiliate.
 * Falls back to MOCK_PATIENTS in PatientsPage.
 */
export const useAffiliatePatients = (affiliateId: string) =>
  useQuery({
    queryKey: ['affiliate', 'patients', affiliateId],
    queryFn: async () => {
      const res = await affiliatePatientsApi.list(affiliateId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!affiliateId,
    retry: 1,
    staleTime: 2 * 60_000,
  });

export const useSubmitReferral = (affiliateId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      affiliatePatientsApi.refer(affiliateId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['affiliate', 'patients', affiliateId] });
      void qc.invalidateQueries({ queryKey: ['affiliate', 'recent-referrals', affiliateId] });
      void qc.invalidateQueries({ queryKey: ['affiliate', 'dashboard', affiliateId] });
    },
  });
};

// ─── Payments (Commissions) ───────────────────────────────────────────────────

/**
 * Fetch commission payment history for an affiliate.
 * Falls back to mock data in PaymentsPage.
 */
export const useAffiliatePayments = (affiliateId: string) =>
  useQuery({
    queryKey: ['affiliate', 'payments', affiliateId],
    queryFn: async () => {
      const res = await affiliatePaymentsApi.getCommissions(affiliateId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!affiliateId,
    retry: 1,
    staleTime: 5 * 60_000,
  });

/**
 * Fetch commission totals summary (pending, paid YTD, next payout).
 */
export const useAffiliatePaymentSummary = (affiliateId: string) =>
  useQuery({
    queryKey: ['affiliate', 'payments', 'summary', affiliateId],
    queryFn: async () => {
      const res = await affiliatePaymentsApi.getSummary(affiliateId);
      return res.data.data;
    },
    enabled: !!affiliateId,
    retry: 1,
    staleTime: 5 * 60_000,
  });
