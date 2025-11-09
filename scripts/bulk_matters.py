#!/usr/bin/env python3
"""
Bulk matters automation for Lawmatics
Navigates to the bulk matters page via sidebar
Assumes user is already logged in to Lawmatics
"""
import sys
from playwright.sync_api import sync_playwright

# Import utility modules
from utils.logger import log
from navigation.sidebar import navigate_sidebar


def main():
    if len(sys.argv) < 2:
        log("Error: CDP URL not provided", "error")
        log("Usage: python bulk_matters.py <cdp_url>", "error")
        sys.exit(1)

    cdp_url = sys.argv[1]

    log(f"Starting bulk matters automation with CDP URL: {cdp_url}")
    log("⚠️  Assuming user is already logged in to Lawmatics", "warning")

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

            # Get the first page or create new one
            if len(context.pages) > 0:
                log("Using existing page")
                page = context.pages[0]
            else:
                log("Creating new page...")
                page = context.new_page()
                log("✓ Page created successfully", "success")

            # Log current URL
            current_url = page.url
            log(f"Current page URL: {current_url}")

            # Check if on dashboard
            if "dashboard" not in current_url.lower():
                log("⚠️  Not on dashboard - navigating to dashboard first...", "warning")
                page.goto("https://app.lawmatics.com/dashboard", wait_until="domcontentloaded")
                page.wait_for_timeout(2000)
                log(f"✓ Navigated to: {page.url}", "success")

            # Navigate sidebar to Bulk Matters
            log("Navigating to Bulk Matters...")
            success = navigate_sidebar(page, menu_item="Bulk Matters")

            if success:
                log("✓ Successfully navigated to Bulk Matters page!", "success")
                log(f"Current URL: {page.url}")

                # Add placeholder for future bulk matter form automation
                log("📋 Bulk matter form automation will be implemented here", "info")
            else:
                log("Failed to navigate to Bulk Matters", "error")
                sys.exit(1)

            # Don't close browser - leave it running for user interaction
            # browser.close() - commented out intentionally

    except Exception as e:
        log(f"Error during bulk matters automation: {str(e)}", "error")
        sys.exit(1)


if __name__ == "__main__":
    main()
