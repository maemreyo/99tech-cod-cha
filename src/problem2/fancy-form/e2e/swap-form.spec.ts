import { test, expect } from '@playwright/test';

test.describe('Swap Form', () => {
  test('should load the swap form', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to load
    await expect(page.getByRole('heading', { name: 'Swap Tokens' })).toBeVisible();
    await expect(page.getByText('Trade tokens instantly with the best rates')).toBeVisible();
    
    // Check form elements
    await expect(page.getByText('From', { exact: true })).toBeVisible();
    await expect(page.getByText('To (estimated)')).toBeVisible();
    
    // Screenshot for visual verification
    await page.screenshot({ path: 'swap-form.png' });
  });
  
  test('should allow token selection', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to load
    await expect(page.getByRole('heading', { name: 'Swap Tokens' })).toBeVisible();
    
    // Click on the token selector (using more specific selector)
    await page.locator('.token-selector-dropdown').first().click();
    
    // Wait for token list to appear
    await expect(page.getByPlaceholder('Search token')).toBeVisible();
    
    // Select the first token in the list (using more specific selector)
    await page.locator('.ant-select-item-option').first().click();
    
    // Verify token was selected (the placeholder should no longer be visible)
    await expect(page.getByPlaceholder('Select token')).not.toBeVisible();
  });
  
  test('should allow entering amount', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to load
    await expect(page.getByRole('heading', { name: 'Swap Tokens' })).toBeVisible();
    
    // Select tokens first - only select the first token
    await page.locator('.token-selector-dropdown').first().click();
    await page.locator('.ant-select-item-option').first().click();
    
    // Enter amount in the input field
    const amountInput = page.locator('.amount-input').first();
    await amountInput.fill('1.5');
    
    // Verify the amount was entered
    await expect(amountInput).toHaveValue('1.5');
  });
  
  test('should show MAX button and allow clicking it', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to load
    await expect(page.getByRole('heading', { name: 'Swap Tokens' })).toBeVisible();
    
    // Select a token first
    await page.locator('.token-selector-dropdown').first().click();
    await page.locator('.ant-select-item-option').first().click();
    
    // Check if MAX button appears
    await expect(page.getByText('MAX')).toBeVisible();
    
    // Click MAX button
    await page.getByText('MAX').click();
    
    // Verify that the input field has a value (should be filled with max balance)
    const amountInput = page.locator('.amount-input').first();
    await expect(amountInput).not.toHaveValue('');
    await expect(amountInput).not.toHaveValue('0');
  });
  
  test('should have swap buttons', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to load
    await expect(page.getByRole('heading', { name: 'Swap Tokens' })).toBeVisible();
    
    // Check if the swap direction button exists
    await expect(page.locator('.swap-rotate-button')).toBeVisible();
    
    // Check if the submit button exists
    await expect(page.locator('.submit-button')).toBeVisible();
  });
  
  test('should show validation error for invalid amount', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to load
    await expect(page.getByRole('heading', { name: 'Swap Tokens' })).toBeVisible();
    
    // Select a token first
    await page.locator('.token-selector-dropdown').first().click();
    await page.locator('.ant-select-item-option').first().click();
    
    // Enter invalid amount (zero)
    const amountInput = page.locator('.amount-input').first();
    await amountInput.fill('0');
    
    // Click somewhere else to trigger validation
    await page.getByText('From', { exact: true }).click();
    
    // Try to click the swap button to trigger validation
    const swapButton = page.getByRole('button', { name: 'Swap' });
    if (await swapButton.isVisible()) {
      await swapButton.click();
    }
    
    // Verify the button is disabled or there's an error message
    const isButtonDisabled = await page.locator('button[disabled]').count() > 0;
    expect(isButtonDisabled).toBeTruthy();
  });
});