import { test, expect } from '@playwright/test';

test('should record ball and update live score', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');

  // Navigate to scoring page
  await page.goto('/matches/123/score');

  // Select players and start scoring
  await page.selectOption('select[aria-label*="Striker"]', 'John Doe');
  await page.selectOption('select[aria-label*="Bowler"]', 'Jane Smith');
  await page.click('button:has-text("Start Scoring")');

  // Record a 4-run ball
  await page.click('button:has-text("4")');

  // Wait for Pusher to update
  await page.waitForTimeout(1000);

  // Verify score updated
  const score = await page.textContent('[data-testid="team-one-score"]');
  expect(score).toContain('4/0');
});