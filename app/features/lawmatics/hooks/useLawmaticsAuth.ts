'use client';

import { useState, useCallback } from 'react';
import { openLawmatics } from '../api/openLawmatics';
import type { LawmaticsLog } from '../types/lawmatics.types';

type Status = 'idle' | 'testing' | 'processing' | 'running' | 'complete' | 'error';

export const useLawmaticsAuth = (cdpUrl: string) => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [logs, setLogs] = useState<LawmaticsLog[]>([]);

  const handleOpenLawmatics = useCallback(async () => {
    console.log('[useLawmaticsAuth] Opening Lawmatics');
    setStatus('testing');
    setLogs([]);

    try {
      const response = await openLawmatics({ cdpUrl, password });
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
  }, [cdpUrl, password]);

  return {
    password,
    setPassword,
    status,
    logs,
    handleOpenLawmatics,
    isLoading: status === 'testing' || status === 'running',
  };
};
