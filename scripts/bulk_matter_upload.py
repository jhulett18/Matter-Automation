#!/usr/bin/env python3
"""
Bulk matter upload automation for Lawmatics
Switches to a selected law firm and prepares for matter upload
Assumes user is already logged in to Lawmatics
"""
import sys
from playwright.sync_api import sync_playwright

# Import utility modules
from utils.logger import log
from navigation.sidebar import selectFirm


def main():
    if len(sys.argv) < 3:
        log("Error: CDP URL or selected firm not provided", "error")
        log("Usage: python bulk_matter_upload.py <cdp_url> <selected_firm>", "error")
        sys.exit(1)

    cdp_url = sys.argv[1]
    selected_firm = sys.argv[2]

    log(f"Starting firm selection automation with CDP URL: {cdp_url}")
    log(f"Selected firm: {selected_firm}")
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

            # Select the chosen law firm
            log(f"Switching to firm: {selected_firm}...")
            success = selectFirm(page, selected_firm)

            if success:
                log(f"✓ Successfully switched to {selected_firm}!", "success")
                log(f"Current URL: {page.url}")

                # Add placeholder for future document upload automation
                log("📋 Document upload automation will be implemented here", "info")
            else:
                log(f"Failed to switch to firm: {selected_firm}", "error")
                sys.exit(1)

            # Don't close browser - leave it running for user interaction
            # browser.close() - commented out intentionally

    except Exception as e:
        log(f"Error during bulk matter upload automation: {str(e)}", "error")
        sys.exit(1)


if __name__ == "__main__":
    main()
