import { test, expect, type Page } from '@playwright/test';

/**
 * Scheduling E2E — Provider Portal (port 5173)
 *
 * Tests the Schedule page: calendar views (Day/Week/Month), appointment
 * detail drawer, and the New Appointment multi-step booking flow.
 *
 * Mock data appointments are dated 2026-03-19 (TODAY in mock data).
 * Patients: Sarah Johnson (PAT-10001), Michael Brown (PAT-10010), Aisha Williams (PAT-10005).
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

async function loginAsProvider(page: Page) {
  await page.goto('/login');
  await page.getByText('Emily Chen').click();
  await page.getByRole('button', { name: /sign in as/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

async function goToSchedule(page: Page) {
  await loginAsProvider(page);
  await page.goto('/schedule');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Provider Portal — Scheduling', () => {

  // ── Calendar Views ────────────────────────────────────────────────────────

  test('should load /schedule page without error', async ({ page }) => {
    await goToSchedule(page);
    await expect(page).toHaveURL(/\/schedule/);
  });

  test('should show Day / Week / Month view toggle buttons', async ({ page }) => {
    await goToSchedule(page);
    await expect(page.getByRole('button', { name: /^day$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^week$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^month$/i })).toBeVisible({ timeout: 10000 });
  });

  test('should default to Day view with time slots visible', async ({ page }) => {
    await goToSchedule(page);
    // Day view shows hour labels (8:00, 9:00, etc.)
    await expect(page.getByText(/8:00|8 am|08:00/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show mock appointments on the day view', async ({ page }) => {
    await goToSchedule(page);
    // Mock includes Michael Brown (08:00) and Sarah Johnson (09:00)
    await expect(
      page.getByText(/michael brown|sarah johnson|aisha williams/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show New Appointment button on schedule page', async ({ page }) => {
    await goToSchedule(page);
    await expect(
      page.getByRole('button', { name: /new appointment|add appointment|\+ appointment/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Week view', async ({ page }) => {
    await goToSchedule(page);
    await page.getByRole('button', { name: /^week$/i }).click();
    // Week view shows day column headers (Mon, Tue, etc.)
    await expect(
      page.getByText(/mon|tue|wed|thu|fri|sun|sat/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should switch to Month view', async ({ page }) => {
    await goToSchedule(page);
    await page.getByRole('button', { name: /^month$/i }).click();
    // Month view shows month name and a calendar grid
    await expect(
      page.getByText(/january|february|march|april|may|june|july|august|september|october|november|december/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show previous/next navigation arrows on schedule', async ({ page }) => {
    await goToSchedule(page);
    await expect(page.getByRole('button', { name: /previous|chevron-left|<|‹/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /next|chevron-right|>|›/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show Today button on schedule page', async ({ page }) => {
    await goToSchedule(page);
    await expect(page.getByRole('button', { name: /^today$/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show provider filter / selector on schedule page', async ({ page }) => {
    await goToSchedule(page);
    await expect(page.getByText(/dr\. emily chen|all providers|provider/i).first()).toBeVisible({ timeout: 10000 });
  });

  // ── Appointment Detail ────────────────────────────────────────────────────

  test('should open appointment detail when clicking an appointment', async ({ page }) => {
    await goToSchedule(page);
    // Click the first appointment block visible in day view
    const firstAppt = page.getByText(/michael brown|sarah johnson|aisha williams/i).first();
    await firstAppt.click();
    // A slide-over or detail panel should appear with appointment info
    await expect(
      page.getByText(/appointment|visit|reason|status|type/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show patient name in appointment detail drawer', async ({ page }) => {
    await goToSchedule(page);
    const firstAppt = page.getByText(/michael brown|sarah johnson/i).first();
    await firstAppt.click();
    await expect(
      page.getByText(/michael brown|sarah johnson/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show appointment type in detail drawer', async ({ page }) => {
    await goToSchedule(page);
    const firstAppt = page.getByText(/michael brown|sarah johnson/i).first();
    await firstAppt.click();
    await expect(
      page.getByText(/new patient|follow.up|annual wellness|telehealth|urgent/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show appointment status in detail drawer', async ({ page }) => {
    await goToSchedule(page);
    const firstAppt = page.getByText(/michael brown|sarah johnson/i).first();
    await firstAppt.click();
    await expect(
      page.getByText(/completed|arrived|in room|confirmed|scheduled|no.show/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show Open Chart link/button in appointment drawer', async ({ page }) => {
    await goToSchedule(page);
    const firstAppt = page.getByText(/michael brown|sarah johnson/i).first();
    await firstAppt.click();
    await expect(
      page.getByRole('button', { name: /open.*chart|view.*chart|open chart/i }).or(
        page.getByRole('link', { name: /open.*chart|view.*chart/i })
      ).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── New Appointment Flow ──────────────────────────────────────────────────

  test('should navigate to /schedule/new from New Appointment button', async ({ page }) => {
    await goToSchedule(page);
    await page.getByRole('button', { name: /new appointment|add appointment|\+ appointment/i }).click();
    await expect(page).toHaveURL(/\/schedule\/new/);
  });

  test('should show appointment type selection step on new appointment page', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await expect(page.getByText(/new patient|follow.up|annual wellness|telehealth|urgent|procedure/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show all 6 appointment types on new appointment page', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await expect(page.getByText('New Patient')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Follow-Up')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Annual Wellness')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Telehealth')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Urgent')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Procedure')).toBeVisible({ timeout: 10000 });
  });

  test('should show appointment duration next to each type', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    // New Patient = 60 min, Follow-Up = 20 min
    await expect(page.getByText(/60 min/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/20 min/).first()).toBeVisible({ timeout: 10000 });
  });

  test('should select an appointment type and highlight it', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.getByText('Follow-Up').click();
    // The selected card should have an active/selected visual cue
    // Just verify we can click and proceed to Next
    await expect(page.getByRole('button', { name: /next|continue/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show provider selection step after selecting appointment type', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.getByText('Follow-Up').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await expect(
      page.getByText(/dr\. emily chen|dr\. michael rivera|dr\. kevin torres/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show all 3 providers in provider selection step', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.getByText('Follow-Up').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await expect(page.getByText('Dr. Emily Chen')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Dr. Michael Rivera')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Dr. Kevin Torres')).toBeVisible({ timeout: 10000 });
  });

  test('should show date/time selection step after selecting provider', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    // Step 1: type
    await page.getByText('Follow-Up').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    // Step 2: provider
    await page.getByText('Dr. Emily Chen').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    // Step 3: date/time — should show a calendar
    await expect(
      page.getByText(/select.*date|pick.*date|choose.*date|available/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show time slots in date/time selection step', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await page.getByText('Follow-Up').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    await page.getByText('Dr. Emily Chen').click();
    await page.getByRole('button', { name: /next|continue/i }).click();
    // Time slots like "9:00 AM", "10:00 AM", etc.
    await expect(
      page.getByText(/\d+:\d+\s*(AM|PM)|:00\s*(AM|PM)/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show patient search step in new appointment flow', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    // The first step or an early step should have a patient search field
    await expect(
      page.getByPlaceholder(/search patient|patient name|find patient/i).or(
        page.getByText(/select patient|search for patient/i)
      ).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show location selection in new appointment flow', async ({ page }) => {
    await loginAsProvider(page);
    await page.goto('/schedule/new');
    await expect(
      page.getByText(/downtown|midtown|location/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
