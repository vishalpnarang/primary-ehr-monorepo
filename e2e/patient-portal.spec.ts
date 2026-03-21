import { test, expect } from '@playwright/test';

/**
 * Patient Portal E2E — Patient Portal (port 5174)
 * Override baseURL to target the patient portal.
 */

test.use({ baseURL: 'http://localhost:5174' });

async function loginAsPatient(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto('/login');

  // Patient portal has a login form or role selector for the mock login
  // Try clicking a "Patient" button if present, otherwise fill the form
  const patientButton = page.getByRole('button', { name: /patient|sign in|continue/i }).first();
  await patientButton.waitFor({ timeout: 5000 }).catch(() => null);

  if (await patientButton.isVisible().catch(() => false)) {
    await patientButton.click();
  } else {
    // Fall back: fill email/password if the patient portal has a form
    const emailInput = page.getByRole('textbox', { name: /email/i });
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('patient@example.com');
      const passInput = page.getByLabel(/password/i);
      if (await passInput.isVisible().catch(() => false)) {
        await passInput.fill('password');
      }
      await page.getByRole('button', { name: /sign in|login|continue/i }).first().click();
    }
  }

  // Wait for redirect away from /login
  await page.waitForURL(/\/(home|welcome|appointments|dashboard)/i, { timeout: 10000 }).catch(() => null);
}

test.describe('Patient Portal — Authentication & Navigation', () => {
  test('patient portal /login page is reachable', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page shows sign-in UI', async ({ page }) => {
    await page.goto('/login');
    // Should show some form of login UI
    await expect(
      page.getByText(/sign in|log in|welcome|continue/i).first()
    ).toBeVisible();
  });

  test('after login, redirects away from /login', async ({ page }) => {
    await loginAsPatient(page);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('patient home or welcome page is visible after login', async ({ page }) => {
    await loginAsPatient(page);
    await expect(
      page.getByText(/home|welcome|dashboard|hello|appointment/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('navigating to /appointments shows the appointments list', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/appointments');

    await expect(page).toHaveURL(/\/appointments/);
    await expect(
      page.getByText(/appointment/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('appointments page shows upcoming or past appointments', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/appointments');

    await expect(
      page.getByText(/upcoming|past|schedule|no appointment|appointment/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('navigating to /messages shows the messages page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/messages');

    await expect(page).toHaveURL(/\/messages/);
    await expect(
      page.getByText(/message|inbox|thread/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('messages page shows message threads or empty state', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/messages');

    await expect(
      page.getByText(/message|thread|conversation|no message/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('navigating to /records shows the health records page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/records');

    await expect(page).toHaveURL(/\/records/);
    await expect(
      page.getByText(/record|health|visit|lab|medication/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('records page shows section tabs or content categories', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/records');

    await expect(
      page.getByText(/visit|lab|medication|immunization|record/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('navigating to /billing shows billing page', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/billing');

    await expect(page).toHaveURL(/\/billing/);
    await expect(
      page.getByText(/billing|balance|statement|payment/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('navigating to /profile shows patient profile', async ({ page }) => {
    await loginAsPatient(page);
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/profile/);
    await expect(
      page.getByText(/profile|personal|contact|insurance/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('/welcome page is publicly accessible', async ({ page }) => {
    await page.goto('/welcome');
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('unauthenticated access to /home redirects to /login', async ({ page }) => {
    // Clear storage first
    await page.evaluate(() => sessionStorage.clear());
    await page.goto('/home');
    await expect(page).toHaveURL(/\/login/);
  });
});
