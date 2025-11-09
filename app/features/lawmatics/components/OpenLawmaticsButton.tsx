'use client';

import React from 'react';
import { useLawmaticsAuth } from '../hooks/useLawmaticsAuth';

interface OpenLawmaticsButtonProps {
  cdpUrl: string;
  onLogsChange?: (logs: any[]) => void;
  onStatusChange?: (status: string) => void;
}

export const OpenLawmaticsButton = ({
  cdpUrl,
  onLogsChange,
  onStatusChange,
}: OpenLawmaticsButtonProps) => {
  const {
    password,
    setPassword,
    status,
    logs,
    handleOpenLawmatics,
    isLoading,
  } = useLawmaticsAuth(cdpUrl);

  // Sync logs and status to parent if callbacks provided
  React.useEffect(() => {
    if (onLogsChange) {
      onLogsChange(logs);
    }
  }, [logs, onLogsChange]);

  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Open Lawmatics
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password (for jonathan@legaleasemarketing.com)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your Google password"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Will auto-login via Google OAuth. You'll need to manually enter 2FA code.
        </p>
      </div>

      <button
        onClick={handleOpenLawmatics}
        disabled={isLoading || !password}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
      >
        {status === 'testing' ? 'Opening...' : 'Open Lawmatics Dashboard'}
      </button>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Opens https://app.lawmatics.com/dashboard and auto-logs in
      </p>
    </div>
  );
};