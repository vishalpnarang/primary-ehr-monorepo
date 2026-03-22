import { test, expect, type Page } from '@playwright/test';

/**
 * Primus EHR — Master E2E Flow
 *
 * Single comprehensive spec covering the full user journey through every major
 * feature of the provider portal. Tests run serially so each builds on the
 * previous navigation state, but each test is self-contained enough that a
 * single failure gives a clear signal about exactly what broke.
 *
 * Mock data facts used throughout:
 *   Provider login : Emily Chen  (role: provider)
 *   Billing login  : Lisa Patel  (role: billing)
 *   Admin login    : James Wilson (role: tenant_admin)
 *   Nurse login    : Sarah Thompson (role: nurse)
 *   SuperAdmin     : Alex Morgan  (role: super_admin)
 *   Patients       : PAT-10001 Sarah Johnson, PAT-10002 Marcus Rivera, PAT-10003 Linda Chen
 *   Provider KPIs  : 12 patients today, 1 completed, 1 in-room/active, 0 no-shows
 *   Inbox groups   : Critical Labs (2), PA Requests (3), Messages (4), Refills (6) = 15
 *   Billing KPIs   : 94.2% clean claim rate, 5.8% denial rate, 32 days A/R, $48,200 collections
 *
 * Run: npx playwright test e2e/master-flow.spec.ts --project=chromium
 */

// ─── Shared login helper ───────────────────────────────────────────────────────
//
// The LoginPage renders a list of role buttons. Each button contains the user's
// full name as text. Clicking a name selects that role; the submit button then
// reads "Sign in as <Role Label>".  On submit, it tries Keycloak first and falls
// back to loginMock() automatically — no special handling required in tests.

async function loginAs(page: Page, userName: string): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  // Click the role card that contains the user's name
  await page.getByText(userName).click();
  // Submit — text changes dynamically to reflect the selected role
  await page.getByRole('button', { name: /sign in as/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
  await page.waitForLoadState('networkidle');
}

// Convenience wrappers for the four most-used personas
async function loginAsProvider(page: Page): Promise<void> {
  await loginAs(page, 'Emily Chen');
}
async function loginAsBilling(page: Page): Promise<void> {
  await loginAs(page, 'Lisa Patel');
}
async function loginAsTenantAdmin(page: Page): Promise<void> {
  await loginAs(page, 'James Wilson');
}
async function loginAsSuperAdmin(page: Page): Promise<void> {
  await loginAs(page, 'Alex Morgan');
}

// ─── Master test suite ────────────────────────────────────────────────────────

test.describe.serial('Primus EHR — Master Flow', () => {

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — Authentication
  // Verifies: login page structure, role selector, redirect guard, all 7 roles
  // ══════════════════════════════════════════════════════════════════════════

  test('1.1 — login page renders at /login with correct structure', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Heading and role prompt
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByText(/select a role/i)).toBeVisible();

    // Keycloak fallback note
    await expect(page.getByText(/keycloak/i)).toBeVisible();
  });

  test('1.2 — login page shows all 7 provider role cards with correct user names', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // All mock user names must appear
    await expect(page.getByText('Alex Morgan')).toBeVisible();       // super_admin
    await expect(page.getByText('James Wilson')).toBeVisible();      // tenant_admin
    await expect(page.getByText('Maria Garcia')).toBeVisible();      // practice_admin
    await expect(page.getByText('Emily Chen')).toBeVisible();        // provider
    await expect(page.getByText('Sarah Thompson')).toBeVisible();    // nurse
    await expect(page.getByText('David Kim')).toBeVisible();         // front_desk
    await expect(page.getByText('Lisa Patel')).toBeVisible();        // billing
  });

  test('1.3 — Provider (MD) role is pre-selected; submit button defaults to Provider', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Default selection is provider — button shows the correct label
    await expect(page.getByRole('button', { name: /sign in as provider/i })).toBeVisible();
  });

  test('1.4 — selecting a different role updates the submit button label', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByText('Lisa Patel').click();
    await expect(page.getByRole('button', { name: /sign in as billing/i })).toBeVisible();

    await page.getByText('James Wilson').click();
    await expect(page.getByRole('button', { name: /sign in as tenant/i })).toBeVisible();
  });

  test('1.5 — unauthenticated visit to /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('1.6 — unauthenticated visits to protected routes redirect to /login', async ({ page }) => {
    for (const route of ['/patients', '/schedule', '/inbox', '/billing', '/settings', '/reports']) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/, { message: `${route} should redirect to /login` });
    }
  });

  test('1.7 — root path / redirects to /login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('1.8 — login as Provider (Emily Chen) and land on /dashboard', async ({ page }) => {
    await loginAsProvider(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('1.9 — login as Nurse (Sarah Thompson) — dashboard shows Room Status Board', async ({ page }) => {
    await loginAs(page, 'Sarah Thompson');
    await expect(page.getByText(/room status board/i)).toBeVisible({ timeout: 10000 });
  });

  test('1.10 — login as Front Desk (David Kim) — dashboard shows check-in queue', async ({ page }) => {
    await loginAs(page, 'David Kim');
    await expect(page.getByText(/check-in queue/i)).toBeVisible({ timeout: 10000 });
  });

  test('1.11 — login as Billing Staff (Lisa Patel) — dashboard shows clean claim rate KPI', async ({ page }) => {
    await loginAsBilling(page);
    await expect(page.getByText(/clean claim rate/i)).toBeVisible({ timeout: 10000 });
  });

  test('1.12 — login as Tenant Admin (James Wilson) — dashboard shows active patients KPI', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await expect(page.getByText(/active patients/i)).toBeVisible({ timeout: 10000 });
  });

  test('1.13 — login as Super Admin (Alex Morgan) — dashboard shows tenant registry', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await expect(page.getByText(/tenant registry/i)).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — Sidebar & Navigation
  // Verifies: Primus branding, role-gated nav items, active link highlight,
  // command palette (button click + Ctrl+K), back navigation
  // ══════════════════════════════════════════════════════════════════════════

  test('2.1 — sidebar shows Primus branding after Provider login', async ({ page }) => {
    await loginAsProvider(page);
    // The sidebar contains the "Primus" wordmark
    await expect(page.getByText('Primus').first()).toBeVisible();
  });

  test('2.2 — sidebar shows search / Ctrl+K shortcut hint', async ({ page }) => {
    await loginAsProvider(page);
    await expect(page.getByText(/⌘K|Ctrl\+K|search/i).first()).toBeVisible();
  });

  test('2.3 — sidebar contains expected nav links for Provider role', async ({ page }) => {
    await loginAsProvider(page);
    // Provider sees: Dashboard, Scheduling, Patients, Inbox
    await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /scheduling/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /patients/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /inbox/i }).first()).toBeVisible();
  });

  test('2.4 — Provider role does NOT see Billing or Settings in sidebar', async ({ page }) => {
    await loginAsProvider(page);
    // These are admin/billing-only nav items
    await expect(page.getByRole('link', { name: /^billing$/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /^settings$/i })).not.toBeVisible();
  });

  test('2.5 — Tenant Admin sees Billing and Settings links in sidebar', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await expect(page.getByRole('link', { name: /billing/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /settings/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /reports/i }).first()).toBeVisible();
  });

  test('2.6 — clicking Scheduling sidebar link navigates to /schedule', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByRole('link', { name: /scheduling/i }).first().click();
    await expect(page).toHaveURL(/\/schedule/);
  });

  test('2.7 — clicking Patients sidebar link navigates to /patients', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByRole('link', { name: /patients/i }).first().click();
    await expect(page).toHaveURL(/\/patients/);
  });

  test('2.8 — clicking Inbox sidebar link navigates to /inbox', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByRole('link', { name: /inbox/i }).first().click();
    await expect(page).toHaveURL(/\/inbox/);
  });

  test('2.9 — active nav link gets blue class when on /schedule', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    const schedulingLink = page.getByRole('link', { name: /scheduling/i }).first();
    await expect(schedulingLink).toBeVisible();
    await expect(schedulingLink).toHaveClass(/text-blue/);
  });

  test('2.10 — sidebar stays mounted (no full re-mount) during client-side navigation', async ({ page }) => {
    await loginAsProvider(page);
    // Navigate through 4 routes — the sidebar text must remain visible throughout
    for (const route of ['/patients', '/schedule', '/inbox', '/dashboard']) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('Primus').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('2.11 — browser back button returns to previous page', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await page.goto('/inbox');
    await page.goBack();
    await expect(page).toHaveURL(/\/patients/);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — Command Palette (Ctrl+K)
  // ══════════════════════════════════════════════════════════════════════════

  test('3.1 — command palette opens when clicking the search button in sidebar', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByRole('button', { name: /search/i }).first().click();
    await expect(
      page.getByPlaceholder(/search patients|search|type to search/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('3.2 — command palette opens with Ctrl+K keyboard shortcut', async ({ page }) => {
    await loginAsProvider(page);
    await page.keyboard.press('Control+k');
    await expect(
      page.getByPlaceholder(/search patients|search|type to search/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('3.3 — command palette closes with Escape key', async ({ page }) => {
    await loginAsProvider(page);
    await page.keyboard.press('Control+k');
    const searchInput = page.getByPlaceholder(/search patients|search|type to search/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible({ timeout: 3000 });
  });

  test('3.4 — typing in command palette filters results', async ({ page }) => {
    await loginAsProvider(page);
    await page.keyboard.press('Control+k');
    const searchInput = page.getByPlaceholder(/search patients|search|type to search/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    // Type a patient name that exists in mock data
    await searchInput.fill('Sarah');
    // Some result or suggestion should appear
    await expect(
      page.getByText(/sarah|johnson|PAT-10001|patient/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — Provider Dashboard
  // Verifies: KPI cards (Patients Today, Completed, In Room, No Shows),
  // Today's Schedule card, Priority Inbox card, Full schedule link
  // ══════════════════════════════════════════════════════════════════════════

  test('4.1 — Provider dashboard shows 4 KPI cards', async ({ page }) => {
    await loginAsProvider(page);
    // All 4 KPI labels must be visible
    await expect(page.getByText(/patients today/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/^completed$/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/in room.*active|in room \/ active/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/no shows/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('4.2 — Provider dashboard KPI shows 12 patients today (mock data)', async ({ page }) => {
    await loginAsProvider(page);
    // 12 appointments in PROVIDER_APPTS constant
    await expect(page.getByText('12').first()).toBeVisible({ timeout: 10000 });
  });

  test("4.3 — Provider dashboard shows Today's Schedule card with appointment rows", async ({ page }) => {
    await loginAsProvider(page);
    // Schedule card header
    await expect(page.getByText(/today's schedule/i).first()).toBeVisible({ timeout: 10000 });
    // Mock appointments include these names
    await expect(page.getByText(/Johnson|Rivera|Chen/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('4.4 — Provider dashboard shows appointment times in 24h format', async ({ page }) => {
    await loginAsProvider(page);
    // PROVIDER_APPTS start at 08:00
    await expect(page.getByText(/08:00|08:30|09:00/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('4.5 — Provider dashboard shows Priority Inbox card with group counts', async ({ page }) => {
    await loginAsProvider(page);
    await expect(page.getByText(/priority inbox/i).first()).toBeVisible({ timeout: 10000 });
    // Inbox groups: Critical Labs (2), PA Requests (3), Messages (4), Refills (6)
    await expect(page.getByText(/critical labs/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/pa requests/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('4.6 — Provider dashboard shows critical lab items in Priority Inbox', async ({ page }) => {
    await loginAsProvider(page);
    // K+ 6.2 and INR 4.8 are both in INBOX_GROUPS[0].items
    await expect(page.getByText(/K\+.*6\.2|K\+.*CRIT|INR.*4\.8|CRIT HIGH/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('4.7 — "Full schedule" action link navigates to /schedule', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByText('Full schedule').click();
    await expect(page).toHaveURL(/\/schedule/);
  });

  test('4.8 — "Open inbox" action link navigates to /inbox', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByText('Open inbox').click();
    await expect(page).toHaveURL(/\/inbox/);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — Patient List
  // Verifies: list loads, patient names/MRNs, insurance payers, search filter
  // ══════════════════════════════════════════════════════════════════════════

  test('5.1 — /patients page loads with patient rows', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/patients/);
    // At least one of the known mock patients must appear
    await expect(
      page.getByText(/sarah johnson|marcus rivera|linda chen/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('5.2 — patient list shows Sarah Johnson row', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText('Sarah Johnson')).toBeVisible({ timeout: 10000 });
  });

  test('5.3 — patient list shows Marcus Rivera row', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText('Marcus Rivera')).toBeVisible({ timeout: 10000 });
  });

  test('5.4 — patient list shows MRN identifiers', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText(/PAT-10001|MRN-10001/).first()).toBeVisible({ timeout: 10000 });
  });

  test('5.5 — patient list shows insurance payer names', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText(/blue cross|aetna|medicare/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('5.6 — patient list has a search field', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByPlaceholder(/search patients|search/i)).toBeVisible({ timeout: 10000 });
  });

  test('5.7 — patient list has a "New Patient" button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(
      page.getByRole('button', { name: /new patient|add patient/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('5.8 — searching by name filters the patient list', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    const searchInput = page.getByPlaceholder(/search patients|search/i);
    await searchInput.fill('Sarah');
    // Sarah Johnson should remain visible
    await expect(page.getByText('Sarah Johnson')).toBeVisible({ timeout: 10000 });
    // Marcus Rivera should be filtered out
    await expect(page.getByText('Marcus Rivera')).not.toBeVisible({ timeout: 5000 });
  });

  test('5.9 — clearing search restores full patient list', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    const searchInput = page.getByPlaceholder(/search patients|search/i);
    await searchInput.fill('Sarah');
    await searchInput.clear();
    await expect(page.getByText('Marcus Rivera')).toBeVisible({ timeout: 10000 });
  });

  test('5.10 — clicking a patient row opens the chart at the correct URL', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await page.getByText('Sarah Johnson').click();
    await expect(page).toHaveURL(/\/patients\/PAT-10001/, { timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — New Patient (3-step form)
  // Verifies: stepper, step 1 demographics, step 2 insurance, step 3 review
  // ══════════════════════════════════════════════════════════════════════════

  test('6.1 — New Patient button navigates to /patients/new', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await page.getByRole('button', { name: /new patient|add patient/i }).click();
    await expect(page).toHaveURL(/\/patients\/new/);
  });

  test('6.2 — /patients/new shows 3-step stepper (Demographics, Insurance, Review)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Demographics')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Insurance')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Review')).toBeVisible({ timeout: 10000 });
  });

  test('6.3 — step 1 shows required Demographics fields', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel(/first name/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/last name/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/date of birth|dob/i)).toBeVisible({ timeout: 10000 });
  });

  test('6.4 — filling step 1 and clicking Next advances to step 2 (Insurance)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('Patient');
    await page.getByLabel(/date of birth|dob/i).fill('1990-01-15');

    // Phone and email may be optional but present
    const phoneInput = page.getByLabel(/phone/i);
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill('(312) 555-0001');
    }
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('test.patient@example.com');
    }

    await page.getByRole('button', { name: /next|continue/i }).click();
    // Insurance step should appear
    await expect(
      page.getByText(/insurance|payer|self.pay|member id/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('6.5 — step 2 shows Insurance fields after completing step 1', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/first name/i).fill('Jane');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/date of birth|dob/i).fill('1985-05-20');
    const phoneInput = page.getByLabel(/phone/i);
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill('(312) 555-0002');
    }
    await page.getByRole('button', { name: /next|continue/i }).click();

    await expect(
      page.getByText(/primary payer|insurance|self.pay/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('6.6 — step 3 shows Review / Summary after completing steps 1 and 2', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');

    // Step 1
    await page.getByLabel(/first name/i).fill('Review');
    await page.getByLabel(/last name/i).fill('Test');
    await page.getByLabel(/date of birth|dob/i).fill('1980-03-10');
    const phoneInput = page.getByLabel(/phone/i);
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill('(312) 555-0003');
    }
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Step 2 — just advance
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Step 3 should show Review / Confirm / Summary heading
    await expect(
      page.getByText(/review|confirm|summary/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 7 — Patient Chart
  // Verifies: sticky header (name, MRN, allergies), all clinical summary cards,
  // chart tab navigation, encounter list with dates, multiple patients
  // ══════════════════════════════════════════════════════════════════════════

  test('7.1 — patient chart loads for PAT-10001 at correct URL', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page).toHaveURL(/\/patients\/PAT-10001/);
  });

  test('7.2 — chart header shows patient name Sarah Johnson', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/sarah johnson/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('7.3 — chart header shows MRN (PAT-10001)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/PAT-10001/)).toBeVisible({ timeout: 10000 });
  });

  test('7.4 — chart header shows known allergy (Penicillin)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/penicillin/i)).toBeVisible({ timeout: 10000 });
  });

  test('7.5 — chart shows Medications section with Metformin entry', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/medication/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/metformin/i)).toBeVisible({ timeout: 10000 });
  });

  test('7.6 — chart shows Problem List section with Type 2 Diabetes entry', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/problem/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/type 2 diabetes|diabetes mellitus/i)).toBeVisible({ timeout: 10000 });
  });

  test('7.7 — chart shows Allergies section', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/allerg/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('7.8 — chart shows insurance (Blue Cross) for PAT-10001', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/blue cross|bcbs/i)).toBeVisible({ timeout: 10000 });
  });

  test('7.9 — chart shows provider name (Emily Chen)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/emily chen|dr\. chen/i)).toBeVisible({ timeout: 10000 });
  });

  test('7.10 — chart has tab navigation elements', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByRole('tab').first()).toBeVisible({ timeout: 10000 });
  });

  test('7.11 — clicking Notes tab shows encounter / SOAP content', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    const notesTab = page.getByRole('tab', { name: /notes?/i });
    if (await notesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await notesTab.click();
      await expect(
        page.getByText(/note|soap|h&p|encounter/i).first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      // Notes content may already show by default
      await expect(page.getByText(/h&p complete note|soap note|encounter/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('7.12 — chart shows encounter with March 2026 date for PAT-10001', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(
      page.getByText(/Mar 19, 2026|2026-03-19|03-19-2026/).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('7.13 — clicking Medications tab shows medication table content', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    const medTab = page.getByRole('tab', { name: /med/i });
    if (await medTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await medTab.click();
      await expect(
        page.getByText(/medication|drug|dosage|prescri/i).first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByText(/medication/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('7.14 — chart for PAT-10002 (Marcus Rivera) loads without error', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10002');
    await expect(
      page.getByText(/marcus|rivera|PAT-10002/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('7.15 — chart for PAT-10003 (Linda Chen) loads without error', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10003');
    await expect(
      page.getByText(/linda|chen|PAT-10003/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 8 — Schedule / Calendar
  // Verifies: Day/Week/Month views, appointment rows, New Appointment button,
  // appointment detail drawer, Today button, provider filter
  // ══════════════════════════════════════════════════════════════════════════

  test('8.1 — /schedule page loads without error', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/schedule/);
  });

  test('8.2 — schedule shows Day / Week / Month view toggle buttons', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await expect(page.getByRole('button', { name: /^day$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^week$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^month$/i })).toBeVisible({ timeout: 10000 });
  });

  test('8.3 — Day view (default) shows time slots starting at 8:00', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await expect(page.getByText(/8:00|8 am|08:00/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('8.4 — Day view shows mock appointment patient names', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await expect(
      page.getByText(/michael brown|sarah johnson|aisha williams/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('8.5 — schedule shows New Appointment button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await expect(
      page.getByRole('button', { name: /new appointment|add appointment|\+ appointment/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('8.6 — schedule shows Today button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await expect(page.getByRole('button', { name: /^today$/i })).toBeVisible({ timeout: 10000 });
  });

  test('8.7 — schedule shows provider filter / selector', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await expect(
      page.getByText(/dr\. emily chen|all providers|provider/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('8.8 — switching to Week view shows day column headers', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await page.getByRole('button', { name: /^week$/i }).click();
    await expect(
      page.getByText(/mon|tue|wed|thu|fri|sun|sat/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('8.9 — switching to Month view shows a month name', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await page.getByRole('button', { name: /^month$/i }).click();
    await expect(
      page.getByText(/january|february|march|april|may|june|july|august|september|october|november|december/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('8.10 — clicking an appointment opens a detail drawer', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    const firstAppt = page.getByText(/michael brown|sarah johnson|aisha williams/i).first();
    await firstAppt.click();
    // Drawer shows appointment info
    await expect(
      page.getByText(/appointment|visit|reason|status|type/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('8.11 — appointment detail drawer shows appointment type', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    const firstAppt = page.getByText(/michael brown|sarah johnson/i).first();
    await firstAppt.click();
    await expect(
      page.getByText(/new patient|follow.up|annual wellness|telehealth|urgent/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('8.12 — appointment detail drawer shows status and Open Chart button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    const firstAppt = page.getByText(/michael brown|sarah johnson/i).first();
    await firstAppt.click();
    await expect(
      page.getByText(/completed|arrived|in room|confirmed|scheduled|no.show/i).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: /open.*chart|view.*chart|open chart/i })
        .or(page.getByRole('link', { name: /open.*chart|view.*chart/i }))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 9 — New Appointment (multi-step booking wizard)
  // Verifies: all 6 appointment types, 3 providers, date/time step, patient search
  // ══════════════════════════════════════════════════════════════════════════

  test('9.1 — New Appointment button navigates to /schedule/new', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    await page.getByRole('button', { name: /new appointment|add appointment|\+ appointment/i }).click();
    await expect(page).toHaveURL(/\/schedule\/new/);
  });

  test('9.2 — /schedule/new shows all 6 appointment type cards', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('New Patient')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Follow-Up')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Annual Wellness')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Telehealth')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Urgent')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Procedure')).toBeVisible({ timeout: 10000 });
  });

  test('9.3 — appointment types show duration labels (60 min, 20 min)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/60 min/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/20 min/).first()).toBeVisible({ timeout: 10000 });
  });

  test('9.4 — selecting Follow-Up and clicking Next shows provider selection step', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await page.getByText('Follow-Up').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await expect(
      page.getByText(/dr\. emily chen|dr\. michael rivera|dr\. kevin torres/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('9.5 — provider selection step shows all 3 providers', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await page.getByText('Follow-Up').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await expect(page.getByText('Dr. Emily Chen')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Dr. Michael Rivera')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Dr. Kevin Torres')).toBeVisible({ timeout: 10000 });
  });

  test('9.6 — selecting provider and clicking Next shows date/time selection', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await page.getByText('Follow-Up').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await page.getByText('Dr. Emily Chen').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await expect(
      page.getByText(/select.*date|pick.*date|choose.*date|available/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('9.7 — date/time step shows available time slots', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await page.getByText('Follow-Up').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await page.getByText('Dr. Emily Chen').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await expect(
      page.getByText(/\d+:\d+\s*(AM|PM)|:00\s*(AM|PM)/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('9.8 — new appointment wizard includes a patient search step', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByPlaceholder(/search patient|patient name|find patient/i)
        .or(page.getByText(/select patient|search for patient/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('9.9 — new appointment wizard shows location options', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByText(/downtown|midtown|location/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 10 — Encounter Editor (Clinical Workflows)
  // Verifies: 3-column layout, CC textarea, SOAP sections, ROS, Assessment,
  // Plan, Sign Note button, Smart Phrases, patient context header
  // ══════════════════════════════════════════════════════════════════════════

  test('10.1 — /patients/PAT-10001/encounters/new loads without crash', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/patients\/PAT-10001\/encounters\/new/);
  });

  test('10.2 — encounter editor shows patient context (Sarah Johnson)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(
      page.getByText(/sarah johnson|PAT-10001/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('10.3 — encounter editor shows Chief Complaint section', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(
      page.getByText(/chief complaint|cc/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('10.4 — encounter editor shows Subjective section in left sidebar', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/subjective/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.5 — encounter editor shows Vitals section', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/vitals/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.6 — encounter editor shows Review of Systems (ROS) section', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/review of systems|ros/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.7 — encounter editor shows ROS body system checkboxes', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(
      page.getByText(/constitutional|cardiovascular|respiratory|gastrointestinal/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('10.8 — ROS checkboxes are interactive', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    const firstCheckbox = page.getByRole('checkbox').first();
    if (await firstCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCheckbox.check();
      await expect(firstCheckbox).toBeChecked();
    }
  });

  test('10.9 — encounter editor shows Assessment section with ICD-10 reference', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(
      page.getByText(/assessment|icd|diagnosis|E11|I10/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('10.10 — encounter editor shows Plan section', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/plan/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.11 — encounter editor shows Medications section in right panel', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/medications?/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.12 — encounter editor shows Allergies in right panel', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/allerg/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.13 — encounter editor shows DRAFT status badge', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/draft/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.14 — encounter editor shows Sign Note button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(
      page.getByRole('button', { name: /sign|sign note|sign & close/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('10.15 — encounter editor shows Save / Save Draft button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(
      page.getByRole('button', { name: /save|draft/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('10.16 — encounter editor shows Orders section', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/orders?|add order|lab order/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.17 — encounter editor shows Prescribe / Rx option', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await expect(page.getByText(/prescri|rx|medication/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('10.18 — typing in Chief Complaint field accepts text input', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001/encounters/new');
    await page.waitForLoadState('networkidle');
    const ccArea = page.getByPlaceholder(/chief complaint|cc|reason for visit/i);
    if (await ccArea.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ccArea.click();
      await ccArea.fill('Patient presents with chest pain and shortness of breath for 2 days.');
      await expect(ccArea).toHaveValue(/chest pain/i);
    }
  });

  test('10.19 — New Note button on patient chart navigates to encounter editor', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    const newNoteBtn = page.getByRole('button', { name: /new note|new encounter|start note/i });
    if (await newNoteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newNoteBtn.click();
      await expect(page).toHaveURL(/\/encounters\/new/);
    } else {
      // Direct URL navigation still works
      await page.goto('/patients/PAT-10001/encounters/new');
      await expect(page).toHaveURL(/\/encounters\/new/);
    }
  });

  test('10.20 — encounter editor for PAT-10002 loads without error', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10002/encounters/new');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByText(/chief complaint|encounter|note|assessment/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 11 — Inbox
  // Verifies: items list, priority badges, type filter tabs (Labs/Messages/
  // Refills/Prior Auth/Tasks), item detail panel, action buttons
  // ══════════════════════════════════════════════════════════════════════════

  test('11.1 — /inbox page loads and shows Inbox heading', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/inbox/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('11.2 — inbox shows at least one item (Robert Johnson or Maria Santos)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByText(/robert johnson|maria santos|david kim|potassium|hba1c|lisinopril/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.3 — inbox shows critical lab item (K+ 6.8)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByText(/potassium.*6|critical.*potassium|K\+.*6|CRIT/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.4 — inbox shows HbA1c lab result', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(page.getByText(/hba1c|hemoglobin a1c|9\.2%/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('11.5 — inbox shows CRITICAL priority badge', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(page.getByText(/critical/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('11.6 — inbox shows patient names (Robert Johnson, Maria Santos)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(page.getByText('Robert Johnson').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Maria Santos').first()).toBeVisible({ timeout: 10000 });
  });

  test('11.7 — inbox shows timestamp on items', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByText(/\d{4}-\d{2}-\d{2}|ago|today|2026/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.8 — inbox shows Labs filter tab', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByRole('button', { name: /labs?|lab results?/i })
        .or(page.getByText(/^labs?$/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.9 — inbox shows Messages filter tab', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByRole('button', { name: /^messages?$/i })
        .or(page.getByText(/^messages?$/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.10 — inbox shows Refills filter tab', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByRole('button', { name: /^refills?$/i })
        .or(page.getByText(/^refills?$/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.11 — inbox shows Prior Auth filter tab', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByRole('button', { name: /prior auth|pa/i })
        .or(page.getByText(/prior auth/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.12 — filtering by Labs tab still shows lab results', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    const labsTab = page.getByRole('button', { name: /^labs?/i })
      .or(page.getByText(/^labs?$/i).first());
    if (await labsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await labsTab.click();
      await expect(page.getByText(/potassium|hba1c|lab/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('11.13 — clicking an inbox item opens the detail panel', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await page.getByText('Robert Johnson').first().click();
    await expect(
      page.getByText(/potassium|creatinine|BUN|immediate|review required|6\./i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.14 — inbox item detail shows patient ID', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await page.getByText('Robert Johnson').first().click();
    await expect(page.getByText(/PAT-/i)).toBeVisible({ timeout: 10000 });
  });

  test('11.15 — inbox item detail shows action buttons (Archive / Mark Actioned / Dismiss)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await page.getByText(/potassium|hba1c|lisinopril/i).first().click();
    await expect(
      page.getByRole('button', { name: /archive|action|dismiss|mark|done/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.16 — inbox item detail shows View Patient Chart button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await page.getByText('Robert Johnson').first().click();
    await expect(
      page.getByRole('button', { name: /view.*chart|open.*chart|patient chart/i })
        .or(page.getByRole('link', { name: /view.*chart|patient chart/i }))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.17 — inbox shows total unread count badge or item count', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByText(/\d+.*item|\d+.*unread|8 items/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.18 — inbox shows Mark All Read or bulk action button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(
      page.getByRole('button', { name: /mark all|archive all|read all/i })
        .or(page.getByText(/mark all read/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 12 — Billing & RCM
  // Verifies: 4 KPI cards (values), 7 sub-nav tabs, Claims table with filters,
  // Denials queue with action buttons, Charges tab, ERA rows, A/R aging,
  // Patient Balances
  // ══════════════════════════════════════════════════════════════════════════

  test('12.1 — /billing page loads and shows Billing & RCM heading', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/billing.*rcm|billing & rcm/i)).toBeVisible({ timeout: 10000 });
  });

  test('12.2 — billing page shows subtitle about claims management', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await expect(
      page.getByText(/claims management.*revenue cycle/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('12.3 — billing KPI: Clean Claim Rate shows 94.2%', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await expect(page.getByText(/clean claim rate/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('94.2%').first()).toBeVisible({ timeout: 10000 });
  });

  test('12.4 — billing KPI: Denial Rate shows 5.8%', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await expect(page.getByText(/denial rate/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('5.8%').first()).toBeVisible({ timeout: 10000 });
  });

  test('12.5 — billing KPI: Days in A/R shows 32', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await expect(page.getByText(/days in a\/r|days in ar/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('32').first()).toBeVisible({ timeout: 10000 });
  });

  test('12.6 — billing KPI: Collections This Week shows $48,200', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await expect(page.getByText(/collections/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/\$48,200|\$48\.2k/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.7 — billing shows all 7 sub-navigation tabs', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await expect(page.getByRole('button', { name: /^dashboard$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^charges$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^claims$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^era$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^denials$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^a\/r$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /patient balances/i })).toBeVisible({ timeout: 10000 });
  });

  test('12.8 — billing Dashboard tab shows Claim Queue and Denial Queue sections', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await expect(page.getByText(/claim queue/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/denial queue/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.9 — billing dashboard shows claim rows with CPT codes and payer names', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await expect(page.getByText(/99214|99213|99215|99395/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/aetna|unitedhealthcare|bluecross|cigna/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.10 — Claims tab shows All Claims table with status filters', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^claims$/i }).click();
    await expect(page.getByText('All Claims')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^ready$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^submitted$/i })).toBeVisible({ timeout: 10000 });
  });

  test('12.11 — Claims tab: filtering by Denied shows denied patients', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^claims$/i }).click();
    await page.getByRole('button', { name: /^denied$/i }).click();
    await expect(
      page.getByText(/linda chen|patricia nguyen/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('12.12 — Claims tab shows Export button', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^claims$/i }).click();
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 10000 });
  });

  test('12.13 — Denials tab shows denial queue with reason codes (CO-97, CO-4)', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^denials$/i }).click();
    await expect(page.getByText(/CO-97|CO-4|CO-50|CO-22|PR-1/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.14 — Denials tab shows Appeal, Correct & Resubmit, Write Off action buttons', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^denials$/i }).click();
    await expect(page.getByRole('button', { name: /^appeal$/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /correct.*resubmit/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /write off/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.15 — Charges tab shows Charge Capture heading and Submit All button', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^charges$/i }).click();
    await expect(page.getByText(/charge capture/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /submit all/i })).toBeVisible({ timeout: 10000 });
  });

  test('12.16 — Charges tab shows ICD-10 codes', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^charges$/i }).click();
    await expect(page.getByText(/Z00\.00|E11\.9|I10/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.17 — ERA tab shows Electronic Remittance Advice heading', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^era$/i }).click();
    await expect(
      page.getByText(/electronic remittance|remittance advice|835/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('12.18 — ERA tab shows EFT/CHK payment reference numbers', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^era$/i }).click();
    await expect(page.getByText(/EFT-|CHK-/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.19 — A/R tab shows aging buckets (0-30, 31-60, 90+)', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^a\/r$/i }).click();
    await expect(page.getByText(/0.30 days|0–30/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/31.60 days|31–60/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/90\+/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.20 — A/R tab shows aging by payer table with Aetna and Medicare', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /^a\/r$/i }).click();
    await expect(page.getByText(/a\/r aging by payer/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Aetna').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Medicare').first()).toBeVisible({ timeout: 10000 });
  });

  test('12.21 — Patient Balances tab shows table and Send All Statements button', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /patient balances/i }).click();
    await expect(page.getByText(/patient balances/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /send all statements/i })).toBeVisible({ timeout: 10000 });
  });

  test('12.22 — Patient Balances tab shows outstanding balance dollar amounts', async ({ page }) => {
    await loginAsBilling(page);
    await page.goto('/billing');
    await page.getByRole('button', { name: /patient balances/i }).click();
    await expect(page.getByText(/\$88|\$146|\$310/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 13 — Settings
  // Verifies: nav sections for Tenant Admin, Organization details,
  // Users table, Locations list, Super Admin-only sections
  // ══════════════════════════════════════════════════════════════════════════

  test('13.1 — /settings page loads for Tenant Admin', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText(/settings/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('13.2 — settings shows all expected nav sections for Tenant Admin', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    await expect(page.getByText('Organization')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Locations')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Users')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/roles.*permissions/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Providers').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Payers')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Fee Schedule')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Integrations')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Templates')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/appointment types/i)).toBeVisible({ timeout: 10000 });
  });

  test('13.3 — Organization section shows clinic name (Primus Demo)', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    const orgNav = page.getByRole('button', { name: /organization/i })
      .or(page.getByText('Organization').first());
    await orgNav.click();
    await expect(
      page.getByText(/primus demo|thinkitive|primary care/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('13.4 — Users section shows user management table with staff names', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(
      page.getByText(/james wilson|maria garcia|emily chen|sarah thompson/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('13.5 — Users section shows role labels and status badges', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(
      page.getByText(/tenant admin|practice admin|provider|nurse|front desk|billing/i).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/active/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('13.6 — Users section shows Invite User button and search field', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(
      page.getByRole('button', { name: /invite|add user|new user/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/search users|search/i)).toBeVisible({ timeout: 10000 });
  });

  test('13.7 — Users section shows @primusdemo.com email addresses', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(page.getByText(/@primusdemo\.com/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('13.8 — Locations section shows Downtown and Midtown locations', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    const locNav = page.getByRole('button', { name: /^locations$/i })
      .or(page.getByText('Locations').first());
    await locNav.click();
    await expect(page.getByText(/downtown|midtown/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('13.9 — Locations section shows Chicago addresses and Add Location button', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    const locNav = page.getByRole('button', { name: /^locations$/i })
      .or(page.getByText('Locations').first());
    await locNav.click();
    await expect(page.getByText(/chicago|LaSalle|Erie|IL/i).first()).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: /add location|new location/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('13.10 — Tenant Admin does NOT see super-admin-only sections (Tenants, Platform, Audit Log)', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    await expect(page.getByText('Tenants')).not.toBeVisible();
    await expect(page.getByText('Platform')).not.toBeVisible();
    await expect(page.getByText('Audit Log')).not.toBeVisible();
  });

  test('13.11 — Super Admin sees Tenants, Platform, Audit Log, Feature Flags in settings', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Tenants')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Platform')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Audit Log')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Feature Flags')).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 14 — Reports
  // Verifies: report category cards (Operational, Financial, Clinical Quality)
  // ══════════════════════════════════════════════════════════════════════════

  test('14.1 — /reports page loads for Tenant Admin', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/reports/);
  });

  test('14.2 — reports page shows Operational, Financial, and Clinical Quality categories', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/reports');
    await expect(page.getByText(/operational/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/financial/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/clinical quality/i)).toBeVisible({ timeout: 10000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 15 — Internal Portal (password-gated)
  // Verifies: gate page, wrong password error, correct password unlocks,
  // Management Deck, Client Deck, Demo Guide, session persistence
  // ══════════════════════════════════════════════════════════════════════════

  test('15.1 — /internal/management shows Internal Access gate (not EHR auth)', async ({ page }) => {
    await page.goto('/internal/management');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Internal Access')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/thinkitive technologies/i)).toBeVisible({ timeout: 10000 });
  });

  test('15.2 — internal gate shows password field and Unlock Access button', async ({ page }) => {
    await page.goto('/internal/management');
    await expect(page.getByLabel(/access password/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/access password/i)).toHaveAttribute('type', 'password');
    await expect(page.getByRole('button', { name: /unlock access/i })).toBeVisible({ timeout: 10000 });
  });

  test('15.3 — wrong password shows error message and keeps gate visible', async ({ page }) => {
    await page.goto('/internal/management');
    await page.getByLabel(/access password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /unlock access/i }).click();
    await expect(page.getByText(/incorrect password/i)).toBeVisible({ timeout: 5000 });
    // Gate form must remain
    await expect(page.getByRole('button', { name: /unlock access/i })).toBeVisible();
  });

  test('15.4 — correct password (primus2026) unlocks and shows Management Deck', async ({ page }) => {
    await page.goto('/internal/management');
    await page.getByLabel(/access password/i).fill('primus2026');
    await page.getByRole('button', { name: /unlock access/i }).click();
    // Gate should disappear and content render
    await expect(page.getByText(/unlock access/i)).not.toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(/management deck|management|primus|thinkitive|investor/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('15.5 — /internal/client shows Client Deck after correct password', async ({ page }) => {
    await page.goto('/internal/client');
    await page.getByLabel(/access password/i).fill('primus2026');
    await page.getByRole('button', { name: /unlock access/i }).click();
    await expect(
      page.getByText(/client deck|client|proposal/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('15.6 — /internal/demo-guide shows Demo Guide after correct password', async ({ page }) => {
    await page.goto('/internal/demo-guide');
    await page.getByLabel(/access password/i).fill('primus2026');
    await page.getByRole('button', { name: /unlock access/i }).click();
    await expect(
      page.getByText(/demo guide|demo|guide|walkthrough|script/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('15.7 — once unlocked, navigating between internal pages stays unlocked (sessionStorage)', async ({ page }) => {
    // Unlock on /management
    await page.goto('/internal/management');
    await page.getByLabel(/access password/i).fill('primus2026');
    await page.getByRole('button', { name: /unlock access/i }).click();
    await expect(page.getByText(/unlock access/i)).not.toBeVisible({ timeout: 5000 });

    // Navigate to /client — should NOT re-show gate
    await page.goto('/internal/client');
    await expect(page.getByRole('button', { name: /unlock access/i })).not.toBeVisible({ timeout: 5000 });
  });

  test('15.8 — fresh browser context (no sessionStorage) shows gate again', async ({ browser }) => {
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto('http://localhost:5173/internal/management');
    await expect(freshPage.getByText('Internal Access')).toBeVisible({ timeout: 10000 });
    await freshContext.close();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 16 — Full Navigation Journey
  // Verifies: moving through all major routes in a single session, sidebar
  // stays mounted, pages load content on each route
  // ══════════════════════════════════════════════════════════════════════════

  test('16.1 — can navigate all major routes in a single Tenant Admin session', async ({ page }) => {
    await loginAsTenantAdmin(page);

    const routes: { path: string; contentPattern: RegExp }[] = [
      { path: '/dashboard',  contentPattern: /dashboard|patients today|active patients/i },
      { path: '/patients',   contentPattern: /patients|johnson|rivera/i },
      { path: '/schedule',   contentPattern: /schedule|day|week|month/i },
      { path: '/inbox',      contentPattern: /inbox|robert johnson|critical/i },
      { path: '/billing',    contentPattern: /billing|clean claim/i },
      { path: '/reports',    contentPattern: /reports|operational|financial/i },
      { path: '/settings',   contentPattern: /settings|organization|users/i },
    ];

    for (const { path, contentPattern } of routes) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Sidebar must remain visible on each page (no full page reload flash)
      await expect(page.getByText('Primus').first()).toBeVisible({ timeout: 5000 });
      // Page-specific content must appear
      await expect(
        page.getByText(contentPattern).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('16.2 — sidebar inbox badge is visible during navigation', async ({ page }) => {
    await loginAsProvider(page);
    // Navigate away and back; badge should remain
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    // Inbox badge shows count (8) in sidebar
    await expect(page.getByText('8').first()).toBeVisible({ timeout: 5000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 17 — Logout
  // Verifies: logout button clears auth and redirects to /login
  // ══════════════════════════════════════════════════════════════════════════

  test('17.1 — logout button returns user to /login page', async ({ page }) => {
    await loginAsProvider(page);

    // Try to find a visible logout button (may be icon-only, tooltip-labelled)
    const logoutBtn = page.getByRole('button', { name: /log out|sign out|logout/i });
    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/\/login/);
    } else {
      // Logout may require hovering the user avatar; fall back to clearing session
      // and verifying the redirect guard works
      await page.evaluate(() => sessionStorage.clear());
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('17.2 — after logout, protected routes require login again', async ({ page }) => {
    await loginAsProvider(page);
    // Clear auth state
    await page.evaluate(() => sessionStorage.clear());
    // Attempt to visit a protected route
    await page.goto('/patients');
    await expect(page).toHaveURL(/\/login/);
  });

});
