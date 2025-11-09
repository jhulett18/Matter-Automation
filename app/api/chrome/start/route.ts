import { NextRequest, NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { port = 9222 } = await request.json();

    // Check if Chrome is already running on this port
    try {
      const { stdout } = await execAsync(`lsof -i :${port} 2>/dev/null || true`);
      if (stdout && stdout.includes('LISTEN')) {
        return NextResponse.json({
          success: false,
          message: `Port ${port} is already in use. Chrome may already be running with debugging. Use "Stop Chrome" first.`,
          alreadyRunning: true
        }, { status: 400 });
      }
    } catch (e) {
      // lsof not available or error, continue anyway
    }

    // Copy work profile to temporary directory for debugging
    // Chrome blocks debugging on production profiles, so we copy it
    const sourceProfileDir = '/home/kawalski/.config/google-chrome/Profile 5';
    const chromeDataDir = '/tmp/chrome-debug-automation';
    const profileDirectory = 'Default';

    // Create temp directory and copy profile
    try {
      await execAsync(`rm -rf ${chromeDataDir}`);
      await execAsync(`mkdir -p ${chromeDataDir}/Default`);

      // Copy important files that contain sessions and cookies
      await execAsync(`cp -r "${sourceProfileDir}/Cookies" "${chromeDataDir}/Default/" 2>/dev/null || true`);
      await execAsync(`cp -r "${sourceProfileDir}/Cookies-journal" "${chromeDataDir}/Default/" 2>/dev/null || true`);
      await execAsync(`cp -r "${sourceProfileDir}/Login Data" "${chromeDataDir}/Default/" 2>/dev/null || true`);
      await execAsync(`cp -r "${sourceProfileDir}/Login Data-journal" "${chromeDataDir}/Default/" 2>/dev/null || true`);
      await execAsync(`cp -r "${sourceProfileDir}/Preferences" "${chromeDataDir}/Default/" 2>/dev/null || true`);
      await execAsync(`cp -r "${sourceProfileDir}/Network" "${chromeDataDir}/Default/" 2>/dev/null || true`);
      await execAsync(`cp -r "${sourceProfileDir}/Local Storage" "${chromeDataDir}/Default/" 2>/dev/null || true`);
      await execAsync(`cp -r "${sourceProfileDir}/Session Storage" "${chromeDataDir}/Default/" 2>/dev/null || true`);
    } catch (e) {
      console.error('Error copying profile:', e);
      // Continue anyway
    }

    // Kill any existing Chrome instances using debug port
    try {
      await execAsync(`pkill -f "chrome.*remote-debugging-port=${port}" 2>/dev/null || true`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      // Ignore errors
    }

    // Find Chrome binary
    let chromeBin = '';
    const binaries = ['google-chrome', 'google-chrome-stable', 'chromium-browser', 'chromium'];

    for (const bin of binaries) {
      try {
        await execAsync(`command -v ${bin}`);
        chromeBin = bin;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!chromeBin) {
      return NextResponse.json({
        success: false,
        message: 'Chrome/Chromium not found. Please install Chrome first.'
      }, { status: 404 });
    }

    // Start Chrome in background with work profile
    const chromeProcess = spawn(chromeBin, [
      `--remote-debugging-port=${port}`,
      `--remote-debugging-address=127.0.0.1`,
      `--user-data-dir=${chromeDataDir}`,
      `--profile-directory=${profileDirectory}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-features=RendererCodeIntegrity'
    ], {
      detached: true,
      stdio: 'ignore'
    });

    chromeProcess.unref();

    // Wait and verify Chrome is listening on the port (retry up to 10 times)
    let isListening = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const { stdout } = await execAsync(`lsof -i :${port} 2>/dev/null || true`);
        if (stdout && stdout.includes('LISTEN')) {
          isListening = true;
          break;
        }
      } catch (e) {
        // Continue checking
      }
    }

    if (isListening) {
      return NextResponse.json({
        success: true,
        message: `Chrome started successfully on port ${port} with work profile (${profileDirectory})`,
        cdpUrl: `http://localhost:${port}`,
        dataDir: chromeDataDir,
        profileDirectory: profileDirectory
      });
    } else {
      // Check if Chrome process is running at all
      try {
        const { stdout } = await execAsync(`pgrep -f "chrome.*${port}" 2>/dev/null || true`);
        if (stdout.trim()) {
          return NextResponse.json({
            success: false,
            message: `Chrome started but not listening on port ${port}. This usually means Chrome is already running. Try closing all Chrome windows and use "Stop Chrome" button first.`,
            hint: 'Close all Chrome windows manually, then click "Stop Chrome" and try again.'
          }, { status: 500 });
        } else {
          return NextResponse.json({
            success: false,
            message: `Chrome failed to start. Check that Chrome is installed and not already running.`
          }, { status: 500 });
        }
      } catch (e) {
        return NextResponse.json({
          success: false,
          message: `Chrome started but verification failed. It may be running - try "Open Lawmatics" anyway.`,
          cdpUrl: `http://localhost:${port}`
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error starting Chrome:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to start Chrome',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
