import { test, expect } from '@playwright/test';

test('homepage loads and has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Gra Pow/i);
});

test('navigation to reservations works', async ({ page }) => {
  await page.goto('/');
  // Click the burger menu
  await page.click('button[aria-label="Open navigation menu"]');
  // Click Reservations in mobile menu
  await page.click('text=Reservations');
  await expect(page).toHaveURL(/.*reservations/);
  await expect(page.locator('h1')).toContainText(/Reservations/i);
});
