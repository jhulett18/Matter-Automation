import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { cdpUrl } = await request.json();

    if (!cdpUrl) {
      return NextResponse.json({
        success: false,
        message: 'CDP URL is required'
      }, { status: 400 });
    }

    // Extract port from CDP URL
    const portMatch = cdpUrl.match(/:(\d+)/);
    const port = portMatch ? portMatch[1] : '9222';

    // Check if port is in use
    try {
      const { stdout } = await execAsync(`lsof -i :${port} 2>/dev/null || true`);

      if (!stdout || !stdout.includes('LISTEN')) {
        return NextResponse.json({
          success: false,
          running: false,
          message: `No Chrome process found on port ${port}`,
          cdpUrl,
          port
        });
      }

      // Parse lsof output to get process details
      const lines = stdout.trim().split('\n');
      const processLines = lines.filter(line => line.includes('LISTEN'));

      const processes = processLines.map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          command: parts[0],
          pid: parts[1],
          user: parts[2]
        };
      });

      // Try to fetch version info from CDP
      let version = null;
      let browserInfo = null;

      try {
        const versionResponse = await fetch(`${cdpUrl}/json/version`);
        if (versionResponse.ok) {
          browserInfo = await versionResponse.json();
          version = browserInfo['Browser'] || browserInfo['User-Agent'] || null;
        }
      } catch (e) {
        // CDP not responding, but process exists
      }

      // Try to get open pages
      let pages = [];
      try {
        const pagesResponse = await fetch(`${cdpUrl}/json/list`);
        if (pagesResponse.ok) {
          pages = await pagesResponse.json();
        }
      } catch (e) {
        // Can't get pages
      }

      return NextResponse.json({
        success: true,
        running: true,
        message: 'Chrome is running and accessible',
        cdpUrl,
        port,
        processes,
        version,
        browserInfo,
        openPages: pages.length,
        pages: pages.slice(0, 5).map((p: any) => ({
          title: p.title,
          url: p.url,
          type: p.type
        }))
      });

    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Error checking Chrome status',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error checking Chrome status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check Chrome status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
