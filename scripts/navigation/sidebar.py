"""
Sidebar navigation automation for Lawmatics dashboard
"""
from playwright.sync_api import Page
import sys
import os

# Add parent directory to path to import from sibling modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.logger import log


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
