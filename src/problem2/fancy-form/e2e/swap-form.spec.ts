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
  
  // More E2E tests would be added here to test the full form interaction
  // including selecting tokens, entering amounts, and submitting the form
});