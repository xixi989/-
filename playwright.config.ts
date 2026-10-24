import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against a production build, not `next dev` — the numbers and the
 * rendering path should be the ones a reviewer will see.
 *
 * `channel: "msedge"` reuses the Edge that is already installed on this machine
 * instead of downloading a second Chromium. Swap to `chromium` (and run
 * `npx playwright install chromium`) on a fresh machine.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3400",
    channel: "msedge",
    locale: "en-US",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
    {
      // Mobile runs its own smoke suite: the flow tests are viewport-independent
      // and repeating them at 390px only re-tests the desktop suite smaller.
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        channel: "msedge",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3400",
    url: "http://127.0.0.1:3400",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
