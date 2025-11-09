#!/usr/bin/env python3
"""
Playwright controller for Lawmatics automation
Handles browser connection, authentication, and dashboard interaction
"""
import sys
from playwright.sync_api import sync_playwright

# Import utility modules
from utils.logger import log
from auth.google_login import perform_google_login
from navigation.sidebar import navigate_sidebar

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
            max_checks = 10  # 10 checks * 500ms = 5 seconds
            for i in range(max_checks):
                current_url = page.url.lower()
                log(f"Check {i+1}/{max_checks}: Current URL - {page.url}")

                if "/login" in current_url:
                    log("✓ Login page detected after redirect", "success")
                    break

                page.wait_for_timeout(500)  # Wait 500ms between checks

            # If password provided, always run login flow
            if password:
                # Wait additional 6 seconds for slower redirects to complete
                log("Waiting additional 6 seconds for slower redirects...")
                page.wait_for_timeout(6000)

                current_url = page.url
                log(f"Current URL after additional wait: {current_url}")

                # Always run Google login if password provided (ensures login runs before sidebar)
                log("Running Google login flow...", "info")
                perform_google_login(page, password)

                # Wait for login to complete
                log("Waiting for login to complete...")
                page.wait_for_timeout(3000)
                current_url = page.url
                log(f"Current URL after login: {current_url}")
            else:
                log("No password provided - skipping login", "info")
                current_url = page.url

            # Only proceed to sidebar if on dashboard (after login is complete)
            if "dashboard" in current_url.lower():
                log("✓ Login complete - on dashboard page, proceeding with sidebar interaction", "success")

                # Navigate sidebar (for Open Lawmatics button)
                navigate_sidebar(page)

                # Log placeholder for future bulk matter updates
                log("📋 Ready for bulk matter updates (feature pending)", "info")
            else:
                log("⚠️ Not on dashboard page - skipping sidebar interaction", "warning")

            # Don't close browser - leave it running
            # browser.close() - commented out intentionally

    except Exception as e:
        log(f"Error during browser test: {str(e)}", "error")
        sys.exit(1)

if __name__ == "__main__":
    main()
