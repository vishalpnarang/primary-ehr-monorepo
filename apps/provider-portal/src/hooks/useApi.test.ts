import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePatientList, usePatient, usePatientSearch } from './useApi';

// ─── Mock the API module ───────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  patientApi: {
    list: vi.fn(),
    getById: vi.fn(),
    search: vi.fn(),
  },
  dashboardApi: { provider: vi.fn(), nurse: vi.fn(), frontdesk: vi.fn(), billing: vi.fn() },
  appointmentApi: { today: vi.fn(), availableSlots: vi.fn(), create: vi.fn(), updateStatus: vi.fn() },
  encounterApi: { list: vi.fn(), create: vi.fn(), sign: vi.fn() },
  orderApi: {},
  prescriptionApi: {},
  billingApi: { getKpi: vi.fn(), getClaims: vi.fn() },
  messagingApi: { getThreads: vi.fn(), sendMessage: vi.fn() },
  inboxApi: { list: vi.fn(), counts: vi.fn() },
  notificationApi: { unreadCount: vi.fn() },
  settingsApi: { getOrganization: vi.fn(), getLocations: vi.fn(), getUsers: vi.fn() },
}));

// ─── Mock patient data ─────────────────────────────────────────────────────────

const mockPatients = [
  {
    id: 'PAT-10001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1981-04-12',
    gender: 'female',
    mrn: 'MRN-10001',
  },
  {
    id: 'PAT-10002',
    firstName: 'Marcus',
    lastName: 'Rivera',
    dateOfBirth: '1963-11-05',
    gender: 'male',
    mrn: 'MRN-10002',
  },
];

// ─── QueryClient wrapper ───────────────────────────────────────────────────────

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Explicitly set retry to 0 so individual hooks' retry: 1 is overridden
        // and error state appears immediately in tests.
        retry: 0,
        // Disable garbage collection delay in tests
        gcTime: 0,
      },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { wrapper, queryClient };
};

// ─── usePatientList ────────────────────────────────────────────────────────────

describe('usePatientList', () => {
  let patientApiMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const { patientApi } = await import('@/lib/api');
    patientApiMock = vi.mocked(patientApi.list);
    patientApiMock.mockReset();
  });

  it('returns isLoading true initially', () => {
    patientApiMock.mockResolvedValue({ data: { data: mockPatients } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatientList(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns patient data after successful fetch', async () => {
    patientApiMock.mockResolvedValue({ data: { data: mockPatients } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatientList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPatients);
    expect(result.current.data).toHaveLength(2);
  });

  it('calls patientApi.list with default page=0 and size=20', async () => {
    patientApiMock.mockResolvedValue({ data: { data: [] } });
    const { wrapper } = createWrapper();
    renderHook(() => usePatientList(), { wrapper });

    await waitFor(() => expect(patientApiMock).toHaveBeenCalledOnce());
    expect(patientApiMock).toHaveBeenCalledWith(0, 20);
  });

  it('calls patientApi.list with custom page and size', async () => {
    patientApiMock.mockResolvedValue({ data: { data: [] } });
    const { wrapper } = createWrapper();
    renderHook(() => usePatientList(2, 10), { wrapper });

    await waitFor(() => expect(patientApiMock).toHaveBeenCalledOnce());
    expect(patientApiMock).toHaveBeenCalledWith(2, 10);
  });

  it('returns isError true when API call fails', async () => {
    patientApiMock.mockRejectedValue(new Error('Network error'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatientList(), { wrapper });

    // Hook has retry: 1, so it tries twice before erroring. Wait long enough.
    await waitFor(
      () => expect(result.current.isError).toBe(true),
      { timeout: 10000 }
    );
    expect(result.current.data).toBeUndefined();
  });

  it('returns first patient with correct id', async () => {
    patientApiMock.mockResolvedValue({ data: { data: mockPatients } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatientList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].id).toBe('PAT-10001');
  });
});

// ─── usePatient ────────────────────────────────────────────────────────────────

describe('usePatient', () => {
  let patientGetByIdMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const { patientApi } = await import('@/lib/api');
    patientGetByIdMock = vi.mocked(patientApi.getById);
    patientGetByIdMock.mockReset();
  });

  it('is disabled when uuid is empty string', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatient(''), { wrapper });

    // enabled: false means the query never fires — status is 'pending' but fetchStatus is 'idle'
    expect(result.current.fetchStatus).toBe('idle');
    expect(patientGetByIdMock).not.toHaveBeenCalled();
  });

  it('fetches patient when uuid is provided', async () => {
    patientGetByIdMock.mockResolvedValue({ data: { data: mockPatients[0] } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatient('PAT-10001'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPatients[0]);
    expect(patientGetByIdMock).toHaveBeenCalledWith('PAT-10001');
  });
});

// ─── usePatientSearch ──────────────────────────────────────────────────────────

describe('usePatientSearch', () => {
  let patientSearchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const { patientApi } = await import('@/lib/api');
    patientSearchMock = vi.mocked(patientApi.search);
    patientSearchMock.mockReset();
  });

  it('does not fire when query is less than 2 characters', () => {
    const { wrapper } = createWrapper();
    renderHook(() => usePatientSearch('s'), { wrapper });

    expect(patientSearchMock).not.toHaveBeenCalled();
  });

  it('fires when query is 2 or more characters', async () => {
    patientSearchMock.mockResolvedValue({ data: { data: [mockPatients[0]] } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatientSearch('sa'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patientSearchMock).toHaveBeenCalledWith('sa');
  });

  it('returns matching patients from search results', async () => {
    patientSearchMock.mockResolvedValue({ data: { data: [mockPatients[0]] } });
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatientSearch('sarah'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].firstName).toBe('Sarah');
  });
});
