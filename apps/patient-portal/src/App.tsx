import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import PatientLayout from '@/layouts/PatientLayout';
import LoginPage from '@/pages/LoginPage';

// Lazy-loaded pages
const WelcomePage = lazy(() => import('@/pages/WelcomePage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const AppointmentsPage = lazy(() => import('@/pages/AppointmentsPage'));
const AppointmentDetailPage = lazy(() => import('@/pages/AppointmentDetailPage'));
const NewAppointmentPage = lazy(() => import('@/pages/NewAppointmentPage'));
const TelehealthPage = lazy(() => import('@/pages/TelehealthPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const RecordsPage = lazy(() => import('@/pages/RecordsPage'));
const VisitDetailPage = lazy(() => import('@/pages/VisitDetailPage'));
const LabDetailPage = lazy(() => import('@/pages/LabDetailPage'));
const BillingPage = lazy(() => import('@/pages/BillingPage'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const IntakeFormPage = lazy(() => import('@/pages/IntakeFormPage'));

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/intake/:formToken" element={<IntakeFormPage />} />

          {/* Protected routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<HomePage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/appointments/new" element={<NewAppointmentPage />} />
            <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
            <Route path="/appointments/:id/join" element={<TelehealthPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:threadId" element={<MessagesPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/records/visits" element={<RecordsPage />} />
            <Route path="/records/visits/:id" element={<VisitDetailPage />} />
            <Route path="/records/labs" element={<RecordsPage />} />
            <Route path="/records/labs/:id" element={<LabDetailPage />} />
            <Route path="/records/medications" element={<RecordsPage />} />
            <Route path="/records/immunizations" element={<RecordsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/billing/pay" element={<PaymentPage />} />
            <Route path="/billing/:statementId" element={<BillingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/insurance" element={<ProfilePage />} />
            <Route path="/profile/notifications" element={<ProfilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
