'use client';

import { useState, useCallback } from 'react';
import { startChrome } from '../api/startChrome';
import { stopChrome } from '../api/stopChrome';
import { getChromeStatus } from '../api/getChromeStatus';
import type { ChromeStatusResponse } from '../types/chrome.types';

export const useChromeManager = (cdpUrl: string, onCdpUrlChange?: (url: string) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [chromeStatus, setChromeStatus] = useState<ChromeStatusResponse | null>(null);

  const handleStartChrome = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await startChrome({ port: 9222 });

      alert(`✓ ${response.message}\nCDP URL: ${response.cdpUrl}`);
      if (response.cdpUrl && onCdpUrlChange) {
        onCdpUrlChange(response.cdpUrl);
      }
    } catch (error) {
      alert(`✗ ${error instanceof Error ? error.message : 'Failed to start Chrome'}`);
    } finally {
      setIsLoading(false);
    }
  }, [onCdpUrlChange]);

  const handleStopChrome = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await stopChrome({ port: 9222 });
      alert(`✓ ${response.message}`);
      setChromeStatus(null);
    } catch (error) {
      alert(`✗ ${error instanceof Error ? error.message : 'Failed to stop Chrome'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGetBrowserDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getChromeStatus({ cdpUrl });
      setChromeStatus(response);

      if (!response.success || !response.running) {
        alert(`Browser not accessible:\n${response.message}`);
      }
    } catch (error) {
      alert(`Error checking browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setChromeStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [cdpUrl]);

  return {
    isLoading,
    chromeStatus,
    handleStartChrome,
    handleStopChrome,
    handleGetBrowserDetails,
  };
};
