import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { logStore, addLog } from '@/lib/logStore';

export async function POST(request: NextRequest) {
  try {
    const { cdpUrl, formData } = await request.json();

    if (!cdpUrl) {
      return NextResponse.json(
        { error: 'CDP URL is required' },
        { status: 400 }
      );
    }

    if (!formData) {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400 }
      );
    }

    const sessionId = Date.now().toString();
    logStore.set(sessionId, []);

    // Path to the Python script and venv
    const scriptPath = path.join(process.cwd(), 'scripts', 'form_automation.py');
    const pythonPath = path.join(process.cwd(), '..', 'venv', 'bin', 'python3');

    // Convert formData to JSON string for passing to Python
    const formDataJson = JSON.stringify(formData);

    // Spawn the Python process using venv python
    const pythonProcess = spawn(pythonPath, [scriptPath, cdpUrl, formDataJson]);

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
          message: 'Automation completed successfully',
          type: 'complete'
        });
      } else {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Automation failed with exit code ${code}`,
          type: 'error'
        });
      }
      logStore.set(sessionId, logs);
    });

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Automation started'
    });

  } catch (error) {
    console.error('Error in run-automation:', error);
    return NextResponse.json(
      { error: 'Failed to start automation' },
      { status: 500 }
    );
  }
}
