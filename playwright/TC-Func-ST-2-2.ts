import { test, expect } from '@playwright/test';

test("TC-Func-ST-2-2 - Verify panoramic sunroof can be added as optional feature on mid-variant trim", async ({ page }) => {
  // Preconditions: assume user is already logged in and default configuration is displayed

  // Step 1: Select mid-variant trim from trim list
  const midVariantTrim = page.locator('[data-testid="trim-mid-variant"]');
  await midVariantTrim.click();
  await expect(midVariantTrim).toHaveClass(/selected/);
  // Optionally verify configuration panel updates
  const configPanel = page.locator('[data-testid="configuration-panel"]');
  await expect(configPanel).toContainText('Mid-variant');

  // Step 2: Locate panoramic sunroof option in optional features
  const sunroofOption = page.locator('[data-testid="option-panoramic-sunroof"]');
  await expect(sunroofOption).toBeVisible();
  await expect(sunroofOption).not.toBeChecked();

  // Capture price before any selection
  const priceLocator = page.locator('[data-testid="total-price"]');
  const priceBeforeText = await priceLocator.innerText();
  const priceBefore = parseFloat(priceBeforeText.replace(/[^0-9.]/g, ''));

  // Step 3: Select panoramic sunroof option
  await sunroofOption.check();
  await expect(sunroofOption).toBeChecked();

  const priceAfterSelectText = await priceLocator.innerText();
  const priceAfterSelect = parseFloat(priceAfterSelectText.replace(/[^0-9.]/g, ''));
  await expect(priceAfterSelect).toBeGreaterThan(priceBefore);

  // Step 4: Deselect panoramic sunroof option
  await sunroofOption.uncheck();
  await expect(sunroofOption).not.toBeChecked();

  const priceAfterDeselectText = await priceLocator.innerText();
  const priceAfterDeselect = parseFloat(priceAfterDeselectText.replace(/[^0-9.]/g, ''));
  await expect(priceAfterDeselect).toBeCloseTo(priceBefore, 2);
});