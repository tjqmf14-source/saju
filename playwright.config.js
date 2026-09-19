import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests-visual',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'tablet', use: { browserName: 'chromium', ...devices['Desktop Chrome'], viewport: { width: 1024, height: 1366 } } },
    { name: 'compact', use: { browserName: 'chromium', ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'mobile', use: { browserName: 'chromium', ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'mobile-wide', use: { browserName: 'chromium', ...devices['Desktop Chrome'], viewport: { width: 412, height: 915 } } },
    { name: 'mobile-small', use: { browserName: 'chromium', ...devices['Desktop Chrome'], viewport: { width: 320, height: 720 } } },
  ],
});
