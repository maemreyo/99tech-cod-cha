import { test, expect } from '@playwright/test';

test.describe('Swap Form', () => {
  test('should load the swap form', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to load
    await expect(page.getByText('Swap Tokens')).toBeVisible();
    await expect(page.getByText('Trade tokens instantly with the best rates')).toBeVisible();
    
    // Check form elements
    await expect(page.getByText('From')).toBeVisible();
    await expect(page.getByText('To')).toBeVisible();
    
    // Screenshot for visual verification
    await page.screenshot({ path: 'swap-form.png' });
  });
  
  test('should allow token selection', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the form to load
    await expect(page.getByText('Swap Tokens')).toBeVisible();
    
    // Click on the token selector
    await page.getByText('Select token').first().click();
    
    // Wait for token list to appear and select a token
    await expect(page.getByText('Select a token')).toBeVisible();
    
    // Select the first token in the list
    const firstToken = page.locator('.token-item').first();
    await firstToken.click();
    
    // Verify token was selected
    await expect(page.getByText('Select token').first()).not.toBeVisible();
  });
  
  // More E2E tests would be added here to test the full form interaction
  // including selecting tokens, entering amounts, and submitting the form
});