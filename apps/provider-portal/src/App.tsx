import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/layouts/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { useAuthStore } from '@/stores/authStore';

// Internal pages (password-gated, outside EHR auth)
const InternalGate = lazy(() => import('@/pages/internal/InternalGate'));
const ManagementDeckPage = lazy(() => import('@/pages/internal/ManagementDeckPage'));
const ClientDeckPage = lazy(() => import('@/pages/internal/ClientDeckPage'));
const DemoGuidePage = lazy(() => import('@/pages/internal/DemoGuidePage'));

// Lazy-loaded pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const PatientsPage = lazy(() => import('@/pages/PatientsPage'));
const NewPatientPage = lazy(() => import('@/pages/NewPatientPage'));
const PatientChartPage = lazy(() => import('@/pages/PatientChartPage'));
const NewEncounterPage = lazy(() => import('@/pages/NewEncounterPage'));
const NewAppointmentPage = lazy(() => import('@/pages/NewAppointmentPage'));
const CheckInPage = lazy(() => import('@/pages/CheckInPage'));
const RoomingPage = lazy(() => import('@/pages/RoomingPage'));
const InboxPage = lazy(() => import('@/pages/InboxPage'));
const BillingPage = lazy(() => import('@/pages/BillingPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const TenantProvisioningPage = lazy(() => import('@/pages/TenantProvisioningPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: false },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Wrap each lazy page individually so AppShell (sidebar) stays mounted during navigation
const S = (C: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <C />
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={S(DashboardPage)} />
          <Route path="/schedule" element={S(SchedulePage)} />
          <Route path="/schedule/new" element={S(NewAppointmentPage)} />
          <Route path="/patients" element={S(PatientsPage)} />
          <Route path="/patients/new" element={S(NewPatientPage)} />
          <Route path="/patients/:patientId" element={S(PatientChartPage)} />
          <Route path="/patients/:patientId/:section" element={S(PatientChartPage)} />
          <Route path="/patients/:patientId/encounters/new" element={S(NewEncounterPage)} />
          <Route path="/patients/:patientId/encounters/:encounterId" element={S(NewEncounterPage)} />
          <Route path="/patients/:patientId/checkin" element={S(CheckInPage)} />
          <Route path="/patients/:patientId/rooming" element={S(RoomingPage)} />
          <Route path="/inbox" element={S(InboxPage)} />
          <Route path="/billing" element={S(BillingPage)} />
          <Route path="/billing/:section" element={S(BillingPage)} />
          <Route path="/reports" element={S(ReportsPage)} />
          <Route path="/reports/:section" element={S(ReportsPage)} />
          <Route path="/settings" element={S(SettingsPage)} />
          <Route path="/settings/:section" element={S(SettingsPage)} />
          <Route path="/settings/tenants/new" element={S(TenantProvisioningPage)} />
        </Route>
        {/* Internal routes — password-gated, no EHR auth required */}
        <Route
          element={
            <Suspense fallback={<PageLoader />}>
              <InternalGate />
            </Suspense>
          }
        >
          <Route path="/internal/management" element={S(ManagementDeckPage)} />
          <Route path="/internal/client" element={S(ClientDeckPage)} />
          <Route path="/internal/demo-guide" element={S(DemoGuidePage)} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
