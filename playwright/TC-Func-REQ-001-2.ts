import { test, expect } from '@playwright/test';

test("TC-Func-REQ-001-2 - Create a new customer with Same as Billing flag set to true and verify that shipping address is copied from billing address", async ({ page }) => {
  // Step 1: Navigate to the customer creation page
  await page.goto('https://yourapp.example.com/customers/create');
  await expect(page.locator('[data-testid="customer-form"]')).toBeVisible();

  // Step 2: Enter a valid customer name
  const customerName = 'Test Customer';
  await page.fill('[data-testid="customer-name"]', customerName);
  await expect(page.locator('[data-testid="customer-name"]')).toHaveValue(customerName);

  // Step 3: Enter a valid primary phone number
  const phoneNumber = '5551234567';
  await page.fill('[data-testid="primary-phone"]', phoneNumber);
  await expect(page.locator('[data-testid="primary-phone"]')).toHaveValue(phoneNumber);

  // Step 4: Enter a valid primary email address
  const email = 'test.customer@example.com';
  await page.fill('[data-testid="primary-email"]', email);
  await expect(page.locator('[data-testid="primary-email"]')).toHaveValue(email);

  // Step 5: Enter a complete billing address with a numeric pincode
  const billingAddress = {
    line1: '123 Main St',
    line2: 'Suite 100',
    city: 'Metropolis',
    state: 'NY',
    pincode: '12345'
  };
  await page.fill('[data-testid="billing-address-line1"]', billingAddress.line1);
  await page.fill('[data-testid="billing-address-line2"]', billingAddress.line2);
  await page.fill('[data-testid="billing-city"]', billingAddress.city);
  await page.fill('[data-testid="billing-state"]', billingAddress.state);
  await page.fill('[data-testid="billing-pincode"]', billingAddress.pincode);
  await expect(page.locator('[data-testid="billing-pincode"]')).toHaveValue(billingAddress.pincode);

  // Step 6: Check the Same as Billing flag
  await page.check('[data-testid="same-as-billing-checkbox"]');
  await expect(page.locator('[data-testid="same-as-billing-checkbox"]')).toBeChecked();
  await expect(page.locator('[data-testid="shipping-address-line1"]')).toBeDisabled();
  await expect(page.locator('[data-testid="shipping-city"]')).toBeDisabled();

  // Step 7: Leave shipping address fields empty and verify auto-copy
  await expect(page.locator('[data-testid="shipping-address-line1"]')).toHaveValue(billingAddress.line1);
  await expect(page.locator('[data-testid="shipping-address-line2"]')).toHaveValue(billingAddress.line2);
  await expect(page.locator('[data-testid="shipping-city"]')).toHaveValue(billingAddress.city);
  await expect(page.locator('[data-testid="shipping-state"]')).toHaveValue(billingAddress.state);
  await expect(page.locator('[data-testid="shipping-pincode"]')).toHaveValue(billingAddress.pincode);

  // Step 8: Enter a positive integer for Net Payment Terms
  const netPaymentTerms = '30';
  await page.fill('[data-testid="net-payment-terms"]', netPaymentTerms);
  await expect(page.locator('[data-testid="net-payment-terms"]')).toHaveValue(netPaymentTerms);

  // Step 9: Select Customer Category as Silver
  await page.selectOption('[data-testid="customer-category"]', { label: 'Silver' });
  await expect(page.locator('[data-testid="customer-category"]')).toHaveValue('Silver');

  // Step 10: Select Preferred Communication Channel as Email
  await page.selectOption('[data-testid="preferred-communication"]', { label: 'Email' });
  await expect(page.locator('[data-testid="preferred-communication"]')).toHaveValue('Email');

  // Step 11: Assign a sales representative
  await page.selectOption('[data-testid="sales-representative"]', { label: 'John Doe' });
  await expect(page.locator('[data-testid="sales-representative"]')).toHaveValue('John Doe');

  // Step 12: Select Customer Status as Active
  await page.selectOption('[data-testid="customer-status"]', { label: 'Active' });
  await expect(page.locator('[data-testid="customer-status"]')).toHaveValue('Active');

  // Step 13: Click Save
  await page.click('[data-testid="save-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});