'use client';

import { useRef, useEffect, useState } from 'react';

interface Log {
  timestamp: string;
  level: string;
  message: string;
}

interface LogViewerProps {
  logs: Log[];
}

export default function LogViewer({ logs }: LogViewerProps) {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);

  // Auto-scroll to bottom when new logs arrive and auto-scroll is enabled
  useEffect(() => {
    if (autoScrollEnabled && scrollContainerRef.current && !isUserScrollingRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs, autoScrollEnabled]);

  // Detect manual scrolling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

    // If user scrolls up, disable auto-scroll
    if (!isAtBottom && autoScrollEnabled) {
      isUserScrollingRef.current = true;
      setAutoScrollEnabled(false);
    }
  };

  // Toggle auto-scroll and scroll to bottom when enabled
  const toggleAutoScroll = () => {
    const newValue = !autoScrollEnabled;
    setAutoScrollEnabled(newValue);
    isUserScrollingRef.current = false;

    if (newValue && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={toggleAutoScroll}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            autoScrollEnabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
          }`}
          title={autoScrollEnabled ? 'Auto-scroll enabled (click to disable)' : 'Auto-scroll disabled (click to enable)'}
        >
          {autoScrollEnabled ? '🔒 Auto' : '🔓 Manual'}
        </button>
      </div>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-[1000px] overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 pt-12"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <p>No logs yet. Start a test or automation to see logs here.</p>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getLevelBadge(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={`pl-2 ${getLevelColor(log.level)}`}>
                {log.message}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
