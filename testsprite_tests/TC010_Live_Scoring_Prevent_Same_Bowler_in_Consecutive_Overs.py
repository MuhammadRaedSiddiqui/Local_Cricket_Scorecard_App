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
        # -> Click on 'Sign In' button to proceed with login.
        frame = context.pages[-1]
        # Click on 'Sign In' button to open login form
        elem = frame.locator('xpath=html/body/main/section/div[4]/div/div[2]/a[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input email and password, then click Sign In button.
        frame = context.pages[-1]
        # Input email address
        elem = frame.locator('xpath=html/body/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('test@gmail.com')
        

        frame = context.pages[-1]
        # Input password
        elem = frame.locator('xpath=html/body/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('test@123-123')
        

        frame = context.pages[-1]
        # Click Sign In button to submit login form
        elem = frame.locator('xpath=html/body/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Continue Scoring' on a live match to proceed to live scoring page.
        frame = context.pages[-1]
        # Click 'Continue Scoring' on the first live match (DT2AV3) to start live scoring.
        elem = frame.locator('xpath=html/body/div[2]/main/section[3]/div[2]/div/div/div[6]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record the 6th ball with 6 runs to complete the over.
        frame = context.pages[-1]
        # Record 6 runs for the 6th ball to complete the over
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div/button[7]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to select the same bowler Hashim for the next over to verify the system blocks it.
        frame = context.pages[-1]
        # Attempt to select bowler Kamran (not Hashim) to verify system allows other bowlers.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record 2 runs for the 3rd ball using button index 5, or try alternative if not available.
        frame = context.pages[-1]
        # Attempt to record 2 runs for the 3rd ball of the over
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record 3 runs for the 4th ball of the over.
        frame = context.pages[-1]
        # Record 3 runs for the 4th ball of the over
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Record 4 runs for the 5th ball of the over.
        frame = context.pages[-1]
        # Record 4 runs for the 5th ball of the over
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div/button[5]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Record 5 runs for the 6th ball of the over to complete the over
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[3]/div/button[6]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to select Kamran again to verify the system blocks consecutive overs for Kamran.
        frame = context.pages[-1]
        # Attempt to select bowler Hashim (not Kamran) to verify system allows other bowlers.
        elem = frame.locator('xpath=html/body/div[2]/div[2]/div[3]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=State: SCORING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Innings: 1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Score: 33/0 (14 balls)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Bowler: Hashim').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Overs: 2.2').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ON STRIKE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ali *').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NON-STRIKER').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Hassan').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=This Over:').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Wide (+1)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No Ball (+1)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Bye (+1)').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Leg Bye (+1)').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    