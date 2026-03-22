import { test, expect, type Page } from '@playwright/test';

/**
 * Navigation E2E — Provider Portal (port 5173)
 *
 * Tests sidebar navigation between all major sections after login.
 * The sidebar shows only role-appropriate items, so most tests use
 * Provider (sees Dashboard, Scheduling, Patients, Inbox) or Tenant Admin
 * (additionally sees Billing, Reports, Settings).
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loginAs(page: Page, userName: string) {
  await page.goto('/login');
  await page.getByText(userName).click();
  await page.getByRole('button', { name: /sign in as/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

async function loginAsProvider(page: Page) {
  await loginAs(page, 'Emily Chen');
}

async function loginAsTenantAdmin(page: Page) {
  await loginAs(page, 'James Wilson');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Provider Portal — Sidebar Navigation', () => {

  test('should land on /dashboard after Provider login', async ({ page }) => {
    await loginAsProvider(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show Primus EHR branding in sidebar', async ({ page }) => {
    await loginAsProvider(page);
    await expect(page.getByText('Primus').first()).toBeVisible();
  });

  test('should show Search shortcut (Ctrl+K) hint in sidebar', async ({ page }) => {
    await loginAsProvider(page);
    await expect(page.getByText(/⌘K|Ctrl\+K|search/i).first()).toBeVisible();
  });

  test('should navigate to /schedule via sidebar Scheduling link', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByRole('link', { name: /scheduling/i }).first().click();
    await expect(page).toHaveURL(/\/schedule/);
  });

  test('should see Schedule page with calendar controls after navigating', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    // Schedule page has Day/Week/Month view toggle
    await expect(page.getByRole('button', { name: /day|week|month/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to /patients via sidebar Patients link', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByRole('link', { name: /patients/i }).first().click();
    await expect(page).toHaveURL(/\/patients/);
  });

  test('should see patient list heading after navigating to Patients', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText(/patients/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to /inbox via sidebar Inbox link', async ({ page }) => {
    await loginAsProvider(page);
    await page.getByRole('link', { name: /inbox/i }).first().click();
    await expect(page).toHaveURL(/\/inbox/);
  });

  test('should see inbox badge count in sidebar', async ({ page }) => {
    await loginAsProvider(page);
    // Inbox badge shows "8" in the sidebar
    await expect(page.getByText('8').first()).toBeVisible();
  });

  test('should see Inbox page items after navigating', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/inbox');
    await expect(page.getByText(/inbox/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to /billing via sidebar Billing link (Tenant Admin)', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.getByRole('link', { name: /billing/i }).first().click();
    await expect(page).toHaveURL(/\/billing/);
  });

  test('should see Billing & RCM heading on billing page', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/billing');
    await expect(page.getByText(/billing.*rcm|billing & rcm/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to /reports via sidebar Reports link (Tenant Admin)', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.getByRole('link', { name: /reports/i }).first().click();
    await expect(page).toHaveURL(/\/reports/);
  });

  test('should see report category cards on Reports page', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/reports');
    await expect(page.getByText(/operational/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/financial/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/clinical quality/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to /settings via sidebar Settings link (Tenant Admin)', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.getByRole('link', { name: /settings/i }).first().click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should show Settings navigation sections for Tenant Admin', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto('/settings');
    await expect(page.getByText(/organization/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/locations/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/users/i)).toBeVisible({ timeout: 10000 });
  });

  test('should not show Billing in sidebar for Nurse role', async ({ page }) => {
    await loginAs(page, 'Sarah Thompson');
    // Billing is not in the nurse role items
    await expect(page.getByRole('link', { name: /^billing$/i })).not.toBeVisible();
  });

  test('should not show Settings in sidebar for Provider role', async ({ page }) => {
    await loginAsProvider(page);
    // Settings is only for tenant_admin and super_admin
    await expect(page.getByRole('link', { name: /^settings$/i })).not.toBeVisible();
  });

  test('should open Command Palette when clicking Search button', async ({ page }) => {
    await loginAsProvider(page);
    // Click the Search button in the sidebar
    await page.getByRole('button', { name: /search/i }).first().click();
    // Command palette overlay should appear
    await expect(page.getByPlaceholder(/search patients|search|type to search/i)).toBeVisible({ timeout: 5000 });
  });

  test('should open Command Palette with Ctrl+K shortcut', async ({ page }) => {
    await loginAsProvider(page);
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder(/search patients|search|type to search/i)).toBeVisible({ timeout: 5000 });
  });

  test('should close Command Palette with Escape key', async ({ page }) => {
    await loginAsProvider(page);
    await page.keyboard.press('Control+k');
    const searchInput = page.getByPlaceholder(/search patients|search|type to search/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible({ timeout: 3000 });
  });

  test('back button returns to previous page', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await page.goto('/inbox');
    await page.goBack();
    await expect(page).toHaveURL(/\/patients/);
  });

  test('should highlight active nav item when on /schedule', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule');
    // The active NavLink gets text-blue-600 class; verify "Scheduling" link is present and active
    const schedulingLink = page.getByRole('link', { name: /scheduling/i }).first();
    await expect(schedulingLink).toBeVisible();
    // Active class contains blue color
    await expect(schedulingLink).toHaveClass(/text-blue/);
  });

  test('Dashboard link is visible and navigates back from other pages', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await page.getByRole('link', { name: /dashboard/i }).first().click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
