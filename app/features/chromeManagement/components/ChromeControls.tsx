'use client';

import React from 'react';
import { useChromeManager } from '../hooks/useChromeManager';

interface ChromeControlsProps {
  cdpUrl: string;
  onCdpUrlChange?: (url: string) => void;
  onStatusChange?: (status: any) => void;
}

export const ChromeControls = ({
  cdpUrl,
  onCdpUrlChange,
  onStatusChange,
}: ChromeControlsProps) => {
  const {
    isLoading,
    chromeStatus,
    handleStartChrome,
    handleStopChrome,
    handleGetBrowserDetails,
  } = useChromeManager(cdpUrl, onCdpUrlChange);

  // Sync status to parent if callback provided
  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(chromeStatus);
    }
  }, [chromeStatus, onStatusChange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Chrome Management
      </h2>

      <div className="space-y-3">
        <button
          onClick={handleStartChrome}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Starting...' : 'Start Chrome'}
        </button>

        <button
          onClick={handleStopChrome}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Stopping...' : 'Stop Chrome'}
        </button>

        <button
          onClick={handleGetBrowserDetails}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking...' : 'Get Browser Details'}
        </button>
      </div>
    </div>
  );
};
