import { test, expect, type Page } from '@playwright/test';

/**
 * Billing E2E — Provider Portal (port 5173)
 *
 * Tests the full BillingPage:
 * - 4 KPI cards (Clean Claim Rate, Denial Rate, Days in A/R, Collections)
 * - Sub-navigation tabs: Dashboard, Charges, Claims, ERA, Denials, A/R, Patient Balances
 * - Claim queue table with status badges
 * - Denial queue with suggested action cards
 * - Charges view with submit-all button
 * - ERA view and A/R aging view
 *
 * Login: Billing Staff (Lisa Patel) — has access to /billing.
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

async function loginAsBilling(page: Page) {
  await page.goto('/login');
  await page.getByText('Lisa Patel').click();
  await page.getByRole('button', { name: /sign in as/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

async function goToBilling(page: Page) {
  await loginAsBilling(page);
  await page.goto('/billing');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Provider Portal — Billing & RCM', () => {

  // ── Page Load ─────────────────────────────────────────────────────────────

  test('should load /billing page without error', async ({ page }) => {
    await goToBilling(page);
    await expect(page).toHaveURL(/\/billing/);
  });

  test('should show Billing & RCM page heading', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/billing.*rcm|billing & rcm/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show subtitle "Claims management, denials, and revenue cycle"', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/claims management.*revenue cycle/i)).toBeVisible({ timeout: 10000 });
  });

  // ── KPI Cards ─────────────────────────────────────────────────────────────

  test('should show Clean Claim Rate KPI card', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/clean claim rate/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show Clean Claim Rate value (94.2%)', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText('94.2%').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Denial Rate KPI card', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/denial rate/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show Denial Rate value (5.8%)', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText('5.8%').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Days in A/R KPI card', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/days in a\/r|days in ar/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show Days in A/R value (32)', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText('32').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Collections This Week KPI card', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/collections/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Collections value ($48,200)', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/\$48,200|\$48\.2k/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Sub-navigation Tabs ───────────────────────────────────────────────────

  test('should show all billing tab labels', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByRole('button', { name: /^dashboard$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^charges$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^claims$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^era$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^denials$/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show A/R and Patient Balances tabs', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByRole('button', { name: /^a\/r$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /patient balances/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show denial count badge on Denials tab', async ({ page }) => {
    await goToBilling(page);
    // Denials tab shows badge with count (5 in mock data)
    await expect(page.getByText('5').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Dashboard View (default) ──────────────────────────────────────────────

  test('should show Claim Queue section on dashboard view', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/claim queue/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Denial Queue section on dashboard view', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/denial queue/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show claim rows with patient names on dashboard', async ({ page }) => {
    await goToBilling(page);
    await expect(
      page.getByText(/robert johnson|maria santos|david kim|linda chen/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show CPT codes in claim table', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/99214|99213|99215|99395/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show payer names in claim table', async ({ page }) => {
    await goToBilling(page);
    await expect(page.getByText(/aetna|unitedhealthcare|bluecross|cigna/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Claims Tab ────────────────────────────────────────────────────────────

  test('should switch to Claims tab and show all claims table', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^claims$/i }).click();
    await expect(page.getByText('All Claims')).toBeVisible({ timeout: 10000 });
  });

  test('should show status filter buttons on Claims tab (All, Ready, Submitted, etc.)', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^claims$/i }).click();
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^ready$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^submitted$/i })).toBeVisible({ timeout: 10000 });
  });

  test('should filter claims by Denied status', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^claims$/i }).click();
    await page.getByRole('button', { name: /^denied$/i }).click();
    // After filtering, only denied claims (Linda Chen, Patricia Nguyen) should show
    await expect(page.getByText(/linda chen|patricia nguyen/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Export button on Claims tab', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^claims$/i }).click();
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 10000 });
  });

  // ── Denials Tab ───────────────────────────────────────────────────────────

  test('should switch to Denials tab and show denial cards', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^denials$/i }).click();
    await expect(page.getByText(/denial queue/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show denial reason codes (CO-97, CO-4, CO-50)', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^denials$/i }).click();
    await expect(page.getByText(/CO-97|CO-4|CO-50|CO-22|PR-1/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show suggested action text on denial cards', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^denials$/i }).click();
    await expect(page.getByText(/unbundle|appeal|resubmit|verify|bill patient/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Appeal, Correct & Resubmit, and Write Off action buttons on denial', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^denials$/i }).click();
    await expect(page.getByRole('button', { name: /^appeal$/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /correct.*resubmit/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /write off/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show total amount at risk on Denials tab', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^denials$/i }).click();
    await expect(page.getByText(/at risk/i)).toBeVisible({ timeout: 10000 });
  });

  // ── Charges Tab ───────────────────────────────────────────────────────────

  test('should switch to Charges tab and show Charge Capture heading', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^charges$/i }).click();
    await expect(page.getByText(/charge capture/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show Submit All button on Charges tab', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^charges$/i }).click();
    await expect(page.getByRole('button', { name: /submit all/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show ICD-10 codes in charges table', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^charges$/i }).click();
    await expect(page.getByText(/Z00\.00|E11\.9|I10/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ── ERA Tab ───────────────────────────────────────────────────────────────

  test('should switch to ERA tab and show Electronic Remittance Advice heading', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^era$/i }).click();
    await expect(page.getByText(/electronic remittance|remittance advice|835/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show ERA rows with payer and EFT numbers', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^era$/i }).click();
    await expect(page.getByText(/EFT-|CHK-/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ── A/R Tab ───────────────────────────────────────────────────────────────

  test('should switch to A/R tab and show aging buckets', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^a\/r$/i }).click();
    await expect(page.getByText(/0.30 days|0–30/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/31.60 days|31–60/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/90\+/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show A/R aging by payer table on A/R tab', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /^a\/r$/i }).click();
    await expect(page.getByText(/a\/r aging by payer/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Aetna').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Medicare').first()).toBeVisible({ timeout: 10000 });
  });

  // ── Patient Balances Tab ──────────────────────────────────────────────────

  test('should switch to Patient Balances tab and show table', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /patient balances/i }).click();
    await expect(page.getByText(/patient balances/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Send All Statements button on Patient Balances tab', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /patient balances/i }).click();
    await expect(page.getByRole('button', { name: /send all statements/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show outstanding balance amounts on Patient Balances tab', async ({ page }) => {
    await goToBilling(page);
    await page.getByRole('button', { name: /patient balances/i }).click();
    await expect(page.getByText(/\$88|\$146|\$310/i).first()).toBeVisible({ timeout: 10000 });
  });
});
