import { NextRequest } from 'next/server';
import { logStore, clearLogs } from '@/lib/logStore';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Session ID required', { status: 400 });
  }

  // Set up Server-Sent Events
  const encoder = new TextEncoder();
  let lastSentIndex = 0;

  const stream = new ReadableStream({
    async start(controller) {
      // Poll for new logs every 100ms
      const interval = setInterval(() => {
        const logs = logStore.get(sessionId) || [];

        // Send only new logs since last check
        if (logs.length > lastSentIndex) {
          const newLogs = logs.slice(lastSentIndex);
          newLogs.forEach(log => {
            const data = `data: ${JSON.stringify(log)}\n\n`;
            controller.enqueue(encoder.encode(data));
          });
          lastSentIndex = logs.length;
        }

        // Check if the session is complete or errored
        const lastLog = logs[logs.length - 1];
        if (lastLog && (lastLog.type === 'complete' || lastLog.type === 'error')) {
          clearInterval(interval);
          controller.close();
        }
      }, 100);

      // Clean up after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
        clearLogs(sessionId);
      }, 5 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
