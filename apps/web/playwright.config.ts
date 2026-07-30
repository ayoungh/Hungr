import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3310",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @hungr/api test:browser:server",
      url: "http://127.0.0.1:4310/healthz",
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command:
        "API_ORIGIN=http://127.0.0.1:4310 pnpm --filter @hungr/web exec next dev -p 3310",
      url: "http://127.0.0.1:3310",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
