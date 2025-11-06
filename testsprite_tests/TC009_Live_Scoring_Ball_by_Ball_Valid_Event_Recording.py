import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on 'Get Started' button to begin the scoring process.
        frame = context.pages[-1]
        # Click on 'Get Started' button to open live scoring interface for an ongoing match.
        elem = frame.locator('xpath=html/body/main/section/div[4]/div/div[2]/a/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill the registration form with Full Name, Email, Password, Confirm Password and submit.
        frame = context.pages[-1]
        # Input Full Name
        elem = frame.locator('xpath=html/body/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test User')
        

        frame = context.pages[-1]
        # Input Email Address
        elem = frame.locator('xpath=html/body/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('test@gmail.com')
        

        frame = context.pages[-1]
        # Input Password
        elem = frame.locator('xpath=html/body/div[2]/div/form/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('test@123-123')
        

        frame = context.pages[-1]
        # Input Confirm Password
        elem = frame.locator('xpath=html/body/div[2]/div/form/div[4]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('test@123-123')
        

        frame = context.pages[-1]
        # Click on Sign Up button to submit the registration form
        elem = frame.locator('xpath=html/body/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Sign in' link to navigate to login page and attempt login with created credentials.
        frame = context.pages[-1]
        # Click on 'Sign in' link to navigate to login page for existing user login.
        elem = frame.locator('xpath=html/body/div[2]/div/p/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password, then click Sign In button to log in.
        frame = context.pages[-1]
        # Input Email Address
        elem = frame.locator('xpath=html/body/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('test@gmail.com')
        

        frame = context.pages[-1]
        # Input Password
        elem = frame.locator('xpath=html/body/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('test@123-123')
        

        frame = context.pages[-1]
        # Click on Sign In button to submit login form
        elem = frame.locator('xpath=html/body/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Continue Scoring' button for the first live match to open the live scoring interface.
        frame = context.pages[-1]
        # Click on 'Continue Scoring' button for the first live match (DT2AV3) to open live scoring interface.
        elem = frame.locator('xpath=html/body/div[2]/main/section[3]/div[2]/div/div/div[6]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record a valid ball event with runs (e.g., 1 run) and verify the update, strike rotation, and bowler management.
        frame = context.pages[-1]
        # Record 1 run for the current ball.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select Kamran as the new bowler for the next over to continue scoring.
        frame = context.pages[-1]
        # Select Kamran as the new bowler for the next over.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record an extra ball event (e.g., Wide) and verify the score and ball count update correctly.
        frame = context.pages[-1]
        # Record a Wide extra (+1 run) ball event.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record a wicket event to verify out count increment, striker update, and score update.
        frame = context.pages[-1]
        # Record a wicket (W) event for the current ball.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div/button[8]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select Ahmed as the next batsman to continue the innings.
        frame = context.pages[-1]
        # Select Ahmed as the next batsman after wicket.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record a valid run event of 4 runs and verify the score, strike rotation, and ball count update correctly.
        frame = context.pages[-1]
        # Record 4 runs for the current ball.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div/button[5]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record a No Ball extra (+1) and verify the score and ball count update correctly without changing the striker.
        frame = context.pages[-1]
        # Record a No Ball extra (+1) event.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record a Bye (+1) extra and verify the score and ball count update correctly without changing the striker.
        frame = context.pages[-1]
        # Record a Bye (+1) extra event.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div[2]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Back').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DT2AV3').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LIVE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=State: SCORING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Innings: 1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Batsman1: Ahmed (ON STRIKE)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Batsman2: Hassan').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Bowler: Kamran').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Score: 19/1 (9 balls)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Out: [Ali]').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Available: Usman, Raza').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=BATTING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Strikers').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=19/1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Overs: 1.3').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=BOWLING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Defenders').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ON STRIKE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ahmed *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NON-STRIKER').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Hassan').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=BOWLER').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Kamran').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=This Over:').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=WD').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=W').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=4').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NB').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=B').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Record Ball').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=0').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=3').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=4').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=5').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=6').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=W').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Extras (Simplified)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Wide (+1)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No Ball (+1)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Bye (+1)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Leg Bye (+1)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=All extras add 1 run only (simplified)').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    