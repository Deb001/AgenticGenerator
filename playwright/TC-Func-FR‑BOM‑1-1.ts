import { test, expect } from '@playwright/test';

test("TC-Func-FR‑BOM‑1-1 - Upload a valid Excel BOM snapshot through the BOM Upload UI", async ({ page }) => {
  const fileName = 'valid-bom.xlsx';
  const filePath = `tests/fixtures/${fileName}`;

  // Navigate to BOM Upload UI (adjust route if necessary)
  await page.goto('/bom/upload');
  await expect(page.locator('[data-testid="bom-upload-form"]')).toBeVisible();

  // Step 1: User selects the Browse button and chooses the Excel file
  await page.setInputFiles('[data-testid="bom-file-input"]', filePath);
  await expect(page.locator('[data-testid="selected-file-name"]')).toContainText(fileName);

  // Step 2: User clicks the Upload button
  await page.click('[data-testid="upload-button"]');
  const progress = page.locator('[data-testid="upload-progress"]');
  await expect(progress).toBeVisible();
  await expect(progress).toBeHidden({ timeout: 20000 });
  await expect(page.locator('[data-testid="upload-success"]')).toContainText('uploaded successfully');

  // Step 3: User navigates to the BOM history view
  await page.click('[data-testid="nav-bom-history"]');
  await expect(page.locator('[data-testid="bom-history-list"]')).toBeVisible();

  const historyList = page.locator('[data-testid="bom-history-list"]');
  const uploadedRow = historyList.locator(`text=${fileName}`).first();
  await expect(uploadedRow).toBeVisible();
  await expect(uploadedRow.locator('[data-testid="bom-history-timestamp"]')).toBeVisible();
  await expect(uploadedRow.locator('[data-testid="bom-history-status"]')).toHaveText(/(Completed|Success|Uploaded)/);
});