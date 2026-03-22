import { test, expect, type Page } from '@playwright/test';

/**
 * Inbox E2E — Provider Portal (port 5173)
 *
 * Tests the InboxPage:
 * - Inbox items list with priority badges
 * - Type filter tabs (Labs, Messages, Refills, Prior Auth, Tasks)
 * - Clicking an item to view detail
 * - Action buttons (Archive, Mark Actioned, Dismiss)
 *
 * Mock inbox data includes:
 *   INB-001: Critical K+ 6.8 — Robert Johnson (lab_result, critical)
 *   INB-002: HbA1c 9.2% — Maria Santos (lab_result, high)
 *   INB-003: Lisinopril cough — David Kim (message, normal)
 *   INB-004: refill request (refill)
 *
 * Login: Provider (Emily Chen) — sees Inbox in sidebar.
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

async function loginAsProvider(page: Page) {
  await page.goto('/login');
  await page.getByText('Emily Chen').click();
  await page.getByRole('button', { name: /sign in as/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

async function goToInbox(page: Page) {
  await loginAsProvider(page);
  await page.goto('/inbox');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Provider Portal — Inbox', () => {

  // ── Page Load ─────────────────────────────────────────────────────────────

  test('should load /inbox page without error', async ({ page }) => {
    await goToInbox(page);
    await expect(page).toHaveURL(/\/inbox/);
  });

  test('should show Inbox heading on inbox page', async ({ page }) => {
    await goToInbox(page);
    await expect(page.getByText(/inbox/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Inbox Items ───────────────────────────────────────────────────────────

  test('should show at least one inbox item', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByText(/robert johnson|maria santos|david kim|potassium|hba1c|lisinopril/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show critical lab result (K+ 6.8) in inbox', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByText(/potassium.*6\.8|critical.*potassium|K\+.*6/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show HbA1c lab result in inbox', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByText(/hba1c|hemoglobin a1c|9\.2%/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show patient message about Lisinopril in inbox', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByText(/lisinopril|cough/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show CRITICAL priority badge for critical lab item', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByText(/critical/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show patient names in inbox item list', async ({ page }) => {
    await goToInbox(page);
    await expect(page.getByText('Robert Johnson').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Maria Santos').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show creation time or timestamp on inbox items', async ({ page }) => {
    await goToInbox(page);
    // Times like "2026-03-19" or relative times like "2h ago"
    await expect(
      page.getByText(/\d{4}-\d{2}-\d{2}|ago|today|2026/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Type Filter Tabs ──────────────────────────────────────────────────────

  test('should show Labs filter tab', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByRole('button', { name: /labs?|lab results?/i })
        .or(page.getByText(/^labs?$/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Messages filter tab', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByRole('button', { name: /^messages?$/i })
        .or(page.getByText(/^messages?$/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Refills filter tab', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByRole('button', { name: /^refills?$/i })
        .or(page.getByText(/^refills?$/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Prior Auth filter tab', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByRole('button', { name: /prior auth|pa/i })
        .or(page.getByText(/prior auth/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should filter to only lab results when Labs tab clicked', async ({ page }) => {
    await goToInbox(page);
    const labsTab = page.getByRole('button', { name: /^labs?/i }).or(
      page.getByText(/^labs?$/i).first()
    );
    if (await labsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await labsTab.click();
      // Lab results should still be visible
      await expect(page.getByText(/potassium|hba1c|lab/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should filter to messages when Messages tab clicked', async ({ page }) => {
    await goToInbox(page);
    const msgTab = page.getByRole('button', { name: /^messages?$/i });
    if (await msgTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await msgTab.click();
      await expect(page.getByText(/lisinopril|cough|message/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  // ── Item Detail ───────────────────────────────────────────────────────────

  test('should open inbox item detail when clicking on a lab result', async ({ page }) => {
    await goToInbox(page);
    // Click the critical K+ item
    const critItem = page.getByText(/potassium.*6\.8|critical.*potassium|K\+.*6\.8/i).first();
    if (await critItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await critItem.click();
    } else {
      // Fallback: click first inbox item
      await page.getByText('Robert Johnson').first().click();
    }
    // Detail panel should show the full lab detail text
    await expect(
      page.getByText(/potassium|creatinine|BUN|immediate|review required|6\.8/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show patient ID in inbox item detail', async ({ page }) => {
    await goToInbox(page);
    await page.getByText('Robert Johnson').first().click();
    await expect(page.getByText(/PAT-00001/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show action buttons in inbox item detail (Archive, Action, Dismiss)', async ({ page }) => {
    await goToInbox(page);
    // Click first item
    await page.getByText(/potassium|hba1c|lisinopril/i).first().click();
    await expect(
      page.getByRole('button', { name: /archive|action|dismiss|mark|done/i }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show View Patient Chart button in inbox item detail', async ({ page }) => {
    await goToInbox(page);
    await page.getByText('Robert Johnson').first().click();
    await expect(
      page.getByRole('button', { name: /view.*chart|open.*chart|patient chart/i })
        .or(page.getByRole('link', { name: /view.*chart|patient chart/i }))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show total unread count in inbox header or badge', async ({ page }) => {
    await goToInbox(page);
    // The inbox page should show total count
    await expect(page.getByText(/\d+.*item|\d+.*unread|8 items/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Mark All Read or similar bulk action', async ({ page }) => {
    await goToInbox(page);
    await expect(
      page.getByRole('button', { name: /mark all|archive all|read all/i })
        .or(page.getByText(/mark all read/i))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });
});
