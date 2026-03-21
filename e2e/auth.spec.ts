import { test, expect } from '@playwright/test';

/**
 * Auth E2E — Provider Portal (port 5173)
 * Tests the mock login flow used in the UI-first phase.
 * No real Keycloak required: the LoginPage has a role-selector + "Sign in" button.
 */
test.describe('Provider Portal — Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear session state before every test
    await page.goto('/login');
    await page.evaluate(() => sessionStorage.clear());
  });

  test('navigates to /login and sees the login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows the role selector on the login page', async ({ page }) => {
    await page.goto('/login');
    // The mock login UI shows a list of roles to choose from
    await expect(page.getByText(/sign in as/i).first()).toBeVisible();
  });

  test('shows "Provider" role option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /provider/i }).first()).toBeVisible();
  });

  test('shows "Nurse" role option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/nurse/i).first()).toBeVisible();
  });

  test('shows "Front Desk" role option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/front desk/i).first()).toBeVisible();
  });

  test('clicking "Sign in as Provider" navigates to /dashboard', async ({ page }) => {
    await page.goto('/login');

    // Click the Provider sign-in button (first button matching provider)
    await page.getByRole('button', { name: /provider/i }).first().click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dashboard page shows dashboard content after provider login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /provider/i }).first().click();

    await page.waitForURL(/\/dashboard/);

    // Dashboard should show some recognizable content
    await expect(
      page.getByText(/dashboard|schedule|today/i).first()
    ).toBeVisible();
  });

  test('unauthenticated access to /dashboard redirects to /login', async ({ page }) => {
    // Clear session and try to access a protected route directly
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated access to /patients redirects to /login', async ({ page }) => {
    await page.goto('/patients');
    await expect(page).toHaveURL(/\/login/);
  });

  test('sidebar is visible after login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /provider/i }).first().click();
    await page.waitForURL(/\/dashboard/);

    // Sidebar navigation should be visible
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });
});
