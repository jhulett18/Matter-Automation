"""
Sidebar navigation automation for Lawmatics dashboard
"""
from playwright.sync_api import Page
import sys
import os
import json
from datetime import datetime

# Add parent directory to path to import from sibling modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.logger import log


def chooseLawFirm(page: Page) -> bool:
    """
    Extract all sidebar menu items and save to JSON

    Args:
        page: Playwright Page object with sidebar visible

    Returns:
        bool: True if successfully extracted and saved, False otherwise
    """
    try:
        log("Extracting sidebar menu items...", "info")

        # Wait for floating sidebar menu to fully appear
        page.wait_for_timeout(2000)

        menu_items = []

        # Strategy 1: Look for floating sidebar with role="presentation"
        try:
            log("Looking for floating sidebar with role='presentation'...", "info")
            presentation_containers = page.locator('[role="presentation"]')
            container_count = presentation_containers.count()
            log(f"Found {container_count} elements with role='presentation'", "info")

            if container_count > 0:
                # Try each presentation container until we find menu items
                for container_idx in range(container_count):
                    container = presentation_containers.nth(container_idx)

                    # Find all potential menu items within this container
                    items = container.locator('a, span, div, li, [role="menuitem"]')
                    item_count = items.count()
                    log(f"Container {container_idx + 1}: Found {item_count} potential menu items", "info")

                    if item_count > 0:
                        temp_items = []
                        for i in range(item_count):
                            try:
                                text = items.nth(i).text_content()
                                if text and text.strip() and len(text.strip()) > 0:
                                    cleaned_text = text.strip()
                                    # Avoid duplicates
                                    if cleaned_text not in temp_items:
                                        temp_items.append(cleaned_text)
                            except Exception as e:
                                pass

                        # Validate: first item should be "Account info"
                        if len(temp_items) > 0:
                            first_item = temp_items[0]
                            log(f"First item found: '{first_item}'", "info")

                            if "account info" in first_item.lower():
                                log("✓ Validated: First item is 'Account info'", "success")
                                menu_items = temp_items
                                log(f"✓ Extracted {len(menu_items)} items from presentation container", "success")
                                break
                            else:
                                log(f"First item '{first_item}' doesn't match 'Account info', trying next container...", "warning")

                if len(menu_items) == 0:
                    log("No valid menu items found in presentation containers", "warning")
        except Exception as e:
            log(f"Strategy 1 (role='presentation') failed: {str(e)}", "warning")

        # Strategy 2: Fallback to broader selectors if Strategy 1 didn't find items
        if len(menu_items) == 0:
            log("Trying fallback selector strategies...", "info")
            fallback_selectors = [
                "nav a, div[class*='sidebar'] a, aside a",
                "nav li, div[class*='sidebar'] li, aside li",
                "[role='menuitem']",
            ]

            for strategy_num, selector in enumerate(fallback_selectors, 2):
                try:
                    log(f"Trying fallback strategy {strategy_num}...", "info")
                    elements = page.locator(selector)
                    count = elements.count()
                    log(f"Fallback {strategy_num}: Found {count} elements", "info")

                    if count > 0:
                        for i in range(count):
                            try:
                                text = elements.nth(i).text_content()
                                if text and text.strip():
                                    cleaned_text = text.strip()
                                    if cleaned_text not in menu_items:
                                        menu_items.append(cleaned_text)
                            except:
                                pass

                        if len(menu_items) > 0:
                            log(f"✓ Fallback strategy {strategy_num} found {len(menu_items)} items", "success")
                            break
                except Exception as e:
                    log(f"Fallback strategy {strategy_num} failed: {str(e)}", "warning")

        log(f"Total unique menu items extracted: {len(menu_items)}", "success")

        # Save to JSON file
        # Create directory if it doesn't exist
        output_dir = os.path.join(
            os.path.dirname(__file__),
            "firm_selection_from_profile"
        )
        os.makedirs(output_dir, exist_ok=True)

        output_file = os.path.join(output_dir, "lawmatics_firms.json")

        with open(output_file, 'w') as f:
            json.dump({
                "menu_items": menu_items,
                "total_items": len(menu_items),
                "extracted_at": datetime.now().isoformat()
            }, f, indent=2)

        log(f"✓ Saved {len(menu_items)} menu items to {output_file}", "success")
        return True

    except Exception as e:
        log(f"Error extracting sidebar menu: {str(e)}", "error")
        return False


def parseFirms(input_file_path: str, output_file_path: str) -> bool:
    """
    Parse lawmatics_firms.json and extract only firm names after "Switch to Account"

    Args:
        input_file_path: Path to lawmatics_firms.json
        output_file_path: Path to save firms_cleaned.json

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        log("Parsing firms from menu data...", "info")

        # Read the input JSON
        with open(input_file_path, 'r') as f:
            data = json.load(f)

        menu_items = data.get("menu_items", [])

        # Find the index of "Switch to Account"
        switch_index = -1
        for i, item in enumerate(menu_items):
            if "switch to account" in item.lower():
                switch_index = i
                log(f"Found 'Switch to Account' at index {i}", "success")
                break

        if switch_index == -1:
            log("Could not find 'Switch to Account' in menu items", "error")
            return False

        # Extract all items AFTER "Switch to Account"
        firms = []
        for i in range(switch_index + 1, len(menu_items)):
            item = menu_items[i].strip()
            # Only include non-empty items that don't contain concatenated text
            if item and len(item) < 100:  # Skip long concatenated strings
                firms.append(item)

        log(f"Extracted {len(firms)} law firms", "success")

        # Save to output file
        output_data = {
            "firms": firms,
            "total_firms": len(firms),
            "parsed_at": datetime.now().isoformat()
        }

        with open(output_file_path, 'w') as f:
            json.dump(output_data, f, indent=2)

        log(f"✓ Saved cleaned firms to {output_file_path}", "success")
        return True

    except Exception as e:
        log(f"Error parsing firms: {str(e)}", "error")
        return False


def selectFirm(page: Page, firm_name: str) -> bool:
    """
    Click on a specific law firm in the sidebar to switch accounts

    Args:
        page: Playwright Page object on the dashboard
        firm_name: Name of the law firm to select (e.g., "Ben Rust Law")

    Returns:
        bool: True if firm was found and clicked, False otherwise
    """
    try:
        log(f"Looking for law firm: {firm_name}...", "info")

        # First, open the sidebar menu
        sidebar_found = False

        # Strategy 1: Try original XPath
        try:
            log("Opening sidebar menu...", "info")
            sidebar_button_xpath = "/html/body/div[1]/div[1]/div[1]/div[3]/div[2]/span[4]/a"
            sidebar_button = page.locator(f"xpath={sidebar_button_xpath}")
            sidebar_button.wait_for(state="visible", timeout=5000)
            sidebar_button.hover()
            log("✓ Sidebar menu opened", "success")
            sidebar_found = True
        except Exception as e:
            log(f"Failed to open sidebar menu: {str(e)}", "error")
            return False

        # Wait for sidebar to appear
        page.wait_for_timeout(2000)

        # Try to find and click the firm
        try:
            # Look for the firm name in the sidebar
            firm_link = page.get_by_text(firm_name, exact=True)

            if firm_link.count() > 0:
                log(f"✓ Found firm: {firm_name}", "success")
                firm_link.first.click()
                log(f"✓ Clicked on: {firm_name}", "success")
                page.wait_for_timeout(3000)  # Wait for account switch
                return True
            else:
                log(f"Could not find firm: {firm_name}", "error")
                return False
        except Exception as e:
            log(f"Error clicking firm '{firm_name}': {str(e)}", "error")
            return False

    except Exception as e:
        log(f"Error during firm selection: {str(e)}", "error")
        return False


def navigate_sidebar(page: Page, menu_item: str = None) -> bool:
    """
    Navigate through the Lawmatics sidebar menu

    Args:
        page: Playwright Page object on the dashboard
        menu_item: Optional specific menu item to click (e.g., "Bulk Matters")

    Returns:
        bool: True if navigation was successful, False otherwise
    """
    try:
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
            return False

        # Wait to see the sidebar menu
        page.wait_for_timeout(2000)
        log("✓ Sidebar menu interaction completed!", "success")

        # Check if lawmatics_firms.json already exists
        firms_json_path = os.path.join(
            os.path.dirname(__file__),
            "firm_selection_from_profile",
            "lawmatics_firms.json"
        )

        firms_cleaned_path = os.path.join(
            os.path.dirname(__file__),
            "firm_selection_from_profile",
            "firms_cleaned.json"
        )

        # Extract raw firms if needed
        if os.path.exists(firms_json_path):
            log("✓ Found existing lawmatics_firms.json - skipping sidebar extraction", "success")
            log(f"Using cached data from: {firms_json_path}", "info")
        else:
            log("No existing lawmatics_firms.json - extracting from sidebar", "info")
            # Extract and save sidebar menu items to JSON
            chooseLawFirm(page)

        # Always parse firms if firms_cleaned.json doesn't exist
        if not os.path.exists(firms_cleaned_path):
            log("No existing firms_cleaned.json - parsing firms", "info")
            parseFirms(firms_json_path, firms_cleaned_path)
            # Signal completion to trigger page reload
            log("FIRMS_EXTRACTION_COMPLETE", "success")
        else:
            log("✓ Found existing firms_cleaned.json - skipping parsing", "success")
            log(f"Using cached cleaned data from: {firms_cleaned_path}", "info")

        # If a specific menu item is requested, click on it
        if menu_item:
            log(f"Looking for menu item: {menu_item}...")
            try:
                # Try to find the menu item by text
                menu_link = page.get_by_text(menu_item, exact=False)
                if menu_link.count() > 0:
                    log(f"✓ Found menu item: {menu_item}", "success")
                    menu_link.first.click()
                    log(f"✓ Clicked on: {menu_item}", "success")
                    page.wait_for_timeout(2000)  # Wait for navigation
                    return True
                else:
                    log(f"Could not find menu item: {menu_item}", "warning")
                    return False
            except Exception as e:
                log(f"Error clicking menu item '{menu_item}': {str(e)}", "error")
                return False

        return True

    except Exception as e:
        log(f"Error during sidebar navigation: {str(e)}", "error")
        return False
