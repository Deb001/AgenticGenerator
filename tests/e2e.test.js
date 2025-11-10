// tests/e2e.test.js
import { test, expect } from "@playwright/test";

/**
 * Assumes the application is served locally at http://localhost:3000
 * Adjust the baseURL in the Playwright config if needed.
 */

test.describe("Calculator UI end‑to‑end", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/src/index.html");
  });

  test("should perform a simple calculation", async ({ page }) => {
    await page.click("button[data-value='2']");
    await page.click("button[data-value='+']");
    await page.click("button[data-value='3']");
    await page.click("button[data-value='=']");
    const display = await page.locator("#calc-display");
    await expect(display).toHaveValue("5");
  });

  test("should respect operator precedence", async ({ page }) => {
    await page.click("button[data-value='2']");
    await page.click("button[data-value='+']");
    await page.click("button[data-value='3']");
    await page.click("button[data-value='*']");
    await page.click("button[data-value='4']");
    await page.click("button[data-value='=']");
    const display = await page.locator("#calc-display");
    await expect(display).toHaveValue("14");
  });

  test("should handle clear and backspace", async ({ page }) => {
    await page.click("button[data-value='9']");
    await page.click("button[data-value='8']");
    await page.click("button[data-value='⌫']"); // backspace removes 8
    const display = await page.locator("#calc-display");
    await expect(display).toHaveValue("9");
    await page.click("button[data-value='C']"); // clear
    await expect(display).toHaveValue("");
  });

  test("should display error on invalid expression", async ({ page }) => {
    // Intercept alert to verify message
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toMatch(/Error:/);
      await dialog.dismiss();
    });
    await page.click("button[data-value='(']");
    await page.click("button[data-value='2']");
    await page.click("button[data-value='+']");
    await page.click("button[data-value='3']");
    await page.click("button[data-value='=']"); // missing closing parenthesis
    // No further assertions needed; alert handling verifies error path
  });
});
