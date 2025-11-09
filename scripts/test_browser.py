#!/usr/bin/env python3
"""
Simple script to test Chrome CDP connection
"""
import sys
import json
from playwright.sync_api import sync_playwright
from datetime import datetime

def log(message, level="info"):
    """Output structured logs"""
    timestamp = datetime.now().isoformat()
    print(json.dumps({
        "timestamp": timestamp,
        "level": level,
        "message": message
    }), flush=True)

def main():
    if len(sys.argv) < 2:
        log("Error: CDP URL not provided", "error")
        log("Usage: python test_browser.py <cdp_url> [password]", "error")
        sys.exit(1)

    cdp_url = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) > 2 else None

    log(f"Starting browser connection with CDP URL: {cdp_url}")
    if password:
        log("Password provided - will auto-login")

    try:
        with sync_playwright() as p:
            log("Connecting to remote browser...")
            browser = p.chromium.connect_over_cdp(cdp_url)
            log("✓ Successfully connected to browser", "success")

            # Get or create context
            if len(browser.contexts) > 0:
                log("Using existing browser context")
                context = browser.contexts[0]
            else:
                log("Creating new browser context")
                context = browser.new_context()

            # Create a new page
            log("Creating new page...")
            page = context.new_page()
            log("✓ Page created successfully", "success")

            # Navigate to Lawmatics dashboard (will redirect to login if not logged in)
            log("Navigating to https://app.lawmatics.com/dashboard...")
            page.goto("https://app.lawmatics.com/dashboard", wait_until="domcontentloaded")
            log(f"✓ Successfully navigated to: {page.url}", "success")

            # Wait for page to load
            page.wait_for_timeout(2000)

            # Poll for login redirect (server may take time to redirect)
            log("Checking if login redirect occurs...")
            max_checks = 6  # 6 checks * 500ms = 3 seconds
            for i in range(max_checks):
                current_url = page.url.lower()
                log(f"Check {i+1}/{max_checks}: Current URL - {page.url}")

                if "/login" in current_url:
                    log("✓ Login page detected after redirect", "success")
                    break

                page.wait_for_timeout(500)  # Wait 500ms between checks

            # Check if we need to login
            if password and "/login" in page.url.lower():
                log("Login page detected - starting auto-login process...")

                # Step 1: Find and click the login button
                log("Looking for login button...")
                login_found = False

                # Try multiple strategies for Lawmatics login button
                try:
                    # Strategy 1: Try text-based search for common Google login text
                    log("Strategy 1: Trying to find login button by text...")
                    login_text_options = ["Sign in with Google", "Continue with Google", "Google", "Sign in"]
                    for text_option in login_text_options:
                        try:
                            login_by_text = page.get_by_role("button", name=text_option)
                            if login_by_text.count() > 0:
                                log(f"✓ Found login button with text '{text_option}'", "success")
                                login_by_text.first.click()
                                login_found = True
                                break
                        except:
                            pass

                    # Strategy 2: Look for button containing Google icon/text anywhere
                    if not login_found:
                        log("Strategy 2: Looking for button containing 'Google'...")
                        try:
                            google_buttons = page.locator("button:has-text('Google')")
                            count = google_buttons.count()
                            log(f"Found {count} button(s) containing 'Google'")
                            if count > 0:
                                google_buttons.first.click()
                                log("✓ Clicked button via has-text('Google')", "success")
                                login_found = True
                        except Exception as e:
                            log(f"Strategy 2 failed: {str(e)}", "warning")

                    # Strategy 3: Try original XPath
                    if not login_found:
                        log("Strategy 3: Trying original XPath for login button...")
                        try:
                            login_button_xpath = "/html/body/div[1]/div[1]/div[1]/div/div[2]/button[1]/div/span/span"
                            login_button = page.locator(f"xpath={login_button_xpath}")
                            login_button.wait_for(state="visible", timeout=5000)
                            log("✓ Found login button via XPath", "success")
                            login_button.click()
                            login_found = True
                        except Exception as e:
                            log(f"Strategy 3 failed: {str(e)}", "warning")

                    # Strategy 4: Look for any button in the login area
                    if not login_found:
                        log("Strategy 4: Looking for any clickable button...")
                        try:
                            all_buttons = page.locator("button")
                            count = all_buttons.count()
                            log(f"Found {count} total buttons on page")
                            # Try to click the first visible button
                            for i in range(count):
                                button = all_buttons.nth(i)
                                if button.is_visible():
                                    button_text = button.text_content() or ""
                                    log(f"Trying button {i}: '{button_text}'")
                                    button.click()
                                    login_found = True
                                    log(f"✓ Clicked button {i}", "success")
                                    break
                        except Exception as e:
                            log(f"Strategy 4 failed: {str(e)}", "warning")

                    if login_found:
                        log("✓ Clicked login button - waiting for Google login redirect...", "success")
                    else:
                        # Take screenshot for debugging
                        try:
                            screenshot_path = "/tmp/lawmatics_login_debug.png"
                            page.screenshot(path=screenshot_path)
                            log(f"📸 Debug screenshot saved to: {screenshot_path}", "warning")
                        except:
                            pass

                        log(f"Current page title: {page.title()}", "warning")
                        log(f"Current page URL: {page.url}", "warning")
                        raise Exception("Could not find Lawmatics login button")

                    # Wait for Google login page
                    page.wait_for_timeout(1000)
                    log(f"Current URL: {page.url}")

                    # Step 2: Click on account selection (jonathan@legaleasemarketing.com)
                    log("Looking for Google account selection...")

                    # Try multiple selector strategies
                    account_found = False

                    # Strategy 1: Try by exact text content
                    log("Strategy 1: Looking for account by text content...")
                    try:
                        account_by_text = page.get_by_text("jonathan@legaleasemarketing.com")
                        if account_by_text.count() > 0:
                            log(f"✓ Found {account_by_text.count()} element(s) with the email text", "success")
                            account_by_text.first.click()
                            log("✓ Clicked account via text selector", "success")
                            account_found = True
                    except Exception as e:
                        log(f"Strategy 1 failed: {str(e)}", "warning")

                    # Strategy 2: Try original XPath if text search failed
                    if not account_found:
                        log("Strategy 2: Trying original XPath selector...")
                        try:
                            account_xpath = "/html/body/div[1]/div[1]/div[2]/div/div/div[2]/div/div/div[1]/form/span/section/div/div/div/div/ul/li[1]/div/div[1]/div"
                            account_selector = page.locator(f"xpath={account_xpath}")
                            account_selector.wait_for(state="visible", timeout=5000)
                            log("✓ Found account via XPath", "success")

                            account_text = account_selector.text_content()
                            log(f"Account element text: '{account_text}'")

                            account_selector.click()
                            log("✓ Clicked account via XPath", "success")
                            account_found = True
                        except Exception as e:
                            log(f"Strategy 2 failed: {str(e)}", "warning")

                    # Strategy 3: Try to find any div containing the email
                    if not account_found:
                        log("Strategy 3: Looking for any div containing the email...")
                        try:
                            account_divs = page.locator("div:has-text('jonathan@legaleasemarketing.com')")
                            count = account_divs.count()
                            log(f"Found {count} divs containing the email")

                            if count > 0:
                                # Click the first one
                                account_divs.first.click()
                                log("✓ Clicked account via div:has-text", "success")
                                account_found = True
                        except Exception as e:
                            log(f"Strategy 3 failed: {str(e)}", "warning")

                    if not account_found:
                        log("ERROR: Could not find Google account selector with any strategy!", "error")

                        # Take a screenshot for debugging
                        try:
                            screenshot_path = "/tmp/google_login_debug.png"
                            page.screenshot(path=screenshot_path)
                            log(f"📸 Debug screenshot saved to: {screenshot_path}", "warning")
                        except Exception as e:
                            log(f"Could not save screenshot: {str(e)}", "warning")

                        # Log current page title and URL
                        log(f"Current page title: {page.title()}", "warning")
                        log(f"Current page URL: {page.url}", "warning")

                        log("Please check the page manually or update the selectors", "error")
                        raise Exception("Failed to find Google account selector")

                    # Wait for password page
                    page.wait_for_timeout(2000)
                    log("Waiting for password dialog...")

                    # Step 3: Enter password
                    log("Looking for password field...")
                    # Try common password input selectors
                    password_field = page.locator("input[type='password']").first
                    password_field.wait_for(state="visible", timeout=10000)
                    log("✓ Found password field", "success")

                    log("Entering password...")
                    password_field.fill(password)
                    log("✓ Password entered", "success")

                    # Step 4: Press Enter
                    log("Pressing Enter to submit...")
                    password_field.press("Enter")
                    log("✓ Submitted password", "success")

                    # Step 5: Poll for 2FA completion
                    log("⏸️  WAITING FOR 2FA - Please enter your 2FA code in the browser window", "warning")
                    log("Polling every 3 seconds to detect when authentication is complete...", "warning")

                    max_attempts = 40  # 40 attempts * 3 seconds = 2 minutes max
                    attempt = 0
                    authenticated = False

                    while attempt < max_attempts:
                        attempt += 1
                        page.wait_for_timeout(3000)  # Wait 3 seconds between checks

                        current_url = page.url
                        log(f"Check {attempt}/{max_attempts}: Current URL - {current_url}")

                        if "dashboard" in current_url.lower():
                            log("✓ Successfully logged in to Lawmatics!", "success")
                            authenticated = True
                            break

                    if not authenticated:
                        log(f"Timeout waiting for 2FA. Current URL: {page.url}", "warning")
                        log("You may need to complete 2FA or check for login errors", "warning")

                except Exception as e:
                    log(f"Error during login process: {str(e)}", "error")
                    log("Login process failed - you may need to log in manually", "warning")

            else:
                log("Already logged in or no password provided", "success")

            # Wait for dashboard to fully load
            log("Waiting for dashboard to fully load...")
            page.wait_for_timeout(3000)

            # Verify we're on the dashboard before looking for sidebar
            current_url = page.url
            log(f"Current URL before sidebar search: {current_url}")

            if "dashboard" in current_url.lower():
                log("✓ Login complete - on dashboard page, proceeding with sidebar interaction", "success")

                # Find and hover over the sidebar menu button
                log("Looking for sidebar menu button...")
                sidebar_found = False

                # Strategy 1: Try original XPath
                try:
                    log("Strategy 1: Trying original XPath...")
                    sidebar_button_xpath = "/html/body/div[1]/div[1]/div[1]/div[3]/div[2]/span[4]/a"
                    sidebar_button = page.locator(f"xpath={sidebar_button_xpath}")
                    sidebar_button.wait_for(state="visible", timeout=5000)
                    log("✓ Found sidebar menu button via XPath", "success")
                    sidebar_button.hover()
                    log("✓ Hovered over button - sidebar menu should be visible", "success")
                    sidebar_found = True
                except Exception as e:
                    log(f"Strategy 1 failed: {str(e)}", "warning")

                # Strategy 2: Look for sidebar navigation elements
                if not sidebar_found:
                    try:
                        log("Strategy 2: Looking for sidebar nav elements...")
                        nav_links = page.locator("nav a, div[class*='sidebar'] a, aside a")
                        count = nav_links.count()
                        log(f"Found {count} navigation links")

                        if count > 0:
                            # Look for a specific link or just hover the 4th one
                            if count >= 4:
                                nav_links.nth(3).hover()
                                log("✓ Hovered over 4th navigation link", "success")
                                sidebar_found = True
                    except Exception as e:
                        log(f"Strategy 2 failed: {str(e)}", "warning")

                # Strategy 3: Take screenshot for debugging
                if not sidebar_found:
                    log("Could not find sidebar button with any strategy", "warning")
                    try:
                        screenshot_path = "/tmp/lawmatics_dashboard_debug.png"
                        page.screenshot(path=screenshot_path)
                        log(f"📸 Debug screenshot saved to: {screenshot_path}", "warning")
                    except:
                        pass

                # Wait to see the sidebar menu
                if sidebar_found:
                    page.wait_for_timeout(2000)
                    log("✓ Sidebar menu interaction completed!", "success")
            else:
                log("⚠️ Not on dashboard page - skipping sidebar interaction", "warning")

            # Don't close browser - leave it running
            # browser.close() - commented out intentionally

    except Exception as e:
        log(f"Error during browser test: {str(e)}", "error")
        sys.exit(1)

if __name__ == "__main__":
    main()
