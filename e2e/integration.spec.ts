import { test, expect } from '@playwright/test';
import { SITE_ROUTES } from '../src/data/nav';

// Cross-cutting regressions found while integrating the redesign. Runs against the already-running dev server.

// 640/641 is where the footer's half-width hours column first appears; 720 is where its table stops overflowing.
const WIDTHS = [320, 390, 640, 641, 720, 768, 1024, 1440];

for (const route of SITE_ROUTES) {
  test(`no horizontal overflow: ${route}`, async ({ page }) => {
    test.setTimeout(120_000); // eight dev-server page loads per route
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route, { waitUntil: 'networkidle' });
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `${route} at ${width}px`).toBe(clientWidth);
    }
  });
}

test('an open sheet or pad never adds a second banner or contentinfo landmark', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/menu/food', { waitUntil: 'networkidle' });
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);

  // The host pad is non-modal, so the page behind it stays in the accessibility tree.
  await page.locator('#host-tab').click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);

  // Opening the booking sheet replaces the pad: still one overlay, still one of each landmark.
  await page.getByRole('button', { name: /request a table/i }).first().click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
});
