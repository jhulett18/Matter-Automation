'use client';

import { useState, useCallback } from 'react';
import { openLawmatics } from '../api/openLawmatics';
import type { LawmaticsLog } from '../types/lawmatics.types';

type Status = 'idle' | 'testing' | 'processing' | 'running' | 'complete' | 'error';

export const useLawmaticsAuth = (cdpUrl: string) => {
  const [status, setStatus] = useState<Status>('idle');
  const [logs, setLogs] = useState<LawmaticsLog[]>([]);

  const handleOpenLawmatics = useCallback(async () => {
    console.log('[useLawmaticsAuth] Opening Lawmatics');
    setStatus('testing');
    setLogs([]);

    try {
      const response = await openLawmatics({ cdpUrl });
      const sessionId = response.sessionId;

      console.log('[useLawmaticsAuth] Got sessionId:', sessionId);

      // Set up EventSource for real-time logs
      const eventSource = new EventSource(`/api/stream-logs?sessionId=${sessionId}`);

      eventSource.onmessage = (event) => {
        const log: LawmaticsLog = JSON.parse(event.data);

        if (log.type === 'complete') {
          setStatus('complete');
          eventSource.close();
        } else if (log.type === 'error') {
          setStatus('error');
          eventSource.close();
        } else {
          setLogs((prev) => [...prev, log]);

          // Check if firms extraction completed and reload page
          if (log.message === 'FIRMS_EXTRACTION_COMPLETE') {
            console.log('[useLawmaticsAuth] Firms extraction complete, reloading page in 2 seconds...');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      };

      eventSource.onerror = () => {
        setStatus('error');
        eventSource.close();
      };
    } catch (error) {
      console.error('[useLawmaticsAuth] Error:', error);
      setStatus('error');
      setLogs((prev) => [
        ...prev,
        {
          level: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [cdpUrl]);

  return {
    status,
    logs,
    handleOpenLawmatics,
    isLoading: status === 'testing' || status === 'running',
  };
};
