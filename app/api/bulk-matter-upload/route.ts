import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { logStore, addLog } from '@/lib/logStore';

export async function POST(request: NextRequest) {
  try {
    console.log('[bulk-matter-upload] API endpoint hit');
    const { cdpUrl, selectedFirm } = await request.json();
    console.log('[bulk-matter-upload] Received cdpUrl:', cdpUrl);
    console.log('[bulk-matter-upload] Received selectedFirm:', selectedFirm);

    if (!cdpUrl) {
      console.error('[bulk-matter-upload] CDP URL is missing');
      return NextResponse.json(
        { error: 'CDP URL is required' },
        { status: 400 }
      );
    }

    if (!selectedFirm) {
      console.error('[bulk-matter-upload] Selected firm is missing');
      return NextResponse.json(
        { error: 'Selected firm is required. Please select a law firm from the dropdown.' },
        { status: 400 }
      );
    }

    const sessionId = Date.now().toString();
    console.log('[bulk-matter-upload] Created sessionId:', sessionId);

    // Initialize empty log array first
    logStore.set(sessionId, []);
    console.log('[bulk-matter-upload] Initialized empty log array');

    // Add initial logs using addLog function
    addLog(sessionId, {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Starting automation for firm: ${selectedFirm}`
    });
    console.log('[bulk-matter-upload] Added first log');

    addLog(sessionId, {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Connecting to browser at: ${cdpUrl}`
    });
    console.log('[bulk-matter-upload] Added second log');

    // Verify logs were set
    const verifyLogs = logStore.get(sessionId);
    console.log('[bulk-matter-upload] Verified logs in store:', verifyLogs?.length);
    console.log('[bulk-matter-upload] Verified log contents:', JSON.stringify(verifyLogs));
    console.log('[bulk-matter-upload] All sessions in store:', Array.from(logStore.keys()));

    // Path to the Python script and venv
    const scriptPath = path.join(process.cwd(), 'scripts', 'bulk_matter_upload.py');
    const pythonPath = path.join(process.cwd(), '..', 'venv', 'bin', 'python3');

    console.log('[bulk-matter-upload] Python path:', pythonPath);
    console.log('[bulk-matter-upload] Script path:', scriptPath);

    // Spawn the Python process using venv python
    const args = [scriptPath, cdpUrl, selectedFirm];
    console.log('[bulk-matter-upload] Spawning Python with args:', args.length, 'arguments');

    const pythonProcess = spawn(pythonPath, args);

    // Handle spawn errors
    pythonProcess.on('error', (err) => {
      console.error('[bulk-matter-upload] Failed to spawn Python process:', err);
      addLog(sessionId, {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Failed to start Python script: ${err.message}`,
        type: 'error'
      });
    });

    // Capture stdout
    pythonProcess.stdout.on('data', (data) => {
      console.log('[bulk-matter-upload] Received stdout data:', data.toString().substring(0, 200));
      const lines = data.toString().split('\n').filter((line: string) => line.trim());
      console.log('[bulk-matter-upload] Parsed lines:', lines.length);

      lines.forEach((line: string) => {
        try {
          const log = JSON.parse(line);
          console.log('[bulk-matter-upload] Adding JSON log:', log.message);
          addLog(sessionId, log);
        } catch (e) {
          // If not JSON, add as plain text log
          console.log('[bulk-matter-upload] Adding plain text log:', line.substring(0, 100));
          addLog(sessionId, {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: line
          });
        }
      });

      const currentLogs = logStore.get(sessionId) || [];
      console.log('[bulk-matter-upload] Total logs in store now:', currentLogs.length);
    });

    // Capture stderr
    pythonProcess.stderr.on('data', (data) => {
      console.log('[bulk-matter-upload] Received stderr:', data.toString());
      addLog(sessionId, {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: data.toString()
      });
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      console.log('[bulk-matter-upload] Python process closed with code:', code);
      if (code === 0) {
        addLog(sessionId, {
          timestamp: new Date().toISOString(),
          level: 'success',
          message: 'Firm selection automation completed successfully',
          type: 'complete'
        });
      } else {
        addLog(sessionId, {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Firm selection automation failed with exit code ${code}`,
          type: 'error'
        });
      }
      console.log('[bulk-matter-upload] Final log count:', logStore.get(sessionId)?.length);
    });

    console.log('[bulk-matter-upload] Returning success response with sessionId:', sessionId);
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Bulk matter upload automation started'
    });

  } catch (error) {
    console.error('[bulk-matter-upload] Error in API:', error);
    return NextResponse.json(
      { error: 'Failed to start bulk matter upload automation', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
