import { test, expect, type Page } from '@playwright/test';
import { SITE_ROUTES } from '../src/data/nav';

// Structure checks for every public route (spec §17.6). Runs against the already-running dev server.

const TITLE = /Gra Pow/;

async function collect(page: Page, path: string) {
  const bad: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
  });
  const res = await page.goto(path, { waitUntil: 'networkidle' });
  return { res, bad };
}

for (const route of SITE_ROUTES) {
  test(`structure: ${route}`, async ({ page, request }) => {
    const { res, bad } = await collect(page, route);
    expect(res?.status(), `${route} status`).toBe(200);
    await expect(page).toHaveTitle(TITLE);

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#site-header')).toHaveCount(1);
    await expect(page.locator('#site-footer')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await expect(page.locator('a.skip-link[href="#main"]')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);

    // Every internal href returns 200; every #hash target exists.
    const hrefs = await page.$$eval('a[href]', (as) => [...new Set(as.map((a) => a.getAttribute('href') ?? ''))]);
    const internal = hrefs.filter((h) => h.startsWith('/') || h.startsWith('#'));
    const pages = new Map<string, string | null>();
    for (const href of internal) {
      const [pathAndQuery, hash] = href.split('#');
      const target = pathAndQuery || route;
      if (!pages.has(target)) {
        const r = await request.get(target);
        expect(r.status(), `${href} (linked from ${route})`).toBe(200);
        pages.set(target, target.split('?')[0] === route ? null : await r.text());
      }
      if (hash) {
        const html = pages.get(target);
        if (html === null) {
          await expect(page.locator(`[id="${hash}"]`), `#${hash} on ${route}`).toHaveCount(1);
        } else {
          expect(html, `#${hash} on ${target} (linked from ${route})`).toContain(`id="${hash}"`);
        }
      }
    }

    expect(bad, `4xx/5xx requests on ${route}`).toEqual([]);
  });
}

test('admin has no public chrome and is not indexed', async ({ page }) => {
  const { res } = await collect(page, '/admin/reservations');
  expect(res?.status()).toBe(200);
  await expect(page.locator('#site-header')).toHaveCount(0);
  await expect(page.locator('#site-footer')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('robots and sitemap', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/Disallow: \/admin/);
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const route of SITE_ROUTES.filter((r) => r !== '/')) expect(xml).toContain(`${route}</loc>`);
});
