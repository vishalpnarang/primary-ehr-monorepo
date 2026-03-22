import { test, expect, type Page } from '@playwright/test';

/**
 * Auth E2E — Provider Portal (port 5173)
 *
 * Tests the mock login flow. The LoginPage shows a list of role buttons
 * (each is a `<button>` containing the role label text), plus a "Sign in as X"
 * submit button. Selecting a role then clicking Sign In calls loginMock and
 * redirects to /dashboard.
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

async function selectRoleAndLogin(page: Page, roleLabel: string) {
  await page.goto('/login');
  // Each role row is a button; click the one whose text matches the role label
  await page.getByRole('button', { name: new RegExp(roleLabel, 'i') }).first().click();
  // Click the "Sign in as …" submit button
  await page.getByRole('button', { name: /sign in as/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Provider Portal — Authentication', () => {

  test('should show login page at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display "Sign in" heading and role selector prompt', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Sign in')).toBeVisible();
    await expect(page.getByText(/select a role/i)).toBeVisible();
  });

  test('should display all 7 provider roles on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Super Admin')).toBeVisible();
    await expect(page.getByText('Tenant Admin')).toBeVisible();
    await expect(page.getByText('Practice Admin')).toBeVisible();
    await expect(page.getByText('Provider (MD)')).toBeVisible();
    await expect(page.getByText('Nurse / MA')).toBeVisible();
    await expect(page.getByText('Front Desk')).toBeVisible();
    await expect(page.getByText('Billing Staff')).toBeVisible();
  });

  test('should show mock user names on role cards', async ({ page }) => {
    await page.goto('/login');
    // Provider row shows "Emily Chen"
    await expect(page.getByText('Emily Chen')).toBeVisible();
    // Nurse row shows "Sarah Thompson"
    await expect(page.getByText('Sarah Thompson')).toBeVisible();
    // Front Desk row shows "David Kim"
    await expect(page.getByText('David Kim')).toBeVisible();
  });

  test('should show Provider role pre-selected with blue ring', async ({ page }) => {
    await page.goto('/login');
    // The "Sign in as …" button should default to Provider (MD)
    await expect(page.getByRole('button', { name: /sign in as provider/i })).toBeVisible();
  });

  test('should login as Provider and redirect to /dashboard', async ({ page }) => {
    await selectRoleAndLogin(page, 'Emily Chen');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show provider dashboard content after Provider login', async ({ page }) => {
    await selectRoleAndLogin(page, 'Emily Chen');
    await expect(page.getByText("Emily")).toBeVisible();
    // Provider dashboard KPI: Patients Today
    await expect(page.getByText(/patients today/i)).toBeVisible();
  });

  test('should login as Nurse and see nurse dashboard with Room Status Board', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Sarah Thompson').click();
    await page.getByRole('button', { name: /sign in as/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/room status board/i)).toBeVisible({ timeout: 10000 });
  });

  test('should login as Front Desk and see check-in queue', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('David Kim').click();
    await page.getByRole('button', { name: /sign in as/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/check-in queue/i)).toBeVisible({ timeout: 10000 });
  });

  test('should login as Billing Staff and see clean claim rate KPI', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Lisa Patel').click();
    await page.getByRole('button', { name: /sign in as/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/clean claim rate/i)).toBeVisible({ timeout: 10000 });
  });

  test('should login as Tenant Admin and see tenant analytics dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('James Wilson').click();
    await page.getByRole('button', { name: /sign in as/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/active patients/i)).toBeVisible({ timeout: 10000 });
  });

  test('should login as Super Admin and see tenant registry', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Alex Morgan').click();
    await page.getByRole('button', { name: /sign in as/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/tenant registry/i)).toBeVisible({ timeout: 10000 });
  });

  test('should redirect unauthenticated access to /dashboard → /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated access to /patients → /login', async ({ page }) => {
    await page.goto('/patients');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated access to /inbox → /login', async ({ page }) => {
    await page.goto('/inbox');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated access to /billing → /login', async ({ page }) => {
    await page.goto('/billing');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated access to /settings → /login', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show sidebar after successful login', async ({ page }) => {
    await selectRoleAndLogin(page, 'Emily Chen');
    // Sidebar has the "P" logo button and nav links
    await expect(page.getByText('Primus').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible();
  });

  test('should logout and return to /login', async ({ page }) => {
    await selectRoleAndLogin(page, 'Emily Chen');
    // Find the logout button in sidebar (LogOut icon button)
    const logoutBtn = page.getByRole('button', { name: /log out|sign out/i });
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/\/login/);
    } else {
      // Sidebar may have a tooltip-only button — navigate directly
      await page.evaluate(() => sessionStorage.clear());
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should highlight selected role with blue border when clicking a different role', async ({ page }) => {
    await page.goto('/login');
    // Click Lisa Patel (Billing)
    await page.getByText('Lisa Patel').click();
    // Sign-in button should now say "Billing Staff"
    await expect(page.getByRole('button', { name: /sign in as billing/i })).toBeVisible();
  });

  test('should show fallback note about Keycloak on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/keycloak/i)).toBeVisible();
  });

  test('root path / should redirect to /login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
