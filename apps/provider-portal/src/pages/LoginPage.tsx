import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoginLayout } from '@/layouts/LoginLayout';
import type { User, UserRole } from '@primus/ui/types';

const mockUsers: Record<UserRole, User> = {
  super_admin: { id: 'USR-00001', email: 'alex.morgan@thinkitive.com', firstName: 'Alex', lastName: 'Morgan', role: 'super_admin', tenantId: 'TEN-00001', title: 'Platform Admin' },
  tenant_admin: { id: 'USR-00002', email: 'james.wilson@primusdemo.com', firstName: 'James', lastName: 'Wilson', role: 'tenant_admin', tenantId: 'TEN-00001', title: 'Clinic Owner' },
  practice_admin: { id: 'USR-00003', email: 'maria.garcia@primusdemo.com', firstName: 'Maria', lastName: 'Garcia', role: 'practice_admin', tenantId: 'TEN-00001', title: 'Office Manager' },
  provider: { id: 'USR-00004', email: 'emily.chen@primusdemo.com', firstName: 'Emily', lastName: 'Chen', role: 'provider', tenantId: 'TEN-00001', title: 'MD', specialty: 'Internal Medicine', npi: '1234567890', providerId: 'PRV-00001' },
  nurse: { id: 'USR-00005', email: 'sarah.thompson@primusdemo.com', firstName: 'Sarah', lastName: 'Thompson', role: 'nurse', tenantId: 'TEN-00001', title: 'RN' },
  front_desk: { id: 'USR-00006', email: 'david.kim@primusdemo.com', firstName: 'David', lastName: 'Kim', role: 'front_desk', tenantId: 'TEN-00001', title: 'Front Desk' },
  billing: { id: 'USR-00007', email: 'lisa.patel@primusdemo.com', firstName: 'Lisa', lastName: 'Patel', role: 'billing', tenantId: 'TEN-00001', title: 'Billing Specialist' },
  patient: { id: 'USR-00008', email: 'robert.johnson@email.com', firstName: 'Robert', lastName: 'Johnson', role: 'patient', tenantId: 'TEN-00001' },
};

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  tenant_admin: 'Tenant Admin',
  practice_admin: 'Practice Admin',
  provider: 'Provider (MD)',
  nurse: 'Nurse / MA',
  front_desk: 'Front Desk',
  billing: 'Billing Staff',
  patient: 'Patient',
};

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-slate-100 text-slate-600 border-slate-200',
  tenant_admin: 'bg-slate-100 text-slate-600 border-slate-200',
  practice_admin: 'bg-slate-100 text-slate-600 border-slate-200',
  provider: 'bg-blue-50 text-blue-700 border-blue-200',
  nurse: 'bg-slate-100 text-slate-600 border-slate-200',
  front_desk: 'bg-slate-100 text-slate-600 border-slate-200',
  billing: 'bg-slate-100 text-slate-600 border-slate-200',
  patient: 'bg-slate-100 text-slate-600 border-slate-200',
};

const providerRoles: UserRole[] = ['super_admin', 'tenant_admin', 'practice_admin', 'provider', 'nurse', 'front_desk', 'billing'];

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('provider');
  const navigate = useNavigate();
  const { loginWithPkce, loginMock, loading, error } = useAuthStore();

  const handleLogin = async () => {
    if (import.meta.env.DEV) {
      // In development, use mock login for convenience
      const user = mockUsers[selectedRole];
      loginMock(user);
      navigate('/dashboard');
    } else {
      // In production, redirect to Keycloak PKCE flow
      await loginWithPkce();
      // Browser will redirect — this code won't execute
    }
  };

  return (
    <LoginLayout>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h2>
      <p className="text-sm text-gray-500 mb-6">Select a role to simulate login</p>

      <div className="space-y-2 mb-6">
        {providerRoles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left ${
              selectedRole === role
                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-100'
                : 'border-slate-200 hover:border-gray-300 hover:bg-slate-50'
            }`}
          >
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${roleColors[role]}`}>
              {roleLabels[role].split(' ')[0]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {mockUsers[role].firstName} {mockUsers[role].lastName}
              </p>
              <p className="text-xs text-gray-500">{roleLabels[role]}</p>
            </div>
            {selectedRole === role && (
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</p>
      ) : null}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? 'Signing in...' : `Sign in as ${roleLabels[selectedRole]}`}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4">
        {import.meta.env.DEV
          ? 'Development mode — mock login (PKCE in production)'
          : 'Redirects to Keycloak for secure PKCE authentication'}
      </p>
    </LoginLayout>
  );
};
