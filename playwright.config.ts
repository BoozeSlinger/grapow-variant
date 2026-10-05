import { defineConfig, devices } from '@playwright/test';

// Runs against the already-running dev server (no webServer block).
// Chromium: set PW_CHROMIUM_PATH to a locally installed headless shell when the bundled build is missing.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    timezoneId: 'America/Los_Angeles',
    trace: 'on-first-retry',
    launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
