import { test, expect, type Page } from '@playwright/test';

/**
 * Internal Portal E2E — Provider Portal (port 5173)
 *
 * Tests the password-gated internal routes (/internal/*).
 * These routes are outside the EHR auth system — they use a simple
 * password gate (InternalGate component) with sessionStorage.
 *
 * Correct password: primus2026
 * Wrong password: anything else → shows error and shakes
 *
 * Routes:
 *   /internal/management — Management Deck
 *   /internal/client     — Client Deck
 *   /internal/demo-guide — Demo Guide
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

async function unlockInternal(page: Page, password = 'primus2026') {
  await page.goto('/internal/management');
  await page.getByLabel(/access password/i).fill(password);
  await page.getByRole('button', { name: /unlock access/i }).click();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Internal Portal — Password Gate', () => {

  // ── Gate Page ─────────────────────────────────────────────────────────────

  test('should show Internal Access gate when visiting /internal/management', async ({ page }) => {
    await page.goto('/internal/management');
    await expect(page.getByText('Internal Access')).toBeVisible({ timeout: 10000 });
  });

  test('should show "Restricted to Thinkitive Technologies staff" message', async ({ page }) => {
    await page.goto('/internal/management');
    await expect(page.getByText(/thinkitive technologies/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show Shield icon and branding on gate page', async ({ page }) => {
    await page.goto('/internal/management');
    // The logo area has a Shield icon wrapped in a blue div
    await expect(page.locator('.bg-blue-600').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show password input field on gate page', async ({ page }) => {
    await page.goto('/internal/management');
    await expect(page.getByLabel(/access password/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show password field as type="password" (masked)', async ({ page }) => {
    await page.goto('/internal/management');
    const pwInput = page.getByLabel(/access password/i);
    await expect(pwInput).toHaveAttribute('type', 'password');
  });

  test('should show Unlock Access button on gate page', async ({ page }) => {
    await page.goto('/internal/management');
    await expect(page.getByRole('button', { name: /unlock access/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show Primus EHR copyright footer on gate page', async ({ page }) => {
    await page.goto('/internal/management');
    await expect(page.getByText(/primus ehr.*thinkitive/i)).toBeVisible({ timeout: 10000 });
  });

  // ── Wrong Password ────────────────────────────────────────────────────────

  test('should show error message when wrong password is entered', async ({ page }) => {
    await page.goto('/internal/management');
    await page.getByLabel(/access password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /unlock access/i }).click();
    await expect(page.getByText(/incorrect password/i)).toBeVisible({ timeout: 5000 });
  });

  test('should clear password field after wrong password attempt', async ({ page }) => {
    await page.goto('/internal/management');
    await page.getByLabel(/access password/i).fill('badpass');
    await page.getByRole('button', { name: /unlock access/i }).click();
    // After shake and clear, input should be empty
    await expect(page.getByLabel(/access password/i)).toHaveValue('', { timeout: 3000 });
  });

  test('should still show gate (not unlock) after wrong password', async ({ page }) => {
    await page.goto('/internal/management');
    await page.getByLabel(/access password/i).fill('notthepassword');
    await page.getByRole('button', { name: /unlock access/i }).click();
    // Gate form should still be visible
    await expect(page.getByRole('button', { name: /unlock access/i })).toBeVisible({ timeout: 5000 });
  });

  test('should not accept empty password submission', async ({ page }) => {
    await page.goto('/internal/management');
    // Try submitting with empty password
    await page.getByRole('button', { name: /unlock access/i }).click();
    // Either error shown or still on gate page
    await expect(page.getByRole('button', { name: /unlock access/i })).toBeVisible({ timeout: 5000 });
  });

  // ── Correct Password ──────────────────────────────────────────────────────

  test('should accept correct password (primus2026) and unlock', async ({ page }) => {
    await unlockInternal(page, 'primus2026');
    // After unlock, gate disappears and content renders
    await expect(page.getByText(/unlock access/i)).not.toBeVisible({ timeout: 5000 });
  });

  // ── Management Deck ───────────────────────────────────────────────────────

  test('should show Management Deck content after unlocking /internal/management', async ({ page }) => {
    await unlockInternal(page, 'primus2026');
    await expect(
      page.getByText(/management deck|management|primus|thinkitive|investor/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show internal navigation links after unlocking', async ({ page }) => {
    await unlockInternal(page, 'primus2026');
    // Internal pages have links to client deck and demo guide
    await expect(
      page.getByRole('link', { name: /client deck|management deck|demo guide/i })
        .or(page.getByText(/client deck|demo guide/i).first())
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Client Deck ───────────────────────────────────────────────────────────

  test('should show Client Deck content after unlocking /internal/client', async ({ page }) => {
    await page.goto('/internal/client');
    await page.getByLabel(/access password/i).fill('primus2026');
    await page.getByRole('button', { name: /unlock access/i }).click();
    await expect(
      page.getByText(/client deck|client|primary plus|proposal/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Demo Guide ────────────────────────────────────────────────────────────

  test('should show Demo Guide content after unlocking /internal/demo-guide', async ({ page }) => {
    await page.goto('/internal/demo-guide');
    await page.getByLabel(/access password/i).fill('primus2026');
    await page.getByRole('button', { name: /unlock access/i }).click();
    await expect(
      page.getByText(/demo guide|demo|guide|walkthrough|script/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── Session Persistence ───────────────────────────────────────────────────

  test('should stay unlocked when navigating between internal pages after unlock', async ({ page }) => {
    // Unlock once on management page
    await unlockInternal(page, 'primus2026');
    // Navigate to client deck — sessionStorage persists across same-origin navigation
    await page.goto('/internal/client');
    // Should NOT show gate again — directly renders client deck
    await expect(page.getByRole('button', { name: /unlock access/i })).not.toBeVisible({ timeout: 5000 });
  });

  test('gate page should show again in a fresh context (no sessionStorage)', async ({ browser }) => {
    // Create new context = fresh sessionStorage
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto('http://localhost:5173/internal/management');
    await expect(freshPage.getByText('Internal Access')).toBeVisible({ timeout: 10000 });
    await freshContext.close();
  });

  // ── Gate for all internal routes ──────────────────────────────────────────

  test('should show gate at /internal/client before login', async ({ page }) => {
    await page.goto('/internal/client');
    await expect(page.getByText('Internal Access')).toBeVisible({ timeout: 10000 });
  });

  test('should show gate at /internal/demo-guide before login', async ({ page }) => {
    await page.goto('/internal/demo-guide');
    await expect(page.getByText('Internal Access')).toBeVisible({ timeout: 10000 });
  });
});
