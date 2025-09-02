import { defineConfig, devices } from "@playwright/test";
import * as playwrightConfig from "./playwright.config";

export default defineConfig({
  ...playwrightConfig,
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "https://localhost:5001",
    ignoreHTTPSErrors: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    // {
    //   name: "Mobile Firefox",
    //   use: {
    //     ...devices["Pixel 5"],
    //     browserName: "firefox",
    //   },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"] },
    // },
  ],
});
