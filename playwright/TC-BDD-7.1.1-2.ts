import { test, expect } from '@playwright/test';

test("TC-BDD-7.1.1-2 - Create new customer with optional fields omitted", async ({ page }) => {
  // Navigate to the customer creation page
  await page.goto('https://example.com/customers/new'); // replace with actual URL

  // Open the new customer form
  await page.locator('[data-testid="new-customer-button"]').click();

  // Fill in required fields
  await page.locator('[data-testid="customer-name"]').fill('John Doe');
  await page.locator('[data-testid="customer-email"]').fill('john.doe@example.com');

  // Optional fields are omitted

  // Submit the form
  await page.locator('[data-testid="submit-customer"]').click();

  // Verify success message
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="success-message"]')).toContainText('Customer created successfully');
});