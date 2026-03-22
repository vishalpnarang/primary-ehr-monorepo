import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { exchangeCodeForTokens, validateState, decodeJwt } from '@/lib/pkce';
import type { UserRole } from '@primus/ui/types';

/**
 * OAuth2 PKCE callback handler.
 *
 * Keycloak redirects here after successful authentication with:
 *   /auth/callback?code={authorization_code}&state={state}
 *
 * This page exchanges the code for tokens, sets up the auth store,
 * and redirects to the dashboard.
 */
export const AuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthFromPkce } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`Authentication failed: ${searchParams.get('error_description') || errorParam}`);
        return;
      }

      if (!code || !state) {
        setError('Missing authorization code or state parameter');
        return;
      }

      // Validate state to prevent CSRF
      if (!validateState(state)) {
        setError('Invalid state parameter — possible CSRF attack');
        return;
      }

      try {
        const tokenResponse = await exchangeCodeForTokens(code);
        const decoded = decodeJwt(tokenResponse.access_token);

        const realmRoles = (decoded.realm_access as { roles?: string[] })?.roles || [];
        const appRoles: UserRole[] = [
          'super_admin', 'tenant_admin', 'practice_admin',
          'provider', 'nurse', 'front_desk', 'billing', 'patient',
        ];
        const role = (appRoles.find(r => realmRoles.includes(r)) || 'provider') as UserRole;

        const tenantId = decoded.tenant_id != null
          ? String(decoded.tenant_id)
          : undefined;

        setAuthFromPkce({
          id: decoded.sub as string,
          email: (decoded.email as string) || '',
          firstName: (decoded.given_name as string) || '',
          lastName: (decoded.family_name as string) || '',
          role,
          tenantId: tenantId || 'TEN-00001',
        }, tokenResponse.access_token, tokenResponse.refresh_token, tenantId);

        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Token exchange failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuthFromPkce]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
