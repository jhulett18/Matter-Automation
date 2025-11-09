#!/usr/bin/env python3
"""
Custom Documents Extraction Module
Navigates to Lawmatics custom forms page and extracts document names
"""
import os
import json
from datetime import datetime
from playwright.sync_api import Page

# Import utility modules
from utils.logger import log


def extractCustomDocuments(page: Page) -> bool:
    """
    Navigate to custom forms page and extract all custom document names

    Args:
        page: Playwright page object

    Returns:
        bool: True if extraction successful, False otherwise
    """
    try:
        log("Starting custom documents extraction...", "info")

        # Navigate to custom forms page
        custom_forms_url = "https://app.lawmatics.com/custom-forms"
        log(f"Navigating to {custom_forms_url}", "info")
        page.goto(custom_forms_url, wait_until="domcontentloaded")

        # Wait for page to fully load and render table
        log("Waiting for page to fully load...", "info")
        page.wait_for_timeout(3000)

        # Set pagination to 200 items to load all documents
        try:
            log("Setting pagination to 200 items...", "info")

            # Strategy 1: Try button with text "12 items"
            try:
                page.click("button:has-text('12 items')", timeout=3000)
                page.wait_for_timeout(500)
                page.click("text=200 items")
                page.wait_for_timeout(2000)
                log("✓ Pagination set to 200 items (button method)", "success")
            except:
                # Strategy 2: Try select dropdown
                try:
                    page.select_option("select", value="200", timeout=3000)
                    page.wait_for_timeout(2000)
                    log("✓ Pagination set to 200 items (select method)", "success")
                except:
                    # Strategy 3: Try finding any element with "12" or "items" text and click
                    try:
                        page.locator("text=/12.*items/i").first.click(timeout=3000)
                        page.wait_for_timeout(500)
                        page.click("text=200 items")
                        page.wait_for_timeout(2000)
                        log("✓ Pagination set to 200 items (locator method)", "success")
                    except Exception as e:
                        log(f"Could not change pagination: {str(e)}", "warning")
                        log("Continuing with default pagination...", "info")

        except Exception as e:
            log(f"Pagination change failed: {str(e)}", "warning")

        log("Page loaded, locating documents...", "info")

        # Target table rows - try multiple strategies to find form names
        form_names = []
        import re

        # Strategy 1: XPath approach with text blob parsing (primary method)
        try:
            documents_xpath = "/html/body/div[1]/div[1]/div[2]/div[2]/div/div/div[2]/div"
            page.wait_for_selector(f"xpath={documents_xpath}", timeout=10000)

            # Get the text blob from the container
            container = page.locator(f"xpath={documents_xpath}")
            text_blob = container.text_content()

            log(f"Got text blob of length {len(text_blob)}", "info")

            # Remove headers
            text_blob = re.sub(r'Form Name.*?Updated At', '', text_blob, count=1)

            # Use regex to find form names: text that comes right before "Matter" or "Contact"
            # Pattern: captures text at start of string OR after date patterns, before Matter/Contact
            # Form names appear at: start of text (first form) OR after dates, tags, em-dashes, Yes/No
            pattern = r'(?:^|(?:\d+\s+(?:days?|months?|years?)\s+ago)|(?:a\s+(?:day|month|year)\s+ago)|(?:—)|(?:Yes)|(?:No))\s*([A-Z][A-Za-z\s\-\(\)]+?)\s*(?=(?:Matter|Contact))'

            matches = re.findall(pattern, text_blob, re.MULTILINE)

            log(f"Found {len(matches)} potential form names using regex", "info")

            for match in matches:
                # Clean up the extracted name
                cleaned_name = match.strip()
                cleaned_name = re.sub(r'\s+', ' ', cleaned_name)  # Normalize whitespace
                cleaned_name = re.sub(r'—+', '', cleaned_name)  # Remove em-dashes

                # Filter out pagination and UI elements
                skip_words = ['show', 'items', 'page', 'loading', 'recipient type', 'practice area']
                if cleaned_name and len(cleaned_name) > 3 and not any(word in cleaned_name.lower() for word in skip_words):
                    form_names.append(cleaned_name)
                    log(f"Extracted form: {cleaned_name}", "info")

        except Exception as e:
            log(f"XPath text parsing strategy failed: {str(e)}", "warning")

            # Strategy 2: Fallback to table row parsing
            log("Trying table row extraction method...", "info")
            try:
                # Wait for table to be present
                page.wait_for_selector("table tbody tr", timeout=10000)

                # Get all table rows
                rows = page.locator("table tbody tr").all()
                log(f"Found {len(rows)} table rows", "info")

                for idx, row in enumerate(rows):
                    try:
                        # Get all cells in the row
                        cells = row.locator("td").all()

                        if cells and len(cells) > 0:
                            # First cell should be the form name
                            first_cell = cells[0]

                            # Look for a link or text within the first cell
                            # Try to find an anchor tag first (form names are often links)
                            link = first_cell.locator("a").first

                            try:
                                form_name = link.text_content().strip()
                            except:
                                # If no link, just get the cell text
                                form_name = first_cell.text_content().strip()

                            # Clean the text
                            cleaned_name = ' '.join(form_name.split())

                            if cleaned_name and len(cleaned_name) > 0:
                                # Filter out common non-form-name elements
                                skip_keywords = ['show', 'items', 'page', 'loading', 'total']
                                if not any(keyword in cleaned_name.lower() for keyword in skip_keywords):
                                    form_names.append(cleaned_name)
                                    log(f"Extracted form {len(form_names)}: {cleaned_name}", "info")

                    except Exception as e:
                        log(f"Error extracting from row {idx + 1}: {str(e)}", "warning")
                        continue

            except Exception as e2:
                log(f"Table row extraction also failed: {str(e2)}", "error")

                # Strategy 3: Try more flexible selectors
                log("Trying flexible selector strategy...", "info")
                try:
                    # Wait a bit more for dynamic content
                    page.wait_for_timeout(2000)

                    # Try to find any table on the page
                    tables = page.locator("table").all()
                    log(f"Found {len(tables)} tables on page", "info")

                    if tables:
                        # Get rows from the first table
                        first_table = tables[0]
                        rows = first_table.locator("tr").all()
                        log(f"Found {len(rows)} rows in first table", "info")

                        for row in rows:
                            cells = row.locator("td, th").all()
                            if cells and len(cells) > 0:
                                # Try to get text from first cell
                                first_cell_text = cells[0].text_content().strip()
                                cleaned = ' '.join(first_cell_text.split())

                                # Filter out headers and pagination
                                skip_keywords = ['form name', 'show', 'items', 'page', 'loading', 'total', 'recipient type', 'practice area']
                                if cleaned and len(cleaned) > 3 and not any(keyword in cleaned.lower() for keyword in skip_keywords):
                                    form_names.append(cleaned)
                                    log(f"Extracted: {cleaned}", "info")

                except Exception as e3:
                    log(f"Flexible selector strategy also failed: {str(e3)}", "error")

        if not form_names:
            log("No form names extracted (all elements were empty)", "warning")
            return False

        # Save to JSON file in the same directory as this module
        output_dir = os.path.dirname(__file__)
        os.makedirs(output_dir, exist_ok=True)

        output_file = os.path.join(output_dir, "custom_documents.json")

        # Prepare cleaned data - just the form names array
        output_data = {
            "form_names": form_names,
            "total_count": len(form_names),
            "extracted_at": datetime.now().isoformat(),
            "source_url": custom_forms_url
        }

        # Write to file
        with open(output_file, 'w') as f:
            json.dump(output_data, f, indent=2)

        log(f"✓ Successfully extracted {len(form_names)} form names", "success")
        log(f"✓ Saved to {output_file}", "success")

        return True

    except Exception as e:
        log(f"Error during custom documents extraction: {str(e)}", "error")
        return False


def clickCustomDocument(page: Page, document_name: str) -> bool:
    """
    Navigate to custom forms page and click on a specific document

    Args:
        page: Playwright page object
        document_name: Exact name of the document to click

    Returns:
        bool: True if document was found and clicked, False otherwise
    """
    try:
        log(f"Navigating to custom forms to click document: {document_name}", "info")

        # Navigate to custom forms page
        custom_forms_url = "https://app.lawmatics.com/custom-forms"
        page.goto(custom_forms_url, wait_until="domcontentloaded")

        # Wait for page to load
        log("Waiting for custom forms page to load...", "info")
        page.wait_for_timeout(3000)

        # Set pagination to 200 items to ensure document is visible
        try:
            log("Setting pagination to 200 items...", "info")

            # Try multiple strategies to set pagination
            try:
                page.click("button:has-text('12 items')", timeout=3000)
                page.wait_for_timeout(500)
                page.click("text=200 items")
                page.wait_for_timeout(2000)
                log("✓ Pagination set to 200 items", "success")
            except:
                try:
                    page.select_option("select", value="200", timeout=3000)
                    page.wait_for_timeout(2000)
                    log("✓ Pagination set to 200 items", "success")
                except:
                    log("Could not change pagination, continuing anyway...", "warning")

        except Exception as e:
            log(f"Pagination setup failed: {str(e)}", "warning")

        # Find the document by name and click the edit pencil icon
        log(f"Looking for document: {document_name}", "info")

        # Strategy 1: Find row/container with document name, then click the edit icon within it
        try:
            # Find any element containing the document name
            container = page.locator(f"*:has-text('{document_name}')").first
            # Within that container, find and click the edit icon link
            container.locator("a.mr2.pointer.dim, a[href*='/edit'], i.icon-edit").first.click(timeout=5000)
            log(f"✓ Clicked edit icon for document: {document_name} (container + edit icon method)", "success")
        except Exception as e1:
            log(f"Strategy 1 failed: {str(e1)}", "warning")

            # Strategy 2: Use CSS selector to find edit link in row containing document name
            try:
                # Find the edit link that's in an element containing this document name
                page.locator(f":has-text('{document_name}') a[href*='/custom-forms']").first.click(timeout=5000)
                log(f"✓ Clicked edit icon for document: {document_name} (CSS has-text method)", "success")
            except Exception as e2:
                log(f"Strategy 2 failed: {str(e2)}", "warning")

                # Strategy 3: Find table row with document name, then click edit icon
                try:
                    # Find tr or div role="row" containing the document name
                    row = page.locator(f"tr:has-text('{document_name}'), [role='row']:has-text('{document_name}')").first
                    # Click the edit icon within that row
                    row.locator("i.icon-edit").first.click(timeout=5000)
                    log(f"✓ Clicked edit icon for document: {document_name} (row + icon method)", "success")
                except Exception as e3:
                    log(f"Strategy 3 failed: {str(e3)}", "warning")

                    # Strategy 4: Direct approach - find icon-edit in proximity to document name
                    try:
                        # Use XPath to find the edit icon in the same parent as the document name
                        page.locator(f"xpath=//*[contains(text(), '{document_name}')]/ancestor::tr//i[@class='icon-edit']").first.click(timeout=5000)
                        log(f"✓ Clicked edit icon for document: {document_name} (XPath ancestor method)", "success")
                    except Exception as e4:
                        log(f"Could not find or click edit icon for document '{document_name}': {str(e4)}", "error")
                        log("All strategies failed. Please verify the document name and page structure.", "error")
                        return False

        # Wait for the document detail page to load
        page.wait_for_timeout(3000)
        log(f"✓ Document page loaded. Current URL: {page.url}", "success")

        return True

    except Exception as e:
        log(f"Error clicking custom document: {str(e)}", "error")
        return False
