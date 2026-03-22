/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth2 Authorization Code flow.
 *
 * This replaces the insecure ROPC (Resource Owner Password) flow.
 * PKCE ensures that even if the authorization code is intercepted,
 * it cannot be exchanged for tokens without the original code_verifier.
 */

const KC_BASE = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const KC_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'primus';
const KC_CLIENT = import.meta.env.VITE_KEYCLOAK_CLIENT || 'primus-frontend';
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

/** Generate a cryptographically random code_verifier (43-128 chars, base64url). */
function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/** SHA-256 hash the code_verifier to create the code_challenge. */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Initiates the PKCE Authorization Code flow by redirecting to Keycloak.
 * Stores the code_verifier and state in sessionStorage for the callback.
 */
export async function startPkceLogin(): Promise<void> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Store for the callback handler
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('pkce_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KC_CLIENT,
    redirect_uri: REDIRECT_URI,
    scope: 'openid profile email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  window.location.href =
    `${KC_BASE}/realms/${KC_REALM}/protocol/openid-connect/auth?${params}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  id_token: string;
  scope: string;
}

/**
 * Exchanges the authorization code for tokens using the code_verifier.
 * Called from the /auth/callback route after Keycloak redirects back.
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  if (!codeVerifier) {
    throw new Error('Missing code_verifier — PKCE flow was not initiated properly');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KC_CLIENT,
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch(
    `${KC_BASE}/realms/${KC_REALM}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    }
  );

  // Clean up PKCE state
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('pkce_state');

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Refreshes the access token using the refresh token.
 * Implements refresh token rotation — each refresh returns a new refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: KC_CLIENT,
    refresh_token: refreshToken,
  });

  const response = await fetch(
    `${KC_BASE}/realms/${KC_REALM}/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    }
  );

  if (!response.ok) {
    throw new Error('Token refresh failed — session expired');
  }

  return response.json();
}

/**
 * Validates the state parameter returned by Keycloak matches what we sent.
 * Prevents CSRF attacks on the OAuth2 callback.
 */
export function validateState(returnedState: string): boolean {
  const storedState = sessionStorage.getItem('pkce_state');
  return storedState === returnedState;
}

/**
 * Decodes a JWT token payload (without verification — client-side only).
 * Verification happens on the backend via Keycloak's JWK endpoint.
 */
export function decodeJwt(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

/**
 * Initiates Keycloak logout, then redirects to the app's login page.
 */
export function keycloakLogout(): void {
  const params = new URLSearchParams({
    client_id: KC_CLIENT,
    post_logout_redirect_uri: `${window.location.origin}/login`,
  });

  window.location.href =
    `${KC_BASE}/realms/${KC_REALM}/protocol/openid-connect/logout?${params}`;
}
