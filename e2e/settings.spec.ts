import { test, expect, type Page } from '@playwright/test';

/**
 * Settings E2E — Provider Portal (port 5173)
 *
 * Tests the SettingsPage for Tenant Admin role (James Wilson).
 * Sections visible to tenant_admin: Organization, Locations, Users,
 * Roles & Permissions, Providers, Payers, Fee Schedule, Integrations,
 * Templates, Appointment Types.
 *
 * Mock data:
 *   Users: James Wilson, Maria Garcia, Emily Chen, Sarah Thompson, etc.
 *   Locations: 2 clinic locations (Downtown, Midtown East)
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

async function loginAsTenantAdmin(page: Page) {
  await page.goto('/login');
  await page.getByText('James Wilson').click();
  await page.getByRole('button', { name: /sign in as/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

async function goToSettings(page: Page) {
  await loginAsTenantAdmin(page);
  await page.goto('/settings');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Provider Portal — Settings', () => {

  // ── Page Load ─────────────────────────────────────────────────────────────

  test('should load /settings page without error (Tenant Admin)', async ({ page }) => {
    await goToSettings(page);
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should show Settings heading on settings page', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText(/settings/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Settings Navigation ───────────────────────────────────────────────────

  test('should show Organization nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText('Organization')).toBeVisible({ timeout: 10000 });
  });

  test('should show Locations nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText('Locations')).toBeVisible({ timeout: 10000 });
  });

  test('should show Users nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText('Users')).toBeVisible({ timeout: 10000 });
  });

  test('should show Roles & Permissions nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText(/roles.*permissions/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show Providers nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText('Providers').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Payers nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText('Payers')).toBeVisible({ timeout: 10000 });
  });

  test('should show Fee Schedule nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText('Fee Schedule')).toBeVisible({ timeout: 10000 });
  });

  test('should show Integrations nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText('Integrations')).toBeVisible({ timeout: 10000 });
  });

  test('should show Templates nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText('Templates')).toBeVisible({ timeout: 10000 });
  });

  test('should show Appointment Types nav item in settings', async ({ page }) => {
    await goToSettings(page);
    await expect(page.getByText(/appointment types/i)).toBeVisible({ timeout: 10000 });
  });

  // ── Organization Section ──────────────────────────────────────────────────

  test('should show organization details when clicking Organization nav', async ({ page }) => {
    await goToSettings(page);
    const orgNav = page.getByRole('button', { name: /organization/i })
      .or(page.getByText('Organization').first());
    await orgNav.click();
    await expect(
      page.getByText(/organization|clinic name|practice name|npi|tax id|primus demo/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show clinic name in organization section', async ({ page }) => {
    await goToSettings(page);
    // Organization section should show the demo clinic name
    await expect(
      page.getByText(/primus demo|thinkitive|primary care/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Users Section ─────────────────────────────────────────────────────────

  test('should show user management table when clicking Users nav', async ({ page }) => {
    await goToSettings(page);
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(
      page.getByText(/james wilson|maria garcia|emily chen|sarah thompson/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show user roles in user management table', async ({ page }) => {
    await goToSettings(page);
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(
      page.getByText(/tenant admin|practice admin|provider|nurse|front desk|billing/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show user status badges (active/inactive/pending) in user table', async ({ page }) => {
    await goToSettings(page);
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(page.getByText(/active/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Invite User or Add User button in Users section', async ({ page }) => {
    await goToSettings(page);
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(
      page.getByRole('button', { name: /invite|add user|new user/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show search field in Users section', async ({ page }) => {
    await goToSettings(page);
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(
      page.getByPlaceholder(/search users|search/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show user emails in user management table', async ({ page }) => {
    await goToSettings(page);
    const usersNav = page.getByRole('button', { name: /^users$/i })
      .or(page.getByText('Users').first());
    await usersNav.click();
    await expect(
      page.getByText(/@primusdemo\.com/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Locations Section ─────────────────────────────────────────────────────

  test('should show location list when clicking Locations nav', async ({ page }) => {
    await goToSettings(page);
    const locationsNav = page.getByRole('button', { name: /^locations$/i })
      .or(page.getByText('Locations').first());
    await locationsNav.click();
    await expect(
      page.getByText(/downtown|midtown|location/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show location addresses in Locations section', async ({ page }) => {
    await goToSettings(page);
    const locationsNav = page.getByRole('button', { name: /^locations$/i })
      .or(page.getByText('Locations').first());
    await locationsNav.click();
    await expect(
      page.getByText(/chicago|LaSalle|Erie|IL/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Add Location button in Locations section', async ({ page }) => {
    await goToSettings(page);
    const locationsNav = page.getByRole('button', { name: /^locations$/i })
      .or(page.getByText('Locations').first());
    await locationsNav.click();
    await expect(
      page.getByRole('button', { name: /add location|new location/i })
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Super Admin Only ──────────────────────────────────────────────────────

  test('should not show Tenants or Platform nav items for Tenant Admin', async ({ page }) => {
    await goToSettings(page);
    // These are super_admin only sections
    await expect(page.getByText('Tenants')).not.toBeVisible();
    await expect(page.getByText('Platform')).not.toBeVisible();
    await expect(page.getByText('Audit Log')).not.toBeVisible();
  });

  test('should show super_admin only sections for Super Admin login', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Alex Morgan').click();
    await page.getByRole('button', { name: /sign in as/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.goto('/settings');
    await expect(page.getByText('Tenants')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Platform')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Audit Log')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Feature Flags')).toBeVisible({ timeout: 10000 });
  });
});
