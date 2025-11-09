# Matter Automation

A Next.js application for automating form filling using remote browser control via Playwright and Claude AI for document parsing.

## Features

- **Chrome Management**: Start, stop, and monitor Chrome with built-in controls
- **Remote Browser Control**: Connect to Chrome via Chrome DevTools Protocol (CDP)
- **Browser Details**: View Chrome version, open tabs, and process information
- **Test Browser Connection**: Simple button to verify remote Chrome connection
- **Document Upload & Parsing**: Upload documents and use Claude AI to extract form data
- **Automated Form Filling**: Automatically fill forms with parsed data
- **Real-time Logs**: Stream logs in real-time using Server-Sent Events

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Google Chrome
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

## Setup

### 1. Install Node.js Dependencies

```bash
cd matter-automation-ui
npm install
```

### 2. Install Python Dependencies

Create a virtual environment in the parent directory and install dependencies:

```bash
cd /home/kawalski/Documents/github/matter-automation
python3 -m venv venv
./venv/bin/pip install -r matter-automation-ui/scripts/requirements.txt
./venv/bin/playwright install chromium
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your Anthropic API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

## Usage

### 1. Start Chrome with Remote Debugging

Before using the application, you need to start Chrome with remote debugging enabled:

```bash
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
```

Or on macOS:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
```

### 2. Start the Next.js Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Using the Application

#### Chrome Management (New!)

No need to manually start Chrome! Use the built-in buttons:

1. **Start Chrome**: Click to launch Chrome with remote debugging enabled automatically
2. **Stop Chrome**: Click to stop the running Chrome instance
3. **Get Details**: View browser version, open tabs, and connection status

#### Testing and Automation

1. **Start or Connect to Chrome**:
   - Click "Start Chrome" button (easiest), or
   - Manually start Chrome with debugging, or
   - Enter an existing CDP URL

2. **Test Connection**: Click "Test Browser Connection" to verify
   - Opens a new tab with Google in the remote Chrome
   - Check the real-time logs for success/error messages

3. **Upload Document**: Upload a document (PDF, etc.) containing client information
   - The document will be sent to Claude AI for parsing
   - Extracted data will include: client name, email, state, etc.

4. **Run Automation**: Click "Run Form Automation" to execute the form filling
   - Make sure you've uploaded and parsed a document first
   - The script will fill the form with the extracted data
   - Watch the real-time logs for progress

## Project Structure

```
matter-automation-ui/
├── app/
│   ├── api/
│   │   ├── test-browser/     # API endpoint for testing browser connection
│   │   ├── upload/            # API endpoint for document upload & parsing
│   │   ├── run-automation/    # API endpoint for running automation
│   │   └── stream-logs/       # Server-Sent Events endpoint for logs
│   └── page.tsx               # Main UI page
├── components/
│   ├── LogViewer.tsx          # Real-time log viewer component
│   └── StatusIndicator.tsx    # Status indicator component
├── lib/
│   └── logStore.ts            # Shared log storage
├── scripts/
│   ├── test_browser.py        # Python script to test browser connection
│   ├── form_automation.py     # Python script for form automation
│   └── requirements.txt       # Python dependencies
└── .env.local                 # Environment variables (not in git)
```

## Customizing Form Automation

To customize the form automation for your specific use case, edit `scripts/form_automation.py`:

1. Update the CSS selectors to match your form fields
2. Modify the field mapping in the form_data parsing
3. Add additional fields as needed

Example:

```python
# Change these selectors to match your form
page.fill("#your_name_field", client_name)
page.fill("#your_email_field", email)
page.select_option("#your_state_dropdown", state)
page.click("#your_submit_button")
```

## Troubleshooting

### Chrome Connection Issues

- Make sure Chrome is running with the `--remote-debugging-port=9222` flag
- Check that no other process is using port 9222
- Try restarting Chrome with the debugging flag

### Python Script Errors

- Ensure Python 3.8+ is installed
- Verify Playwright is installed: `playwright install chromium`
- Check that the script has execution permissions: `chmod +x scripts/*.py`

### Claude API Issues

- Verify your API key is correctly set in `.env.local`
- Check that you have API credits available
- Ensure the document format is supported (PDF, images, etc.)

## Development

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## License

For personal use only.
