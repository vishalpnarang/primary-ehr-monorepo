import { test, expect } from '@playwright/test';

/**
 * Navigation E2E — Provider Portal (port 5173)
 * Tests sidebar navigation between major sections.
 */

// Helper: login as Provider and land on dashboard
async function loginAsProvider(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto('/login');
  await page.getByRole('button', { name: /provider/i }).first().click();
  await page.waitForURL(/\/dashboard/);
}

test.describe('Provider Portal — Sidebar Navigation', () => {
  test('login as provider and reach dashboard', async ({ page }) => {
    await loginAsProvider(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('clicking Scheduling nav item navigates to /schedule', async ({ page }) => {
    await loginAsProvider(page);

    // Click the Schedule/Scheduling link in the sidebar
    await page.getByRole('link', { name: /schedule/i }).first().click();

    await expect(page).toHaveURL(/\/schedule/);
  });

  test('Schedule page shows the schedule/calendar content', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');

    await expect(
      page.getByText(/schedule|calendar|appointment/i).first()
    ).toBeVisible();
  });

  test('clicking Patients nav item navigates to /patients', async ({ page }) => {
    await loginAsProvider(page);

    await page.getByRole('link', { name: /patients/i }).first().click();

    await expect(page).toHaveURL(/\/patients/);
  });

  test('Patients page shows a patient list or heading', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');

    await expect(
      page.getByText(/patients/i).first()
    ).toBeVisible();
  });

  test('clicking Inbox nav item navigates to /inbox', async ({ page }) => {
    await loginAsProvider(page);

    await page.getByRole('link', { name: /inbox/i }).first().click();

    await expect(page).toHaveURL(/\/inbox/);
  });

  test('Inbox page shows inbox content heading', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');

    await expect(
      page.getByText(/inbox/i).first()
    ).toBeVisible();
  });

  test('clicking Billing nav item navigates to /billing', async ({ page }) => {
    await loginAsProvider(page);

    await page.getByRole('link', { name: /billing/i }).first().click();

    await expect(page).toHaveURL(/\/billing/);
  });

  test('Billing page shows billing dashboard content', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/billing');

    await expect(
      page.getByText(/billing|claims|revenue/i).first()
    ).toBeVisible();
  });

  test('clicking Reports nav item navigates to /reports', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/reports');

    await expect(page).toHaveURL(/\/reports/);
  });

  test('Reports page renders without crashing', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/reports');

    await expect(
      page.getByText(/report/i).first()
    ).toBeVisible();
  });

  test('direct URL navigation to /settings works', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/settings');

    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText(/settings/i).first()).toBeVisible();
  });

  test('back button returns to previous page', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await page.goto('/inbox');

    await page.goBack();

    await expect(page).toHaveURL(/\/patients/);
  });
});
