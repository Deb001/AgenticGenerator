import { test, expect } from '@playwright/test';

test("TC-BDD-ST-3-2 - Create interior design using a mix of leather and plastic within allowed limits", async ({ page }) => {
  await page.locator('[data-testid="TODO"]').click();
  await expect(page.locator('[data-testid="TODO"]')).toBeVisible();
});