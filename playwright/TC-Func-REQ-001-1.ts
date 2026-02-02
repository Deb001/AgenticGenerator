import { test, expect } from '@playwright/test';

test("TC-Func-REQ-001-1 - Create a new customer with all mandatory and optional fields provided and verify that the record is saved correctly", async ({ page }) => {
  // Step 1: Navigate to the customer creation page
  await page.goto('https://example.com/customers/create');
  await expect(page.locator('[data-testid="customer-form"]')).toBeVisible();

  // Step 2: Enter a valid customer name
  const customerName = `Test Customer ${Date.now()}`;
  await page.fill('[data-testid="customer-name"]', customerName);
  await expect(page.locator('[data-testid="customer-name"]')).toHaveValue(customerName);

  // Step 3: Leave Customer Code field empty
  await page.fill('[data-testid="customer-code"]', '');
  // Expect system to generate code later; verification after save.

  // Step 4: Enter a valid primary phone number
  const primaryPhone = '1234567890';
  await page.fill('[data-testid="primary-phone"]', primaryPhone);
  await expect(page.locator('[data-testid="primary-phone"]')).toHaveValue(primaryPhone);

  // Step 5: Enter a valid secondary phone number
  const secondaryPhone = '0987654321';
  await page.fill('[data-testid="secondary-phone"]', secondaryPhone);
  await expect(page.locator('[data-testid="secondary-phone"]')).toHaveValue(secondaryPhone);

  // Step 6: Enter a valid primary email address
  const primaryEmail = 'primary@example.com';
  await page.fill('[data-testid="primary-email"]', primaryEmail);
  await expect(page.locator('[data-testid="primary-email"]')).toHaveValue(primaryEmail);

  // Step 7: Enter a valid secondary email address
  const secondaryEmail = 'secondary@example.com';
  await page.fill('[data-testid="secondary-email"]', secondaryEmail);
  await expect(page.locator('[data-testid="secondary-email"]')).toHaveValue(secondaryEmail);

  // Step 8: Enter a complete billing address including a numeric pincode
  await page.fill('[data-testid="billing-address-line1"]', '123 Billing St');
  await page.fill('[data-testid="billing-city"]', 'BillingCity');
  await page.fill('[data-testid="billing-pincode"]', '123456');
  await expect(page.locator('[data-testid="billing-pincode"]')).toHaveValue('123456');

  // Step 9: Enter a different shipping address including a numeric pincode
  await page.fill('[data-testid="shipping-address-line1"]', '456 Shipping Ave');
  await page.fill('[data-testid="shipping-city"]', 'ShippingCity');
  await page.fill('[data-testid="shipping-pincode"]', '654321');
  await expect(page.locator('[data-testid="shipping-pincode"]')).toHaveValue('654321');

  // Step 10: Ensure Same as Billing flag is unchecked
  const sameAsBilling = page.locator('[data-testid="same-as-billing"]');
  if (await sameAsBilling.isChecked()) {
    await sameAsBilling.uncheck();
  }
  await expect(sameAsBilling).not.toBeChecked();

  // Step 11: Enter a positive integer in the Net Payment Terms field
  const paymentTerms = '30';
  await page.fill('[data-testid="net-payment-terms"]', paymentTerms);
  await expect(page.locator('[data-testid="net-payment-terms"]')).toHaveValue(paymentTerms);

  // Step 12: Select Customer Category as Gold from the dropdown
  await page.selectOption('[data-testid="customer-category"]', { label: 'Gold' });
  await expect(page.locator('[data-testid="customer-category"]')).toHaveValue('Gold');

  // Step 13: Enter a credit limit value in the Credit Limit field
  const creditLimit = '5000';
  await page.fill('[data-testid="credit-limit"]', creditLimit);
  await expect(page.locator('[data-testid="credit-limit"]')).toHaveValue(creditLimit);

  // Step 14: Select Preferred Communication Channel as Both
  await page.check('[data-testid="comm-channel-both"]');
  await expect(page.locator('[data-testid="comm-channel-both"]')).toBeChecked();

  // Step 15: Select an assigned sales representative from the list
  await page.selectOption('[data-testid="sales-rep"]', { label: 'John Doe' });
  await expect(page.locator('[data-testid="sales-rep"]')).toHaveValue('John Doe');

  // Step 16: Select Customer Status as Active
  await page.selectOption('[data-testid="customer-status"]', { label: 'Active' });
  await expect(page.locator('[data-testid="customer-status"]')).toHaveValue('Active');

  // Step 17: Click the Save button
  await page.click('[data-testid="save-button"]');

  // Verify success message and generated fields
  const successToast = page.locator('[data-testid="toast-success"]');
  await expect(successToast).toBeVisible();
  await expect(successToast).toContainText('Customer saved successfully');

  const generatedCode = page.locator('[data-testid="generated-customer-code"]');
  await expect(generatedCode).toBeVisible();
  await expect(generatedCode).not.toHaveText('');

  const registrationDate = page.locator('[data-testid="registration-date"]');
  await expect(registrationDate).toBeVisible();
  const today = new Date().toISOString().split('T')[0];
  await expect(registrationDate).toContainText(today);
});