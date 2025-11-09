#!/usr/bin/env python3
"""
Playwright script to automate form filling with data from Claude API
"""
import sys
import json
from playwright.sync_api import sync_playwright
from datetime import datetime
import time

def log(message, level="info"):
    """Output structured logs"""
    timestamp = datetime.now().isoformat()
    print(json.dumps({
        "timestamp": timestamp,
        "level": level,
        "message": message
    }), flush=True)

def main():
    if len(sys.argv) < 3:
        log("Error: Missing required arguments", "error")
        log("Usage: python form_automation.py <cdp_url> <form_data_json>", "error")
        sys.exit(1)

    cdp_url = sys.argv[1]

    # Parse form data from JSON argument
    try:
        form_data = json.loads(sys.argv[2])
        log(f"Parsed form data: {len(form_data)} fields")
    except json.JSONDecodeError as e:
        log(f"Error: Invalid JSON in form_data: {str(e)}", "error")
        sys.exit(1)

    # Extract form fields
    form_url = form_data.get("form_url", "https://your-lawmatics-url.com/form")
    client_name = form_data.get("client_name", "")
    email = form_data.get("email", "")
    state = form_data.get("state", "")

    log(f"Starting form automation with CDP URL: {cdp_url}")
    log(f"Target form URL: {form_url}")

    try:
        with sync_playwright() as p:
            log("Connecting to remote browser...")
            browser = p.chromium.connect_over_cdp(cdp_url)
            log("✓ Successfully connected to browser", "success")

            # Get or create context
            if len(browser.contexts) > 0:
                log("Using existing browser context (preserving session)")
                context = browser.contexts[0]
            else:
                log("Creating new browser context")
                context = browser.new_context()

            # Create a new page
            log("Creating new page...")
            page = context.new_page()
            log("✓ Page created successfully", "success")

            # Navigate to form
            log(f"Navigating to form: {form_url}")
            page.goto(form_url, wait_until="domcontentloaded")
            log(f"✓ Successfully loaded form page", "success")

            # Wait a moment for any dynamic content
            time.sleep(1)

            # Fill form fields
            if client_name:
                log(f"Filling client name: {client_name}")
                page.fill("#client_name", client_name)
                log("✓ Client name filled", "success")

            if email:
                log(f"Filling email: {email}")
                page.fill("#email", email)
                log("✓ Email filled", "success")

            if state:
                log(f"Selecting state: {state}")
                page.select_option("#state", state)
                log("✓ State selected", "success")

            # Submit the form
            log("Clicking submit button...")
            page.click("#submit_button")
            log("✓ Form submitted", "success")

            # Wait to see results
            time.sleep(2)

            log("Form automation completed successfully!", "success")

            # Don't close browser - leave it running
            # browser.close() - commented out intentionally

    except Exception as e:
        log(f"Error during form automation: {str(e)}", "error")
        import traceback
        log(f"Traceback: {traceback.format_exc()}", "error")
        sys.exit(1)

if __name__ == "__main__":
    main()
