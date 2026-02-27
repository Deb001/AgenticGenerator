import { test, expect } from '@playwright/test';

test("TC-Func-ST-2-1 - Verify panoramic sunroof is standard on premium trim and cannot be deselected", async ({ page }) => {
  // Preconditions: assume user is already logged in and on the configuration page
  await page.goto('[data-testid="TODO"]');

  // Step 1: Select premium trim from trim list
  const premiumTrimOption = page.locator('[data-testid="trim-option-premium"]');
  await premiumTrimOption.click();
  await expect(premiumTrimOption).toHaveClass(/selected/);
  await expect(page.locator('[data-testid="configuration-panel"]')).toBeVisible();

  // Step 2: Observe panoramic sunroof option in feature list
  const sunroofOption = page.locator('[data-testid="feature-panoramic-sunroof"]');
  await expect(sunroofOption).toBeChecked();
  await expect(sunroofOption).toBeDisabled();

  // Step 3: Attempt to deselect panoramic sunroof
  await sunroofOption.click({ force: true });
  await expect(sunroofOption).toBeChecked();
  await expect(sunroofOption).toBeDisabled();

  // Capture price before verification
  const priceLocator = page.locator('[data-testid="total-price"]');
  const priceBefore = await priceLocator.innerText();

  // Step 4: Check total price displayed
  await expect(priceLocator).toBeVisible();
  const priceAfter = await priceLocator.innerText();
  expect(priceAfter).toBe(priceBefore);
});