import { test, expect, type Page } from '@playwright/test';

/**
 * Patient Flow E2E — Provider Portal (port 5173)
 *
 * Tests: Patient list, new patient multi-step form, chart open,
 * sticky header, card grid, and chart tab navigation.
 *
 * Mock data key patients:
 *   PAT-10001 — Sarah Johnson (44F, T2DM, HTN)
 *   PAT-10002 — Marcus Rivera (62M, COPD)
 *   PAT-10003 — Linda Chen (37F, Aetna)
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

async function loginAsProvider(page: Page) {
  await page.goto('/login');
  await page.getByText('Emily Chen').click();
  await page.getByRole('button', { name: /sign in as/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Provider Portal — Patient Management', () => {

  // ── Patient List ───────────────────────────────────────────────────────────

  test('should navigate to Patients page at /patients', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page).toHaveURL(/\/patients/);
  });

  test('should display patient list with at least one patient row', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    // Mock data includes Sarah Johnson, Marcus Rivera, Linda Chen, etc.
    await expect(
      page.getByText(/johnson|rivera|chen|thompson|williams/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display patient list with Sarah Johnson row', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText('Sarah Johnson')).toBeVisible({ timeout: 10000 });
  });

  test('should display patient list with Marcus Rivera row', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText('Marcus Rivera')).toBeVisible({ timeout: 10000 });
  });

  test('should show patient MRN numbers in list', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText(/PAT-10001|MRN-10001/).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show insurance payer names in patient list', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByText(/blue cross|aetna|medicare/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Add New Patient button on patients page', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByRole('button', { name: /new patient|add patient/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show search field on patients page', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await expect(page.getByPlaceholder(/search patients|search/i)).toBeVisible({ timeout: 10000 });
  });

  test('should filter patient list when searching by name', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    const searchInput = page.getByPlaceholder(/search patients|search/i);
    await searchInput.fill('Sarah');
    // After typing, the list should narrow down and Sarah Johnson should still be visible
    await expect(page.getByText('Sarah Johnson')).toBeVisible({ timeout: 10000 });
    // Marcus Rivera should not be visible (filtered out)
    await expect(page.getByText('Marcus Rivera')).not.toBeVisible({ timeout: 5000 });
  });

  test('should clear search and restore full patient list', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    const searchInput = page.getByPlaceholder(/search patients|search/i);
    await searchInput.fill('Sarah');
    await searchInput.clear();
    await expect(page.getByText('Marcus Rivera')).toBeVisible({ timeout: 10000 });
  });

  test('should open patient chart by clicking on patient row', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    // Click Sarah Johnson row
    await page.getByText('Sarah Johnson').click();
    await expect(page).toHaveURL(/\/patients\/PAT-10001/, { timeout: 10000 });
  });

  // ── New Patient Form ───────────────────────────────────────────────────────

  test('should navigate to /patients/new via New Patient button', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients');
    await page.getByRole('button', { name: /new patient|add patient/i }).click();
    await expect(page).toHaveURL(/\/patients\/new/);
  });

  test('should show 3-step stepper on new patient page', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    await expect(page.getByText('Demographics')).toBeVisible();
    await expect(page.getByText('Insurance')).toBeVisible();
    await expect(page.getByText('Review')).toBeVisible();
  });

  test('should show Demographics form fields in step 1', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    await expect(page.getByLabel(/first name/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/last name/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/date of birth|dob/i)).toBeVisible({ timeout: 10000 });
  });

  test('should fill step 1 demographics and proceed to step 2', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('Patient');
    await page.getByLabel(/date of birth|dob/i).fill('1990-01-15');
    // Fill phone
    const phoneInput = page.getByLabel(/phone/i);
    if (await phoneInput.isVisible()) await phoneInput.fill('(312) 555-0001');
    // Fill email
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible()) await emailInput.fill('test.patient@email.com');
    // Click Next / Continue
    await page.getByRole('button', { name: /next|continue/i }).click();
    // Should now show Insurance step
    await expect(page.getByText(/insurance|payer|member id/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show insurance form fields in step 2', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    // Navigate quickly to step 2 by filling minimal required fields
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('Patient');
    await page.getByLabel(/date of birth|dob/i).fill('1990-01-15');
    const phoneInput = page.getByLabel(/phone/i);
    if (await phoneInput.isVisible()) await phoneInput.fill('(312) 555-0001');
    await page.getByRole('button', { name: /next|continue/i }).click();
    // Insurance fields
    await expect(page.getByText(/primary payer|insurance|self.pay/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Review step as step 3', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/new');
    // Step 1
    await page.getByLabel(/first name/i).fill('Jane');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/date of birth|dob/i).fill('1985-05-20');
    const phoneInput = page.getByLabel(/phone/i);
    if (await phoneInput.isVisible()) await phoneInput.fill('(312) 555-0002');
    await page.getByRole('button', { name: /next|continue/i }).click();
    // Step 2 — click next again
    await page.getByRole('button', { name: /next|continue/i }).click();
    // Should be on Review step
    await expect(page.getByText(/review|confirm|summary/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Patient Chart ──────────────────────────────────────────────────────────

  test('should load patient chart for PAT-10001 at correct URL', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page).toHaveURL(/\/patients\/PAT-10001/);
  });

  test('should see patient name Sarah Johnson in chart header', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/sarah johnson/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should see MRN in chart header for PAT-10001', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/PAT-10001/)).toBeVisible({ timeout: 10000 });
  });

  test('should see patient allergy list in chart (Penicillin)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/penicillin/i)).toBeVisible({ timeout: 10000 });
  });

  test('should see Medications section or card in chart', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/medication/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should see a medication name (Metformin) in chart', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/metformin/i)).toBeVisible({ timeout: 10000 });
  });

  test('should see Problems section in chart', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/problem/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should see a problem entry (Type 2 Diabetes) in chart', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/type 2 diabetes|diabetes mellitus/i)).toBeVisible({ timeout: 10000 });
  });

  test('should see Allergies section in chart', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/allerg/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should see chart tab navigation (Notes, Medications, etc.)', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    // There should be some tab-like elements for chart sections
    await expect(
      page.getByRole('tab').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Notes tab and encounter list when clicked', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    const notesTab = page.getByRole('tab', { name: /notes?/i });
    if (await notesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await notesTab.click();
      await expect(page.getByText(/note|soap|h&p|encounter/i).first()).toBeVisible({ timeout: 10000 });
    } else {
      // Notes content in default view
      await expect(page.getByText(/h&p complete note|soap note/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should show encounter notes list with dates for PAT-10001', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/Mar 19, 2026|2026-03-19|03-19-2026/).first()).toBeVisible({ timeout: 10000 });
  });

  test('should load chart for PAT-10002 (Marcus Rivera) without error', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10002');
    await expect(page.getByText(/marcus|rivera|PAT-10002/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should load chart for PAT-10003 (Linda Chen) without error', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10003');
    await expect(page.getByText(/linda|chen|PAT-10003/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show insurance info in patient chart', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/blue cross|bcbs/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show provider name in patient chart', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/emily chen|dr\. chen/i)).toBeVisible({ timeout: 10000 });
  });
});
