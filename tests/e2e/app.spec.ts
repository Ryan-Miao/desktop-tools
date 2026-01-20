/**
 * Application E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Application Launch', () => {
  test('should load main application', async ({ page }) => {
    await page.goto('/');

    // Check that main container is visible
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('should display plugin list', async ({ page }) => {
    await page.goto('/');

    // Check for plugin search
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Check for at least one plugin
    const plugins = page.locator('[data-testid="plugin-card"]');
    await expect(plugins.first()).toBeVisible();
  });
});

test.describe('Plugin Interactions', () => {
  test('should search for plugins', async ({ page }) => {
    await page.goto('/');

    // Type in search box
    const searchBox = page.locator('input[placeholder*="Search"]');
    await searchBox.fill('calculator');

    // Wait for filtered results
    await page.waitForTimeout(300);

    // Verify filtering worked
    const plugins = page.locator('[data-testid="plugin-card"]');
    const count = await plugins.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should open settings panel', async ({ page }) => {
    await page.goto('/');

    // Click settings button
    await page.click('[aria-label="打开设置"]');

    // Verify settings panel is visible
    await expect(page.locator('.settings-panel')).toBeVisible();
  });
});

test.describe('Theme Switching', () => {
  test('should switch between light and dark themes', async ({ page }) => {
    await page.goto('/');

    // Get initial theme
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('class');

    // Toggle theme
    await page.click('[aria-label="切换主题"]');
    await page.waitForTimeout(300);

    // Verify theme changed
    const newTheme = await htmlElement.getAttribute('class');
    expect(newTheme).not.toBe(initialTheme);
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button[aria-label]');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Check focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that main content is visible
    await expect(page.locator('.app-container')).toBeVisible();

    // Check mobile-specific layout
    const pluginList = page.locator('.plugin-list');
    await expect(pluginList).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Check that main content is visible
    await expect(page.locator('.app-container')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for main content to be visible
    await page.waitForSelector('.app-container');

    const loadTime = Date.now() - startTime;

    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check for errors
    expect(errors).toHaveLength(0);
  });
});
