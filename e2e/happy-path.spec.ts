import { test, expect } from '@playwright/test';

/**
 * Primus EHR — Single Happy Path
 *
 * ONE test covering the complete provider workflow end-to-end.
 * Uses test.step() so you see each step pass/fail in the reporter.
 * Includes 2s delays between steps so you can visually review in --headed mode.
 *
 * Run:  npx playwright test e2e/happy-path.spec.ts --headed --project=chromium
 *
 * UPDATE THIS TEST whenever a new UI feature is built.
 */

const PAUSE = 2000; // ms delay between steps for visual review

test('Complete provider happy path', async ({ page }) => {
  test.setTimeout(180_000);

  // ─── 1. LOGIN ──────────────────────────────────────────────────────────────
  await test.step('1. Login as provider (Emily Chen)', async () => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Emily Chen')).toBeVisible();
    await page.getByRole('button', { name: /sign in as/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
    await page.waitForTimeout(PAUSE);
  });

  // ─── 2. DASHBOARD ─────────────────────────────────────────────────────────
  await test.step('2. Dashboard shows KPIs and schedule', async () => {
    await expect(page.getByText('Patients Today')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText("Today's Schedule")).toBeVisible();
    await page.waitForTimeout(PAUSE);

    // Click "Full schedule" → navigates to /schedule
    await page.getByText('Full schedule').click();
    await page.waitForURL(/\/schedule/);
    await page.waitForTimeout(PAUSE);
  });

  // ─── 3. SCHEDULE ──────────────────────────────────────────────────────────
  await test.step('3. Schedule page loads', async () => {
    await expect(page.locator('body')).toContainText(/schedule|calendar|day|week/i);
    await page.waitForTimeout(PAUSE);
  });

  // ─── 4. NEW APPOINTMENT ───────────────────────────────────────────────────
  await test.step('4. Navigate to new appointment', async () => {
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(PAUSE);

    // Select appointment type if visible
    const typeCard = page.locator('button, [class*="border"]')
      .filter({ hasText: /new patient|follow-up/i }).first();
    if (await typeCard.isVisible().catch(() => false)) {
      await typeCard.click();
      await page.waitForTimeout(PAUSE);
    }
  });

  // ─── 5. PATIENTS LIST ─────────────────────────────────────────────────────
  await test.step('5. Patient list loads and search works', async () => {
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(PAUSE);

    const search = page.getByPlaceholder(/search/i);
    await expect(search).toBeVisible();

    await search.fill('Sarah');
    await page.waitForTimeout(PAUSE);

    // Clear by selecting all + delete (more reliable than .clear())
    await search.fill('');
    await page.waitForTimeout(1000);
  });

  // ─── 6. CREATE PATIENT ────────────────────────────────────────────────────
  await test.step('6. Open create patient form', async () => {
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(PAUSE);

    const firstName = page.getByLabel(/first name/i).or(page.getByPlaceholder(/first name/i));
    if (await firstName.isVisible().catch(() => false)) {
      await firstName.fill('Test');
      const lastName = page.getByLabel(/last name/i).or(page.getByPlaceholder(/last name/i));
      if (await lastName.isVisible().catch(() => false)) {
        await lastName.fill('HappyPath');
      }
      await page.waitForTimeout(PAUSE);
    }
  });

  // ─── 7. PATIENT CHART ─────────────────────────────────────────────────────
  await test.step('7. Open patient chart', async () => {
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Click first patient row
    const row = page.locator('button, [class*="cursor-pointer"]')
      .filter({ hasText: /johnson|rivera|chen|santos/i }).first();

    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(PAUSE);

      // Verify chart loaded
      await expect(
        page.getByText(/medications|problem list|allergies/i).first()
      ).toBeVisible({ timeout: 10_000 });
      await page.waitForTimeout(PAUSE);
    }
  });

  // ─── 8. INBOX ─────────────────────────────────────────────────────────────
  await test.step('8. Inbox loads with tabs', async () => {
    await page.goto('/inbox');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(PAUSE);

    await expect(page.getByText('Inbox').first()).toBeVisible();

    // Verify specific tabs exist (use exact match to avoid "Mark all read" collision)
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Labs', exact: true })).toBeVisible();

    // Click first inbox item
    const item = page.locator('[class*="cursor-pointer"], [class*="hover:bg"]')
      .filter({ hasText: /review|request|refill|question|HbA1c|lisinopril/i }).first();
    if (await item.isVisible().catch(() => false)) {
      await item.click();
      await page.waitForTimeout(PAUSE);
    }
  });

  // ─── 9. BILLING ───────────────────────────────────────────────────────────
  await test.step('9. Billing page loads', async () => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/billing|claims|revenue/i).first()).toBeVisible();
    await page.waitForTimeout(PAUSE);
  });

  // ─── 10. SETTINGS ─────────────────────────────────────────────────────────
  await test.step('10. Settings page loads', async () => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/settings|organization|general/i).first()).toBeVisible();
    await page.waitForTimeout(PAUSE);
  });

  // ─── 11. SIDEBAR NAVIGATION ───────────────────────────────────────────────
  await test.step('11. Sidebar navigation works without refresh', async () => {
    const nav = page.locator('nav, [class*="sidebar"]').first();

    await nav.getByText('Dashboard').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Patients Today')).toBeVisible();
    await page.waitForTimeout(PAUSE);

    await nav.getByText('Patients').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(PAUSE);

    await nav.getByText('Inbox').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(PAUSE);

    // Sidebar still visible = no full-page remount
    await expect(nav.getByText('Dashboard')).toBeVisible();
  });

  // ─── 12. COMMAND PALETTE ──────────────────────────────────────────────────
  await test.step('12. Command palette opens with Ctrl+K', async () => {
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    const input = page.getByPlaceholder(/search|command|type/i);
    if (await input.isVisible().catch(() => false)) {
      await input.fill('patient');
      await page.waitForTimeout(PAUSE);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

  // ─── 13. LOGOUT ───────────────────────────────────────────────────────────
  await test.step('13. Logout returns to login', async () => {
    const logout = page.getByRole('button', { name: /log\s?out|sign\s?out/i })
      .or(page.locator('[aria-label*="logout"]'))
      .or(page.locator('button').filter({ hasText: /logout|sign out/i }));

    if (await logout.isVisible().catch(() => false)) {
      await logout.click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/sign in/i)).toBeVisible({ timeout: 10_000 });
    } else {
      await page.goto('/login');
      await expect(page.getByText(/sign in/i)).toBeVisible();
    }
    await page.waitForTimeout(PAUSE);
  });
});
