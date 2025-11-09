'use client';

import { useState, useCallback } from 'react';
import { runBulkMatterUpload } from '../api/bulkMatterUpload';
import type { LawmaticsLog } from '../types/lawmatics.types';

type Status = 'idle' | 'running' | 'complete' | 'error';

export const useBulkMatterUpload = (cdpUrl: string) => {
  const [data, setData] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [logs, setLogs] = useState<LawmaticsLog[]>([]);

  const handleRunBulkMatterUpload = useCallback(async (selectedFirm?: string) => {
    console.log('[useBulkMatterUpload] Running bulk matter upload automation');
    console.log('[useBulkMatterUpload] CDP URL:', cdpUrl);
    console.log('[useBulkMatterUpload] Selected Firm:', selectedFirm);
    setStatus('running');
    setLogs([]);

    try {
      const response = await runBulkMatterUpload({ cdpUrl, data, selectedFirm });
      console.log('[useBulkMatterUpload] API response:', response);
      const sessionId = response.sessionId;

      console.log('[useBulkMatterUpload] Got sessionId:', sessionId);

      // Set up EventSource for real-time logs
      const eventSource = new EventSource(`/api/stream-logs?sessionId=${sessionId}`);

      eventSource.onmessage = (event) => {
        console.log('[useBulkMatterUpload] Received log event:', event.data);
        const log: LawmaticsLog = JSON.parse(event.data);

        if (log.type === 'complete') {
          console.log('[useBulkMatterUpload] Process completed');
          setStatus('complete');
          eventSource.close();
        } else if (log.type === 'error') {
          console.log('[useBulkMatterUpload] Process error');
          setStatus('error');
          eventSource.close();
        } else {
          setLogs((prev) => [...prev, log]);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[useBulkMatterUpload] EventSource error:', error);
        setStatus('error');
        setLogs((prev) => [
          ...prev,
          {
            level: 'error',
            message: 'Lost connection to log stream',
            timestamp: new Date().toISOString(),
          },
        ]);
        eventSource.close();
      };
    } catch (error) {
      console.error('[useBulkMatterUpload] Error:', error);
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
    handleRunBulkMatterUpload,
    isLoading: status === 'running',
  };
};
