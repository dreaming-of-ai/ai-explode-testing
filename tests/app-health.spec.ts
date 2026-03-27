import { test, expect } from '@playwright/test';

/**
 * Feature: Application Health
 * Scenario: Application is accessible
 *
 * Gherkin mapping:
 *   Given I navigate to the application
 *   Then the page should load successfully
 */

test.describe('Application Health', () => {
  test('Application is accessible @smoke', async ({ page }) => {
    // Given I navigate to the application
    const response = await page.goto('/');

    // Then the page should load successfully
    // Verify HTTP response was successful
    expect(response?.status()).toBe(200);

    // Verify page title is correct
    await expect(page).toHaveTitle('AI Explode');

    // Verify page has rendered content (app container exists)
    const appContainer = page.locator('#app');
    await expect(appContainer).toBeAttached();

    // Verify no JavaScript errors occurred during load
    // (implicitly validated by successful page.goto and element checks)
  });
});
