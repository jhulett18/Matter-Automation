import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { logStore, addLog } from '@/lib/logStore';

export async function POST(request: NextRequest) {
  try {
    console.log('[bulk-matters] API endpoint hit');
    const { cdpUrl } = await request.json();
    console.log('[bulk-matters] Received cdpUrl:', cdpUrl);

    if (!cdpUrl) {
      return NextResponse.json(
        { error: 'CDP URL is required' },
        { status: 400 }
      );
    }

    const sessionId = Date.now().toString();
    console.log('[bulk-matters] Created sessionId:', sessionId);
    logStore.set(sessionId, []);

    // Add initial log
    logStore.set(sessionId, [{
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Starting bulk matters automation...'
    }]);

    // Path to the Python script and venv
    const scriptPath = path.join(process.cwd(), 'scripts', 'bulk_matters.py');
    const pythonPath = path.join(process.cwd(), '..', 'venv', 'bin', 'python3');

    console.log('[bulk-matters] Python path:', pythonPath);
    console.log('[bulk-matters] Script path:', scriptPath);

    // Spawn the Python process using venv python
    const args = [scriptPath, cdpUrl];
    console.log('[bulk-matters] Spawning Python with args:', args.length, 'arguments');

    const pythonProcess = spawn(pythonPath, args);

    // Handle spawn errors
    pythonProcess.on('error', (err) => {
      console.error('[bulk-matters] Failed to spawn Python process:', err);
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
          message: 'Bulk matters automation completed successfully',
          type: 'complete'
        });
      } else {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Bulk matters automation failed with exit code ${code}`,
          type: 'error'
        });
      }
      logStore.set(sessionId, logs);
    });

    console.log('[bulk-matters] Returning success response with sessionId:', sessionId);
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Bulk matters automation started'
    });

  } catch (error) {
    console.error('[bulk-matters] Error in API:', error);
    return NextResponse.json(
      { error: 'Failed to start bulk matters automation', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
