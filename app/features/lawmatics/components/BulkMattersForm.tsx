'use client';

import React from 'react';
import { useBulkMatters } from '../hooks/useBulkMatters';

interface BulkMattersFormProps {
  cdpUrl: string;
  onLogsChange?: (logs: any[]) => void;
  onStatusChange?: (status: string) => void;
}

export const BulkMattersForm = ({
  cdpUrl,
  onLogsChange,
  onStatusChange,
}: BulkMattersFormProps) => {
  const {
    data,
    setData,
    status,
    logs,
    handleRunBulkMatters,
    isLoading,
  } = useBulkMatters(cdpUrl);

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
        Bulk Matters Update
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bulk Matters Data
        </label>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter bulk matters data (optional for now)"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This will navigate to the Bulk Matters page in Lawmatics. Data processing coming soon.
        </p>
      </div>

      <button
        onClick={handleRunBulkMatters}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
      >
        {status === 'running' ? 'Running...' : 'Run Bulk Matters Update'}
      </button>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Navigates to Bulk Matters via sidebar menu
      </p>
    </div>
  );
};
