import { test, expect } from '@playwright/test';

test("TC-BDD-ST-3-1 - Create interior design using leather material successfully", async ({ page }) => {
  // Navigate to the application (replace with actual URL)
  await page.goto('https://your-app-url.com');

  // Step 1: Open interior design creation interface
  const openCreate = page.locator('[data-testid="TODO"]');
  await openCreate.click();

  // Step 2: Choose leather material
  const materialOption = page.locator('[data-testid="TODO"]');
  await materialOption.click();

  // Step 3: Confirm creation
  const confirmButton = page.locator('[data-testid="TODO"]');
  await confirmButton.click();

  // Expected result: interior design created successfully
  const successAlert = page.locator('[data-testid="TODO"]');
  await expect(successAlert).toBeVisible();
});