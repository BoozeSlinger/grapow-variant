import { test, expect, type Locator, type Page } from '@playwright/test';

// The table-request flow (spec §12.8, §14). Runs against the already-running dev server, which has NO booking
// channel configured, so a real submit must end in the honest "not sent" state, never in success.
// timezoneId is America/Los_Angeles (playwright.config.ts).

const FIXTURE = new Date('2026-10-02T12:00:00-07:00'); // Friday noon in LA; Saturday is "Tomorrow"
const NOT_CONFIGURED = "Online table requests aren't switched on yet — nothing was sent. Call (951) 780-1132 and we'll set it up.";
const GROUPS = 'For 9 or more, or for an event, please call (951) 780-1132.';

async function openSheet(page: Page): Promise<{ trigger: Locator; dialog: Locator }> {
  const trigger = page.locator('#site-header').getByRole('button', { name: 'Request a table' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Request a table' });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

async function fillDetails(dialog: Locator) {
  await dialog.getByLabel(/^Name/).fill('Test Guest');
  await dialog.getByLabel(/^Mobile/).fill('951 555 0123');
  await dialog.getByLabel(/^Email/).fill('guest@example.com');
  await dialog.getByLabel(/^Notes/).fill('Window seat if possible');
}

test.describe('booking sheet (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Tab stays inside, Esc closes, focus returns to the trigger', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' });
    const { trigger, dialog } = await openSheet(page);
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

    // A native modal dialog makes the page inert: Tab past the last control leaves the document (the browser's own
    // UI slot, seen here as <body>) and comes back to the first control. It must never reach the page behind.
    const where = () => page.evaluate(() => {
      const a = document.activeElement;
      return !a || a === document.body ? 'body' : a.closest('dialog[open]') ? 'dialog' : 'outside';
    });
    let wrapped = false;
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press('Tab');
      const w = await where();
      expect(w, `Tab #${i + 1} reached the page behind the dialog`).not.toBe('outside');
      if (w === 'body') wrapped = true;
      else if (wrapped) {
        await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused(); // back to the start of the dialog
        break;
      }
    }
    expect(wrapped, 'Tab never wrapped within 24 presses').toBe(true);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await where(), `Shift+Tab #${i + 1} reached the page behind the dialog`).not.toBe('outside');
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('party 4 · Sat · 7:00 PM reads back in the ticket and the review', async ({ page }) => {
    await page.clock.install({ time: FIXTURE });
    await page.goto('/about', { waitUntil: 'networkidle' });
    const { dialog } = await openSheet(page);
    await expect(dialog.getByText('Step 1 of 3')).toBeVisible();

    await dialog.getByRole('radio', { name: '4', exact: true }).check();
    await dialog.locator('input[name="bf-sheet-date"][value="2026-10-03"]').check();
    await dialog.locator('input[name="bf-sheet-time"][value="19:00"]').check();
    const summary = 'Table for 4 · Sat, Oct 3 · 7:00 PM';
    await expect(dialog.locator('.ticket-body p').first()).toHaveText(summary);

    await dialog.getByRole('button', { name: /^Next: your details/ }).click();
    await expect(dialog.getByText('Step 2 of 3')).toBeVisible();
    await fillDetails(dialog);
    await dialog.getByRole('button', { name: /^Next: review/ }).click();
    await expect(dialog.getByText('Step 3 of 3')).toBeVisible();
    await expect(dialog.locator('dl dd').first()).toHaveText(summary);
    await expect(dialog.getByRole('button', { name: 'Send request' })).toBeVisible();
  });

  test('a real submit ends in "not sent" with a Call link, never in success', async ({ page }) => {
    // Real clock: the server validates the date against its own clock, so use the nearest bookable day.
    await page.goto('/about', { waitUntil: 'networkidle' });
    const { dialog } = await openSheet(page);

    await dialog.getByRole('radio', { name: '4', exact: true }).check();
    await dialog.locator('input[name="bf-sheet-date"]').nth(1).check(); // tomorrow always has times
    await dialog.locator('input[name="bf-sheet-time"]').first().check();
    await dialog.getByRole('button', { name: /^Next: your details/ }).click();
    await fillDetails(dialog);
    await dialog.getByRole('button', { name: /^Next: review/ }).click();
    await dialog.getByRole('button', { name: 'Send request' }).click();

    const alert = dialog.getByRole('alert').filter({ hasText: NOT_CONFIGURED });
    await expect(alert).toBeVisible();
    await expect(dialog.getByRole('link', { name: /Call \(951\) 780-1132/ })).toBeVisible();
    await expect(dialog.getByText('Not sent')).toBeVisible();
    await expect(page.getByText(/requested/i)).toHaveCount(0);
    await expect(page.getByText(/confirmed|confirmation/i)).toHaveCount(0);
  });

  test('9+ swaps in the groups message and a Call link', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' });
    const { dialog } = await openSheet(page);
    await dialog.getByRole('radio', { name: '9+', exact: true }).check();
    await expect(dialog.getByText(GROUPS)).toBeVisible();
    await expect(dialog.getByRole('link', { name: /Call \(951\) 780-1132/ })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /^Next/ })).toHaveCount(0);
  });

  test('step 1 with nothing chosen shows the error summary and inline errors', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' });
    const { dialog } = await openSheet(page);
    await dialog.getByRole('button', { name: /^Next: your details/ }).click();
    const summary = dialog.getByRole('alert').filter({ hasText: 'to fix before we can send this' });
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(dialog.getByText('Choose how many guests.').first()).toBeVisible();
    await expect(dialog.getByText('Choose a date.').first()).toBeVisible();
  });
});

test.describe('/reservations', () => {
  test('submitting empty shows the error summary and inline errors (1440)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/reservations', { waitUntil: 'networkidle' });
    const form = page.locator('#booking-form');
    await form.getByRole('button', { name: 'Send request' }).click();

    const summary = form.getByRole('alert').filter({ hasText: 'to fix before we can send this' });
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('link')).toHaveCount(6);
    for (const msg of ['Choose how many guests.', 'Choose a date.', 'Choose a time.', 'Enter your name.', 'Enter a 10-digit mobile number.', 'Enter a valid email.']) {
      await expect(form.getByText(msg).first()).toBeVisible();
    }
    const name = form.getByLabel(/^Name/);
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await name.getAttribute('aria-describedby');
    expect(describedBy).toContain('-error');

    // An error link moves focus to its field.
    await summary.getByRole('link', { name: 'Enter your name.' }).click();
    await expect(name).toBeFocused();
    await name.fill('Test Guest');
    await expect(name).not.toHaveAttribute('aria-invalid', 'true'); // the error clears as it is fixed
  });

  test('keyboard: party, date and time are native radio groups', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/reservations', { waitUntil: 'networkidle' });
    const form = page.locator('#booking-form');
    const two = form.getByRole('radio', { name: '2', exact: true });
    await two.focus();
    await page.keyboard.press('ArrowRight');
    await expect(form.getByRole('radio', { name: '3', exact: true })).toBeChecked();
    await page.keyboard.press('ArrowRight');
    await expect(form.getByRole('radio', { name: '4', exact: true })).toBeChecked();
    await page.keyboard.press('ArrowLeft');
    await expect(form.getByRole('radio', { name: '3', exact: true })).toBeChecked();
  });

  test('at 390, a nav "Request a table" scrolls to #request-form instead of opening a sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/reservations', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole('button', { name: /^Menu/ }).click();
    const nav = page.getByRole('dialog').filter({ has: page.locator('#nav-sheet') });
    await expect(nav).toBeVisible();
    await nav.getByRole('button', { name: 'Request a table' }).click();

    await expect(page.getByRole('dialog', { name: 'Request a table' })).toBeHidden(); // no booking sheet
    await expect(nav).toBeHidden();
    await expect.poll(async () => page.evaluate(() => {
      const r = document.getElementById('request-form')!.getBoundingClientRect();
      return r.top < window.innerHeight * 0.5 && r.bottom > 0;
    })).toBe(true);
    // Focus lands in the form (the first control).
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('#request-form'))).toBe(true);
  });
});
