import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { logStore, addLog } from '@/lib/logStore';

export async function POST(request: NextRequest) {
  try {
    console.log('[test-browser] API endpoint hit');
    const { cdpUrl } = await request.json();

    // Read password from environment variable
    const password = process.env.LAWMATICS_PASSWORD;
    console.log('[test-browser] Received cdpUrl:', cdpUrl, 'password length:', password?.length || 0);

    if (!cdpUrl) {
      return NextResponse.json(
        { error: 'CDP URL is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'LAWMATICS_PASSWORD environment variable is not set' },
        { status: 500 }
      );
    }

    const sessionId = Date.now().toString();
    console.log('[test-browser] Created sessionId:', sessionId);
    logStore.set(sessionId, []);

    // Add initial log
    logStore.set(sessionId, [{
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Starting browser automation...'
    }]);

    // Path to the Python script and venv
    const scriptPath = path.join(process.cwd(), 'scripts', 'playwright_controller.py');
    const pythonPath = path.join(process.cwd(), '..', 'venv', 'bin', 'python3');

    console.log('[test-browser] Python path:', pythonPath);
    console.log('[test-browser] Script path:', scriptPath);

    // Spawn the Python process using venv python with password from env
    const args = [scriptPath, cdpUrl, password];
    console.log('[test-browser] Spawning Python with args:', args.length, 'arguments');

    const pythonProcess = spawn(pythonPath, args);

    // Handle spawn errors
    pythonProcess.on('error', (err) => {
      console.error('[test-browser] Failed to spawn Python process:', err);
      const logs = logStore.get(sessionId) || [];
      logs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Failed to start Python script: ${err.message}`,
        type: 'error'
      });
      logStore.set(sessionId, logs);
    });

    // Capture stdout
    pythonProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter((line: string) => line.trim());
      const logs = logStore.get(sessionId) || [];

      lines.forEach((line: string) => {
        try {
          const log = JSON.parse(line);
          logs.push(log);
        } catch (e) {
          // If not JSON, add as plain text log
          logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: line
          });
        }
      });

      logStore.set(sessionId, logs);
    });

    // Capture stderr
    pythonProcess.stderr.on('data', (data) => {
      const logs = logStore.get(sessionId) || [];
      logs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: data.toString()
      });
      logStore.set(sessionId, logs);
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      const logs = logStore.get(sessionId) || [];
      if (code === 0) {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'success',
          message: 'Test completed successfully',
          type: 'complete'
        });
      } else {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Test failed with exit code ${code}`,
          type: 'error'
        });
      }
      logStore.set(sessionId, logs);
    });

    console.log('[test-browser] Returning success response with sessionId:', sessionId);
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Test started'
    });

  } catch (error) {
    console.error('[test-browser] Error in API:', error);
    return NextResponse.json(
      { error: 'Failed to start browser test', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
