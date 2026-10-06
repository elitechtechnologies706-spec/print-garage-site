import { defineConfig } from '@playwright/test';

// Always test a dedicated local instance, never the live SEO target.
const origin = 'http://127.0.0.1:4174';

export default defineConfig({
  testDir: './tests/quote',
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: origin,
    browserName: 'chromium',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    },
  },
  webServer: {
    command: 'pnpm run dev',
    url: `${origin}/request-a-quote`,
    env: { PORT: '4174', BASE_PATH: '/', NODE_ENV: 'production' },
    reuseExistingServer: false,
  },
});