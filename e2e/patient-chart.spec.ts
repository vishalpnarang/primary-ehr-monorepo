import { test, expect } from '@playwright/test';

/**
 * Patient Chart E2E — Provider Portal (port 5173)
 * Tests the patient chart experience: list → chart → tabs.
 */

async function loginAsProvider(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto('/login');
  await page.getByRole('button', { name: /provider/i }).first().click();
  await page.waitForURL(/\/dashboard/);
}

test.describe('Provider Portal — Patient Chart', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProvider(page);
  });

  test('navigating to /patients shows the patient list', async ({ page }) => {
    await page.goto('/patients');
    await expect(page).toHaveURL(/\/patients/);
    await expect(page.getByText(/patients/i).first()).toBeVisible();
  });

  test('patient list contains at least one patient row', async ({ page }) => {
    await page.goto('/patients');

    // Wait for content to load — at minimum one patient name should appear
    // Mock data includes Sarah Johnson, Marcus Rivera, etc.
    await expect(
      page.getByText(/johnson|rivera|chen|thompson|williams/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('clicking a patient opens the patient chart', async ({ page }) => {
    await page.goto('/patients');

    // Click the first patient result
    const firstPatient = page.getByRole('link', { name: /johnson|rivera|chen|sarah|marcus/i }).first();
    await firstPatient.click();

    // URL should contain /patients/PAT-
    await expect(page).toHaveURL(/\/patients\/PAT-/);
  });

  test('patient chart shows the sticky patient header', async ({ page }) => {
    await page.goto('/patients/PAT-10001');

    // Patient header always visible with name or MRN
    await expect(
      page.getByText(/sarah|johnson|PAT-10001/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('patient chart shows clinical summary cards', async ({ page }) => {
    await page.goto('/patients/PAT-10001');

    // Should see section headings: Medications, Problems, Allergies, Vitals
    await expect(
      page.getByText(/medication|problem|allerg|vital/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('patient chart shows Medications card or section', async ({ page }) => {
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/medication/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('patient chart shows Problems card or section', async ({ page }) => {
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/problem/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('patient chart shows Allergies card or section', async ({ page }) => {
    await page.goto('/patients/PAT-10001');
    await expect(page.getByText(/allerg/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('patient chart has chart tab navigation', async ({ page }) => {
    await page.goto('/patients/PAT-10001');

    // There should be tabs for Notes, Medications, Labs, etc.
    await expect(
      page.getByRole('tab').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('clicking Notes tab shows notes content', async ({ page }) => {
    await page.goto('/patients/PAT-10001');

    const notesTab = page.getByRole('tab', { name: /notes?/i });
    if (await notesTab.isVisible()) {
      await notesTab.click();
      await expect(
        page.getByText(/note|encounter|soap/i).first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      // Notes may be in the default view; verify notes text present
      await expect(page.getByText(/note/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('clicking Medications tab shows medication table', async ({ page }) => {
    await page.goto('/patients/PAT-10001');

    const medTab = page.getByRole('tab', { name: /med/i });
    if (await medTab.isVisible()) {
      await medTab.click();
      await expect(
        page.getByText(/medication|drug|dosage|prescri/i).first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByText(/medication/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('patient chart for PAT-10002 (Marcus Rivera) loads without error', async ({ page }) => {
    await page.goto('/patients/PAT-10002');
    await expect(
      page.getByText(/marcus|rivera|PAT-10002/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('navigating to new encounter route from chart does not crash', async ({ page }) => {
    await page.goto('/patients/PAT-10001/encounters/new');
    // Should render some encounter / note content
    await expect(
      page.getByText(/encounter|note|visit|chief complaint/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
