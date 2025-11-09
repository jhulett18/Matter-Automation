'use client';

import React from 'react';
import { useBulkMatterUpload } from '../hooks/useBulkMatterUpload';

interface TestingDocumentUploadProps {
  cdpUrl: string;
  selectedFirm: string;
  selectedDocument: string;
  onLogsChange?: (logs: any[]) => void;
  onStatusChange?: (status: string) => void;
}

export const TestingDocumentUpload = ({
  cdpUrl,
  selectedFirm,
  selectedDocument,
  onLogsChange,
  onStatusChange,
}: TestingDocumentUploadProps) => {
  const {
    data,
    setData,
    status,
    logs,
    handleRunBulkMatterUpload,
    isLoading,
  } = useBulkMatterUpload(cdpUrl);

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

  // Pass selectedFirm and selectedDocument to handleRunBulkMatterUpload
  const handleSubmit = () => {
    handleRunBulkMatterUpload(selectedFirm, selectedDocument);
  };

  const isDisabled = isLoading || !selectedFirm || !selectedDocument;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Testing Document Upload
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Document Data
        </label>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter document data (optional for now)"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This will switch to the selected law firm account in Lawmatics.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
      >
        {status === 'running' ? 'Running...' : 'Testing Document Upload'}
      </button>

      {!selectedFirm && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">
          Please select a law firm before running
        </p>
      )}

      {selectedFirm && !selectedDocument && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">
          Please select a custom document before running
        </p>
      )}

      {selectedFirm && selectedDocument && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Will switch to: {selectedFirm} and open document: {selectedDocument}
        </p>
      )}
    </div>
  );
};
