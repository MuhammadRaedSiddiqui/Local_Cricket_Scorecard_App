// Test landing page button navigation
const testLandingPageButtons = async () => {
  try {
    console.log('Testing landing page buttons...');
    
    // Navigate to home page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('Page loaded, looking for buttons...');
    
    // Check if buttons exist
    const getStartedButton = await page.locator('text=Get Started').first();
    const signInButton = await page.locator('text=Sign In').first();
    
    console.log('Get Started button found:', await getStartedButton.count());
    console.log('Sign In button found:', await signInButton.count());
    
    // Test Get Started button
    console.log('Clicking Get Started button...');
    await getStartedButton.click();
    await page.waitForTimeout(2000);
    
    console.log('Current URL after Get Started click:', page.url());
    
    // Go back and test Sign In button
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('Clicking Sign In button...');
    await signInButton.click();
    await page.waitForTimeout(2000);
    
    console.log('Current URL after Sign In click:', page.url());
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// This is a Playwright-style test
console.log('This would be a Playwright test for button navigation');