# Matter Automation - Teammate Training Guide

> **Welcome!** This guide will help you get started with the Matter Automation system for Lawmatics. Follow the steps below to set up and start automating matter uploads.

## 📋 Table of Contents

1. [What This Tool Does](#what-this-tool-does)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Daily Workflow](#daily-workflow)
5. [Feature Guide](#feature-guide)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## What This Tool Does

This application automates the process of uploading matters to Lawmatics by:

1. **Connecting to your Chrome browser** remotely (so you can see what's happening)
2. **Logging into Lawmatics** automatically with your credentials
3. **Switching between law firms** using a dropdown menu
4. **Uploading matter data** in bulk to the selected firm

**Benefits:**
- ⏱️ Saves time on repetitive data entry
- ✅ Reduces human error
- 📊 Provides real-time progress tracking
- 🔄 Can process multiple matters efficiently

---

## Prerequisites

Before you begin, make sure you have:

### Required Software

| Software | Version | Check Command | Download Link |
|----------|---------|---------------|---------------|
| Node.js | 18+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| npm | 8+ | `npm --version` | Comes with Node.js |
| Python | 3.8+ | `python3 --version` | [python.org](https://www.python.org/) |
| Google Chrome | Latest | `google-chrome --version` | [google.com/chrome](https://www.google.com/chrome/) |

### Required Credentials

- **Lawmatics Account** - You need login credentials for jonathan@legaleasemarketing.com
- **Lawmatics Password** - Will be stored in environment variables

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
cd ~/Documents/github
git clone https://github.com/jhulett18/Matter-Automation.git
cd Matter-Automation/matter-automation-ui
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

**Expected output:** You should see a progress bar installing packages. Takes about 1-2 minutes.

### Step 3: Set Up Python Environment

```bash
# Navigate to parent directory
cd ..

# Create Python virtual environment
python3 -m venv venv

# Install Python dependencies
./venv/bin/pip install -r matter-automation-ui/scripts/requirements.txt

# Install Playwright browsers
./venv/bin/playwright install chromium
```

**Expected output:** Python packages install, then Playwright downloads Chromium browser (~100MB).

### Step 4: Configure Environment Variables

```bash
cd matter-automation-ui

# Copy the example file
cp .env.example .env.local

# Edit the file
nano .env.local  # or use your preferred editor
```

Add your Lawmatics password:

```env
# Lawmatics Google Account Password
# Used for automated login to Lawmatics
LAWMATICS_PASSWORD=your_actual_password_here
```

**Save and close** the file (Ctrl+X, then Y, then Enter in nano).

⚠️ **Important:** Never commit `.env.local` to git - it contains secrets!

### Step 5: Verify Installation

```bash
# Check Node modules installed
ls node_modules | wc -l  # Should show 100+ packages

# Check Python venv created
ls ../venv/bin/python3  # Should show python3 exists

# Check env file created
cat .env.local  # Should show your password (be careful not to share this!)
```

---

## Daily Workflow

### Complete Workflow: Uploading Matters to Lawmatics

Follow these steps each time you need to upload matters:

#### 1. Start the Application

```bash
cd ~/Documents/github/Matter-Automation/matter-automation-ui
npm run dev
```

**What happens:** Next.js server starts on port 3000

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

#### 2. Open the UI

Open your browser and go to: **http://localhost:3000**

**What you'll see:**
- Chrome Management section (top left)
- Open Lawmatics button
- Firm selector dropdown
- Testing Document Upload section
- Real-time Logs panel (right side)

#### 3. Start Chrome

Click the **"Start Chrome"** button in the Chrome Management section.

**What happens:**
- Chrome launches with a special debugging flag
- A new Chrome window opens
- Status updates appear in the logs

**Success indicator:** "Chrome started successfully" message in logs

#### 4. Open Lawmatics & Login

Click the **"Open Lawmatics Dashboard"** button.

**What happens:**
- Browser navigates to Lawmatics login page
- Automatically enters Google OAuth credentials
- **YOU MUST:** Enter 2FA code manually when prompted
- Extracts available law firms from sidebar menu
- Page automatically reloads after 2 seconds

**Success indicator:**
- "FIRMS_EXTRACTION_COMPLETE" in logs
- Page reloads automatically
- Firm dropdown now populated with law firm names

#### 5. Select a Law Firm

In the "Please choose law firm" dropdown, select the firm you want to upload to.

**Options will include:**
- Ben Rust Law
- KEW Legal
- Marsala Law Firm
- ... and others

#### 6. Run the Upload

Click **"Testing Document Upload"** button.

**What happens:**
- Browser switches to the selected law firm
- Prepares for matter data upload
- Real-time logs show progress:
  - "Starting automation for firm: [Name]"
  - "Connecting to remote browser..."
  - "Successfully connected to browser"
  - "Switching to firm: [Name]..."
  - "✓ Found firm: [Name]"
  - "✓ Clicked on: [Name]"
  - "✓ Successfully switched to [Name]!"

**Success indicator:** "Firm selection automation completed successfully" in green

---

## Feature Guide

### Chrome Management

Located in the top-left section of the UI.

#### Start Chrome
- **Purpose:** Launches Chrome with remote debugging enabled
- **When to use:** At the start of your session, before any automation
- **What it does:** Starts Chrome on port 9222 with a temporary profile
- **Button state:** Disabled while Chrome is running

#### Stop Chrome
- **Purpose:** Cleanly shut down the Chrome instance
- **When to use:** When you're done working or need to restart Chrome
- **What it does:** Kills all Chrome processes started by the tool
- **Button state:** Only enabled when Chrome is running

#### Get Browser Details
- **Purpose:** View detailed information about Chrome
- **When to use:** To verify Chrome is running, see open tabs, check version
- **What it shows:**
  - Chrome version number
  - Number of open pages/tabs
  - Process IDs and ports
  - List of all open tabs with URLs
- **Minimize button:** Click the arrow to collapse/expand this section

### Open Lawmatics

Handles authentication and firm extraction.

- **Purpose:** Log into Lawmatics and extract available law firms
- **Requirements:**
  - Chrome must be running
  - `LAWMATICS_PASSWORD` must be set in `.env.local`
- **Manual step:** You must enter 2FA code when prompted
- **Output:** Populates the firm dropdown
- **Auto-reload:** Page automatically reloads after extraction completes

### Firm Selector

Choose which law firm to work with.

- **Location:** Below "Open Lawmatics" section
- **Label:** "Please choose law firm"
- **Populated by:** Extracting firms from Lawmatics sidebar after login
- **First time use:** Will show warning if firms haven't been extracted yet
- **Selection required:** "Testing Document Upload" button won't work without selecting a firm

### Testing Document Upload

Switches to the selected firm.

- **Purpose:** Change the active law firm in Lawmatics
- **Requirements:**
  - Chrome must be running and logged into Lawmatics
  - A firm must be selected from dropdown
- **Process:**
  1. Opens Lawmatics sidebar
  2. Finds the selected firm by name
  3. Clicks on it
  4. Waits for account switch
- **Future:** Will handle actual matter uploads (coming soon)

### Real-time Logs

Located on the right side of the screen.

**Features:**
- **Auto-scroll:** Automatically scrolls to bottom as new logs arrive
- **Lock/Unlock button:** 🔒 Auto (locked) or 🔓 Manual (unlocked)
  - Locked (blue): New logs auto-scroll to bottom
  - Unlocked (gray): Logs stay at current position
  - **Pro tip:** Scrolling up manually unlocks auto-scroll
  - **Click button:** Re-locks and jumps to bottom

**Log Levels:**
- 🔵 **INFO** (blue): Normal progress messages
- ✅ **SUCCESS** (green): Completed actions
- ⚠️ **WARNING** (yellow): Non-critical issues
- ❌ **ERROR** (red): Problems that need attention

**Timestamps:** Each log shows the time it occurred (e.g., "3:45:23 PM")

---

## Common Tasks

### How do I switch law firms?

1. Make sure you've run "Open Lawmatics" at least once
2. Select a different firm from the "Please choose law firm" dropdown
3. Click "Testing Document Upload"
4. Check logs for "Successfully switched to [Firm Name]!"

### How do I check if Chrome is running?

Method 1: Click "Get Browser Details" - if details appear, Chrome is running

Method 2: Look for the Chrome window that opened

Method 3: Check terminal/console for Chrome process

### What if the firm dropdown is empty?

This means firms haven't been extracted yet. Follow these steps:

1. Click "Open Lawmatics Dashboard"
2. Wait for login to complete
3. Enter 2FA code when prompted
4. Wait for "FIRMS_EXTRACTION_COMPLETE" message
5. Page will reload automatically
6. Dropdown should now be populated

If still empty, check logs for errors.

### How do I know if automation succeeded?

Look for these indicators:

✅ **Success signs:**
- Green "SUCCESS" log entries
- "✓" checkmarks in log messages
- Final message: "Firm selection automation completed successfully"
- Status changes from "Running..." to idle

❌ **Failure signs:**
- Red "ERROR" log entries
- "Failed to..." messages
- Exit code != 0
- Status shows "error"

### How do I restart if something goes wrong?

1. Click "Stop Chrome" button
2. Wait 2-3 seconds
3. Click "Start Chrome" again
4. Repeat your workflow from step 4 of Daily Workflow

---

## Troubleshooting

### Problem: "Chrome failed to start"

**Possible causes:**
- Port 9222 already in use
- Chrome not installed
- Permissions issue

**Solutions:**
1. Check if Chrome is already running: `ps aux | grep chrome`
2. Kill existing Chrome processes: `pkill -f chrome`
3. Try starting Chrome manually to test:
   ```bash
   google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
   ```
4. Check Chrome is installed: `which google-chrome`

### Problem: "No logs appearing"

**Possible causes:**
- Connection issue between frontend and backend
- Browser not connected to Lawmatics
- Python script error

**Solutions:**
1. Check browser console (F12) for JavaScript errors
2. Refresh the page (Ctrl+R or Cmd+R)
3. Check terminal running `npm run dev` for errors
4. Restart the dev server: Ctrl+C, then `npm run dev`

### Problem: "Firm dropdown says 'Loading law firms...'"

**Causes:**
- Firms file doesn't exist yet
- API error

**Solutions:**
1. Wait 5 seconds - it might be loading
2. Check console (F12) → Network tab for `/api/get-firms` request
3. Check if file exists:
   ```bash
   ls scripts/navigation/firm_selection_from_profile/firms_cleaned.json
   ```
4. If missing, run "Open Lawmatics" to extract firms

### Problem: "LAWMATICS_PASSWORD environment variable is not set"

**Cause:** Environment variable not configured

**Solution:**
1. Check `.env.local` exists: `ls -la .env.local`
2. Check password is set: `cat .env.local | grep LAWMATICS_PASSWORD`
3. If missing, edit `.env.local` and add:
   ```
   LAWMATICS_PASSWORD=your_actual_password
   ```
4. Restart the dev server (Ctrl+C, then `npm run dev`)

### Problem: "Python script failed with exit code 1"

**Causes:**
- Python error in automation script
- Browser connection lost
- Firm name not found

**Solutions:**
1. Check the error message in logs (red ERROR entries)
2. Common issues:
   - **"Could not find firm"**: Check spelling in dropdown matches exactly
   - **"Failed to connect"**: Restart Chrome
   - **"ModuleNotFoundError"**: Reinstall Python dependencies:
     ```bash
     cd ..
     ./venv/bin/pip install -r matter-automation-ui/scripts/requirements.txt
     ```

### Problem: Page reloads unexpectedly

**This is normal!**

The page auto-reloads after firm extraction completes. This ensures the firm dropdown is populated with the latest data.

**Expected behavior:**
1. Click "Open Lawmatics Dashboard"
2. Login completes
3. Firms extracted
4. Log shows "FIRMS_EXTRACTION_COMPLETE"
5. Page reloads after 2 seconds
6. Firm dropdown now populated

---

## FAQ

### Q: Do I need to keep the terminal window open?

**A:** Yes, the terminal running `npm run dev` must stay open. Closing it will stop the application.

### Q: Can I use my regular Chrome while this is running?

**A:** Yes! The tool creates a separate Chrome instance with its own profile. Your normal browsing won't be affected.

### Q: What happens to my Lawmatics session?

**A:** The automation logs in and controls Lawmatics in the remote Chrome window. Your actual Lawmatics account in your regular browser is unaffected.

### Q: How do I stop everything?

**A:**
1. Stop Chrome: Click "Stop Chrome" button
2. Stop dev server: Press Ctrl+C in the terminal
3. Close browser tab with the UI

### Q: Can I run this on a different port?

**A:** Yes, but you'll need to modify the code. The default is port 3000 for the UI and port 9222 for Chrome debugging.

### Q: Where are the logs stored?

**A:** Logs are stored in memory only (not written to files). They're visible in the UI and disappear when the session ends.

### Q: How do I update to the latest version?

**A:**
```bash
cd ~/Documents/github/Matter-Automation/matter-automation-ui
git pull origin main
npm install
```

### Q: Can I process multiple firms at once?

**A:** Not currently. The tool switches to one firm at a time. Future versions may support batch processing.

### Q: What if I get a 2FA code but it expires?

**A:** The automation will wait for you to enter it. If it expires:
1. Request a new code
2. Enter the new code
3. The automation will continue

---

## Project Structure

```
matter-automation-ui/
├── app/
│   ├── api/                                    # Backend API endpoints
│   │   ├── chrome/
│   │   │   ├── start/route.ts                 # Start Chrome
│   │   │   ├── stop/route.ts                  # Stop Chrome
│   │   │   └── status/route.ts                # Get Chrome status
│   │   ├── bulk-matter-upload/route.ts        # Matter upload automation
│   │   ├── get-firms/route.ts                 # Fetch law firms
│   │   ├── stream-logs/route.ts               # Real-time log streaming
│   │   └── test-browser/route.ts              # Browser connection test
│   ├── features/                               # Feature modules
│   │   ├── chromeManagement/                  # Chrome control feature
│   │   │   ├── api/                           # Chrome API clients
│   │   │   ├── components/                    # Chrome UI components
│   │   │   ├── hooks/                         # Chrome React hooks
│   │   │   └── types/                         # Chrome TypeScript types
│   │   └── lawmatics/                          # Lawmatics integration
│   │       ├── api/                            # Lawmatics API clients
│   │       ├── components/                     # Lawmatics UI components
│   │       │   ├── BulkMatterUploadForm.tsx   # Bulk upload form (legacy)
│   │       │   ├── FirmSelector.tsx           # Firm dropdown
│   │       │   ├── OpenLawmaticsButton.tsx    # Login button
│   │       │   └── TestingDocumentUpload.tsx  # Main upload component
│   │       ├── hooks/                          # Lawmatics React hooks
│   │       └── types/                          # Lawmatics TypeScript types
│   ├── page.tsx                                # Main UI page
│   ├── layout.tsx                              # App layout
│   └── globals.css                             # Global styles
├── components/
│   ├── LogViewer.tsx                           # Real-time log viewer
│   └── StatusIndicator.tsx                     # Status display
├── lib/
│   └── logStore.ts                             # In-memory log storage
├── scripts/                                    # Python automation scripts
│   ├── bulk_matter_upload.py                   # Main upload automation
│   ├── playwright_controller.py                # Browser controller
│   ├── form_automation.py                      # Form filling automation
│   ├── auth/
│   │   └── google_login.py                     # Google OAuth login
│   ├── navigation/
│   │   ├── sidebar.py                          # Lawmatics sidebar navigation
│   │   └── firm_selection_from_profile/       # Extracted firm data
│   │       ├── lawmatics_firms.json            # Raw extracted firms
│   │       └── firms_cleaned.json              # Cleaned firm list
│   ├── utils/
│   │   └── logger.py                           # Structured logging
│   └── requirements.txt                        # Python dependencies
├── .env.example                                # Environment template
├── .env.local                                  # Your secrets (gitignored)
├── .gitignore                                  # Git ignore rules
├── package.json                                # Node.js dependencies
├── tsconfig.json                               # TypeScript config
└── README.md                                   # This file
```

---

## Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linter
npm run lint

# Check Python script syntax
python3 -m py_compile scripts/bulk_matter_upload.py
```

---

## Support

**If you encounter issues:**

1. Check this README's [Troubleshooting](#troubleshooting) section
2. Check the [FAQ](#faq)
3. Look at the error message in the logs
4. Check browser console (F12) for JavaScript errors
5. Check terminal for Python errors

**For help:**
- Ask Jonathan (jonathan@legaleasemarketing.com)
- Check the GitHub repository for updates
- Create an issue on GitHub with:
  - What you were trying to do
  - What happened instead
  - Error messages from logs
  - Screenshots if helpful

---

## Recent Updates

**Latest features:**
- ✅ Firm selection dropdown with auto-extraction
- ✅ Auto-scroll with lock/unlock in log viewer
- ✅ Minimize button for Chrome details
- ✅ Auto-page-reload after firm extraction
- ✅ Password moved to environment variables
- ✅ Improved error messages and logging
- ✅ Fixed log streaming race conditions

---

## License

For internal use only by LegalEase Marketing team.

---

**Happy Automating! 🚀**

If you found a bug or have suggestions, please let the team know!
