'use client';

import React, { useState } from 'react';
import type { ChromeStatusResponse } from '../types/chrome.types';

interface ChromeStatusDisplayProps {
  status: ChromeStatusResponse | null;
}

export const ChromeStatusDisplay = ({ status }: ChromeStatusDisplayProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!status || !status.running) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Browser Details
        </h3>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label={isMinimized ? 'Expand' : 'Minimize'}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMinimized ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            )}
          </svg>
        </button>
      </div>

      {!isMinimized && (
        <div className="space-y-3 text-sm">
        {status.version && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Version:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {status.version}
            </span>
          </div>
        )}

        {typeof status.openPages === 'number' && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Open Pages:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {status.openPages}
            </span>
          </div>
        )}

        {status.processes && status.processes.length > 0 && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Processes:</span>
            <div className="mt-2 space-y-2">
              {status.processes.map((proc, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs"
                >
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">PID:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {proc.pid}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Port:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {proc.port}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status.pages && status.pages.length > 0 && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Open Tabs:</span>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {status.pages.map((page, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-xs"
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {page.title || 'Untitled'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 truncate">
                    {page.url}
                  </div>
                  <div className="mt-1 flex gap-2">
                    <span className="text-gray-500 dark:text-gray-500">
                      Type: {page.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};
