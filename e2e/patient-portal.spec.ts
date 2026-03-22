import { test, expect, type Page } from '@playwright/test';

/**
 * Patient Portal E2E — Patient Portal (port 5174)
 *
 * Tests the full patient portal:
 * - Login page with email/password form (pre-filled: robert.johnson@email.com / password123)
 * - Home dashboard (greeting, upcoming appointment card, lab card, messages card, billing card)
 * - Appointments, Messages, Records, Billing, Profile pages
 * - Welcome page (public)
 * - Unauthenticated redirect guard
 *
 * The patient portal falls back to mock login when Keycloak is unavailable,
 * so tests just fill the pre-filled form and click Sign In.
 */

test.use({ baseURL: 'http://localhost:5174' });

// ─── Helper ───────────────────────────────────────────────────────────────────

async function loginAsPatient(page: Page) {
  await page.goto('/login');
  // Form is pre-filled with robert.johnson@email.com / password123
  // Click Sign In — falls back to mock if Keycloak is down
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(home|dashboard)/, { timeout: 15000 });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Patient Portal — Authentication', () => {

  test('should show patient portal login page at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show Primus Health branding on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Primus Health')).toBeVisible();
  });

  test('should show "Patient Portal" subtitle on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/patient portal/i)).toBeVisible();
  });

  test('should show "Welcome back" heading on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should show email input field on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should show password input field on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should pre-fill email with demo credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toHaveValue('robert.johnson@email.com');
  });

  test('should show Sign In button on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show demo note on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/demo|robert johnson|pre.filled/i)).toBeVisible();
  });

  test('should show "Register here" link on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/register here/i)).toBeVisible();
  });

  test('should show Forgot password link on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/forgot password/i)).toBeVisible();
  });

  test('should login as patient and redirect to /home', async ({ page }) => {
    await loginAsPatient(page);
    await expect(page).toHaveURL(/\/home/);
  });

  test('should redirect unauthenticated access to /home → /login', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated access to /appointments → /login', async ({ page }) => {
    await page.goto('/appointments');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated access to /records → /login', async ({ page }) => {
    await page.goto('/records');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Patient Portal — Home Dashboard', () => {

  test('should show personalized greeting on home page', async ({ page }) => {
    await loginAsPatient(page);
    await expect(
      page.getByText(/good morning|good afternoon|good evening/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show patient first name in greeting', async ({ page }) => {
    await loginAsPatient(page);
    await expect(page.getByText(/robert/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show upcoming appointment card on home page', async ({ page }) => {
    await loginAsPatient(page);
    await expect(
      page.getByText(/upcoming appointment|next appointment|appointment/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show outstanding balance card on home page', async ({ page }) => {
    await loginAsPatient(page);
    await expect(
      page.getByText(/balance|payment|outstanding|\$45/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show messages card on home page', async ({ page }) => {
    await loginAsPatient(page);
    await expect(
      page.getByText(/messages?/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Schedule Appointment quick action on home page', async ({ page }) => {
    await loginAsPatient(page);
    await expect(
      page.getByRole('button', { name: /schedule.*appointment|book.*appointment/i })
        .or(page.getByText(/schedule.*appointment/i).first())
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Patient Portal — Navigation Pages', () => {

  test('should load /appointments page after login', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/appointments');
    await expect(page).toHaveURL(/\/appointments/);
  });

  test('should show Appointments heading on appointments page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/appointments');
    await expect(page.getByText(/appointments/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show upcoming or past appointment tabs on appointments page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/appointments');
    await expect(
      page.getByText(/upcoming|past|all appointments|scheduled/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Book Appointment button on appointments page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/appointments');
    await expect(
      page.getByRole('button', { name: /book.*appointment|new appointment|schedule/i })
        .or(page.getByRole('link', { name: /book.*appointment|new appointment/i }))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should load /messages page after login', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/messages');
    await expect(page).toHaveURL(/\/messages/);
  });

  test('should show Messages heading on messages page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/messages');
    await expect(page.getByText(/messages?/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show message threads or inbox items or empty state on messages page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/messages');
    await expect(
      page.getByText(/thread|message|inbox|no messages|compose/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show New Message or Compose button on messages page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/messages');
    await expect(
      page.getByRole('button', { name: /new message|compose|send message/i })
        .or(page.getByText(/new message|compose/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should load /records page after login', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/records');
    await expect(page).toHaveURL(/\/records/);
  });

  test('should show Records or Health Records heading', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/records');
    await expect(page.getByText(/records|health records/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Visits, Labs, Medications, Immunizations tabs on records page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/records');
    await expect(page.getByText(/visit/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/lab/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/medication/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should load /billing page after login', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/billing');
    await expect(page).toHaveURL(/\/billing/);
  });

  test('should show Billing heading on patient billing page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/billing');
    await expect(page.getByText(/billing/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show outstanding balance amount on patient billing page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/billing');
    await expect(
      page.getByText(/balance|outstanding|statement|\$|payment/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Make Payment or Pay Now button on billing page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/billing');
    await expect(
      page.getByRole('button', { name: /pay now|make payment|pay balance|pay/i })
        .or(page.getByRole('link', { name: /pay now|make payment/i }))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should load /profile page after login', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
  });

  test('should show Profile heading on profile page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/profile');
    await expect(page.getByText(/profile|personal|my info/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show patient personal information on profile page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/profile');
    await expect(
      page.getByText(/robert johnson|name|phone|email|address|contact/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show insurance tab or section on profile page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/profile');
    await expect(
      page.getByText(/insurance/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Patient Portal — Public Pages', () => {

  test('/welcome page is publicly accessible without login', async ({ page }) => {
    await page.goto('/welcome');
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show welcome/landing content on /welcome page', async ({ page }) => {
    await page.goto('/welcome');
    await expect(
      page.getByText(/primus|welcome|get started|patient portal|health/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('/register page is publicly accessible', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('root / redirects to /welcome when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome/);
  });
});

test.describe('Patient Portal — Bottom Navigation', () => {

  test('should show bottom navigation bar after login', async ({ page }) => {
    await loginAsPatient(page);
    // Patient portal uses a bottom nav layout
    await expect(
      page.getByRole('navigation').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to appointments via bottom nav', async ({ page }) => {
    await loginAsPatient(page);
    await page.getByRole('link', { name: /appointments?/i }).first().click();
    await expect(page).toHaveURL(/\/appointments/);
  });

  test('should navigate to messages via bottom nav', async ({ page }) => {
    await loginAsPatient(page);
    await page.getByRole('link', { name: /messages?/i }).first().click();
    await expect(page).toHaveURL(/\/messages/);
  });

  test('should navigate to records via bottom nav', async ({ page }) => {
    await loginAsPatient(page);
    await page.getByRole('link', { name: /records?/i }).first().click();
    await expect(page).toHaveURL(/\/records/);
  });
});
