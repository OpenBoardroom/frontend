import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.spec.ts",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://localhost:8787", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/fixture-github.ts",
      url: "http://localhost:8788/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      // GITHUB_API_BASE is passed with --var for e2e only; wrangler.jsonc never has it.
      command:
        "node e2e/prepare-worker-config.ts && pnpm exec wrangler dev -c build/server/wrangler.e2e.json --port 8787 --var GITHUB_API_BASE:http://localhost:8788",
      url: "http://localhost:8787",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    },
  ],
});
