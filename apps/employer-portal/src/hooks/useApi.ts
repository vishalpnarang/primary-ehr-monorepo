/**
 * TanStack Query hooks for the employer portal.
 * Each hook tries the real backend API first.
 * Components fall back to their inline MOCK_* constants when the API is
 * unavailable — the same ?? mockData pattern used in the provider portal.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  employerDashboardApi,
  employeesApi,
  employerInvoicesApi,
  employerPlansApi,
} from '@/lib/api';

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Fetch employer KPI summary.
 * Falls back to MOCK_KPIS in DashboardPage when the backend is down.
 */
export const useEmployerDashboard = (employerId: string) =>
  useQuery({
    queryKey: ['employer', 'dashboard', employerId],
    queryFn: async () => {
      const res = await employerDashboardApi.getKpi(employerId);
      return res.data.data;
    },
    enabled: !!employerId,
    retry: 1,
    staleTime: 60_000,
  });

/**
 * Fetch employer activity feed.
 * Falls back to MOCK_ACTIVITIES in DashboardPage.
 */
export const useEmployerActivity = (employerId: string) =>
  useQuery({
    queryKey: ['employer', 'activity', employerId],
    queryFn: async () => {
      const res = await employerDashboardApi.getActivity(employerId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!employerId,
    retry: 1,
    staleTime: 60_000,
  });

// ─── Employees ────────────────────────────────────────────────────────────────

/**
 * List all employees for an employer.
 * Falls back to MOCK_EMPLOYEES in EmployeesPage.
 */
export const useEmployees = (employerId: string) =>
  useQuery({
    queryKey: ['employer', 'employees', employerId],
    queryFn: async () => {
      const res = await employeesApi.list(employerId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!employerId,
    retry: 1,
    staleTime: 2 * 60_000,
  });

export const useAddEmployee = (employerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      employeesApi.add(employerId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['employer', 'employees', employerId] });
      void qc.invalidateQueries({ queryKey: ['employer', 'dashboard', employerId] });
    },
  });
};

export const useTerminateEmployee = (employerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (empId: string) => employeesApi.terminate(employerId, empId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['employer', 'employees', employerId] });
    },
  });
};

// ─── Invoices ─────────────────────────────────────────────────────────────────

/**
 * List all invoices for an employer.
 * Falls back to MOCK_INVOICES in InvoicesPage.
 */
export const useEmployerInvoices = (employerId: string) =>
  useQuery({
    queryKey: ['employer', 'invoices', employerId],
    queryFn: async () => {
      const res = await employerInvoicesApi.list(employerId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!employerId,
    retry: 1,
    staleTime: 2 * 60_000,
  });

export const usePayEmployerInvoice = (employerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: Record<string, unknown> }) =>
      employerInvoicesApi.pay(invoiceId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['employer', 'invoices', employerId] });
      void qc.invalidateQueries({ queryKey: ['employer', 'dashboard', employerId] });
    },
  });
};

// ─── Plans ────────────────────────────────────────────────────────────────────

/**
 * List available membership plans.
 * Used in MembershipsPage plan picker.
 */
export const useEmployerPlans = (employerId: string) =>
  useQuery({
    queryKey: ['employer', 'plans', employerId],
    queryFn: async () => {
      const res = await employerPlansApi.getByEmployer(employerId);
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    enabled: !!employerId,
    retry: 1,
    staleTime: 5 * 60_000,
  });

export const useAllPlans = () =>
  useQuery({
    queryKey: ['plans', 'all'],
    queryFn: async () => {
      const res = await employerPlansApi.getAll();
      const data = res.data.data;
      return Array.isArray(data) ? data : [];
    },
    retry: 1,
    staleTime: 10 * 60_000,
  });

export const useEnrollInPlan = (employerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => employerPlansApi.enroll(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['employer', 'plans', employerId] });
      void qc.invalidateQueries({ queryKey: ['employer', 'employees', employerId] });
    },
  });
};
