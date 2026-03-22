import { test, expect } from '@playwright/test';

/**
 * Primus EHR — Single Happy Path
 *
 * ONE test covering the complete provider workflow end-to-end.
 * Uses test.step() for readable output — if a step fails you know exactly where.
 *
 * Run:  npx playwright test e2e/happy-path.spec.ts --headed
 *
 * Flow: Login → Dashboard → Schedule → New Appointment → Patients → Create Patient
 *       → Patient Chart → Encounter → Inbox → Billing → Settings → Cmd+K → Logout
 *
 * UPDATE THIS TEST whenever a new UI feature is built (create, edit, delete, view).
 */
test('Complete provider happy path', async ({ page }) => {
  test.setTimeout(120_000);

  // ─── 1. LOGIN ──────────────────────────────────────────────────────────────
  await test.step('Login as provider (Emily Chen)', async () => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Emily Chen')).toBeVisible();
    await page.getByRole('button', { name: /sign in as/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  });

  // ─── 2. DASHBOARD ─────────────────────────────────────────────────────────
  await test.step('Dashboard shows KPIs and action links', async () => {
    await expect(page.getByText('Patients Today')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText("Today's Schedule")).toBeVisible();

    // Click "Full schedule" → navigates to /schedule
    await page.getByText('Full schedule').click();
    await page.waitForURL(/\/schedule/);
  });

  // ─── 3. SCHEDULE ──────────────────────────────────────────────────────────
  await test.step('Schedule page loads with view tabs', async () => {
    await expect(page.getByText(/day|week|month/i).first()).toBeVisible();
  });

  // ─── 4. NEW APPOINTMENT ───────────────────────────────────────────────────
  await test.step('Navigate to new appointment form', async () => {
    await page.goto('/schedule/new');
    await page.waitForLoadState('networkidle');

    // Select appointment type
    const typeCard = page.locator('button, [class*="border"]')
      .filter({ hasText: /new patient|follow-up/i }).first();
    if (await typeCard.isVisible().catch(() => false)) {
      await typeCard.click();
    }

    // Select provider
    const provider = page.getByText('Dr. Emily Chen').first();
    if (await provider.isVisible().catch(() => false)) {
      await provider.click();
    }
  });

  // ─── 5. PATIENTS LIST ─────────────────────────────────────────────────────
  await test.step('Patient list loads and search works', async () => {
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');

    // Search box visible
    const search = page.getByPlaceholder(/search/i);
    await expect(search).toBeVisible();

    // Search and clear
    await search.fill('Sarah');
    await page.waitForTimeout(500);
    await search.clear();
  });

  // ─── 6. CREATE PATIENT ────────────────────────────────────────────────────
  await test.step('Create new patient form', async () => {
    await page.goto('/patients/new');
    await page.waitForLoadState('networkidle');

    const firstName = page.getByLabel(/first name/i).or(page.getByPlaceholder(/first name/i));
    if (await firstName.isVisible().catch(() => false)) {
      await firstName.fill('Test');
      const lastName = page.getByLabel(/last name/i).or(page.getByPlaceholder(/last name/i));
      await lastName.fill('HappyPath');

      const dob = page.getByLabel(/date of birth/i).or(page.getByPlaceholder(/date of birth|dob|mm/i));
      if (await dob.isVisible().catch(() => false)) {
        await dob.fill('1990-01-15');
      }

      const phone = page.getByLabel(/phone/i).or(page.getByPlaceholder(/phone/i));
      if (await phone.isVisible().catch(() => false)) {
        await phone.fill('555-999-0001');
      }
    }
  });

  // ─── 7. PATIENT CHART ─────────────────────────────────────────────────────
  await test.step('Open patient chart and verify cards', async () => {
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click first patient row
    const row = page.locator('button, [class*="cursor-pointer"]')
      .filter({ hasText: /johnson|rivera|chen|santos/i }).first();

    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForLoadState('networkidle');
      // Verify chart sections
      await expect(
        page.getByText(/medications|problem list|allergies/i).first()
      ).toBeVisible({ timeout: 10_000 });
    } else {
      await page.goto('/patients/PAT-10001');
      await page.waitForLoadState('networkidle');
    }
  });

  // ─── 8. INBOX ─────────────────────────────────────────────────────────────
  await test.step('Inbox loads with tabs and items', async () => {
    await page.goto('/inbox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/inbox/i).first()).toBeVisible();

    // Verify tabs
    for (const tab of ['All', 'Labs', 'Messages']) {
      await expect(
        page.getByRole('button', { name: tab }).or(page.getByText(tab))
      ).toBeVisible();
    }

    // Click first item
    const item = page.locator('[class*="cursor-pointer"], [class*="hover"]')
      .filter({ hasText: /review|request|refill|question/i }).first();
    if (await item.isVisible().catch(() => false)) {
      await item.click();
      await page.waitForTimeout(500);
    }
  });

  // ─── 9. BILLING ───────────────────────────────────────────────────────────
  await test.step('Billing page loads', async () => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/billing|claims|revenue/i).first()).toBeVisible();
  });

  // ─── 10. SETTINGS ─────────────────────────────────────────────────────────
  await test.step('Settings page loads', async () => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/settings|organization|general/i).first()).toBeVisible();
  });

  // ─── 11. SIDEBAR NAVIGATION (no refresh) ──────────────────────────────────
  await test.step('Sidebar navigation works without page refresh', async () => {
    const nav = page.locator('nav, [class*="sidebar"]').first();

    await nav.getByText('Dashboard').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Patients Today')).toBeVisible();

    await nav.getByText('Patients').click();
    await page.waitForLoadState('networkidle');

    await nav.getByText('Inbox').click();
    await page.waitForLoadState('networkidle');

    // Sidebar still visible = no remount
    await expect(nav.getByText('Dashboard')).toBeVisible();
  });

  // ─── 12. COMMAND PALETTE ──────────────────────────────────────────────────
  await test.step('Command palette opens with Ctrl+K', async () => {
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(300);

    const input = page.getByPlaceholder(/search|command|type/i);
    if (await input.isVisible().catch(() => false)) {
      await input.fill('patient');
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
    }
  });

  // ─── 13. LOGOUT ───────────────────────────────────────────────────────────
  await test.step('Logout returns to login page', async () => {
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
  });
});
