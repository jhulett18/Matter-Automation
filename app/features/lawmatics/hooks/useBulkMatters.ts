'use client';

import { useState, useCallback } from 'react';
import { runBulkMatters } from '../api/bulkMatters';
import type { LawmaticsLog } from '../types/lawmatics.types';

type Status = 'idle' | 'running' | 'complete' | 'error';

export const useBulkMatters = (cdpUrl: string) => {
  const [data, setData] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [logs, setLogs] = useState<LawmaticsLog[]>([]);

  const handleRunBulkMatters = useCallback(async () => {
    console.log('[useBulkMatters] Running bulk matters automation');
    setStatus('running');
    setLogs([]);

    try {
      const response = await runBulkMatters({ cdpUrl, data });
      const sessionId = response.sessionId;

      console.log('[useBulkMatters] Got sessionId:', sessionId);

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
      console.error('[useBulkMatters] Error:', error);
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
  }, [cdpUrl, data]);

  return {
    data,
    setData,
    status,
    logs,
    handleRunBulkMatters,
    isLoading: status === 'running',
  };
};
