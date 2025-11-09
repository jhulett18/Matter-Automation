import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { port = 9222 } = await request.json();

    // Find Chrome process using the port
    try {
      const { stdout } = await execAsync(`lsof -ti :${port} 2>/dev/null || true`);

      if (!stdout || !stdout.trim()) {
        return NextResponse.json({
          success: false,
          message: `No Chrome process found on port ${port}`
        }, { status: 404 });
      }

      const pids = stdout.trim().split('\n');

      // Kill all processes using this port
      for (const pid of pids) {
        if (pid) {
          await execAsync(`kill ${pid} 2>/dev/null || true`);
        }
      }

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify processes are stopped
      const { stdout: checkStdout } = await execAsync(`lsof -ti :${port} 2>/dev/null || true`);

      if (checkStdout && checkStdout.trim()) {
        // Force kill if still running
        const remainingPids = checkStdout.trim().split('\n');
        for (const pid of remainingPids) {
          if (pid) {
            await execAsync(`kill -9 ${pid} 2>/dev/null || true`);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Chrome on port ${port} stopped successfully`,
        killedPids: pids.filter(p => p)
      });

    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to stop Chrome',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error stopping Chrome:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to stop Chrome',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
