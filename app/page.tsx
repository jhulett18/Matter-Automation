'use client';

import { useState, useEffect } from 'react';
import LogViewer from '@/components/LogViewer';
import StatusIndicator from '@/components/StatusIndicator';
import { ChromeControls } from '@/app/features/chromeManagement/components/ChromeControls';
import { ChromeStatusDisplay } from '@/app/features/chromeManagement/components/ChromeStatusDisplay';
import { OpenLawmaticsButton } from '@/app/features/lawmatics/components/OpenLawmaticsButton';
import { TestingDocumentUpload } from '@/app/features/lawmatics/components/TestingDocumentUpload';
import FirmSelector from '@/app/features/lawmatics/components/FirmSelector';

type Status = 'idle' | 'testing' | 'processing' | 'running' | 'complete' | 'error';

export default function Home() {
  const [cdpUrl, setCdpUrl] = useState('http://localhost:9222');
  const [status, setStatus] = useState<Status>('idle');
  const [logs, setLogs] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [chromeStatus, setChromeStatus] = useState<any>(null);
  const [selectedFirm, setSelectedFirm] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setStatus('processing');
    setLogs([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload and parse document');
      }

      const data = await response.json();
      setParsedData(data.parsedData);
      setStatus('complete');
      setLogs(prev => [...prev, {
        level: 'success',
        message: 'Document parsed successfully',
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setLogs(prev => [...prev, {
        level: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const runAutomation = async () => {
    if (!parsedData) {
      alert('Please upload and parse a document first');
      return;
    }

    setStatus('running');
    setLogs([]);

    try {
      const response = await fetch('/api/run-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cdpUrl,
          formData: parsedData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run automation');
      }

      // Get the sessionId from the response
      const data = await response.json();
      const sessionId = data.sessionId;

      // Set up EventSource for real-time logs using the correct sessionId
      const eventSource = new EventSource(`/api/stream-logs?sessionId=${sessionId}`);

      eventSource.onmessage = (event) => {
        const log = JSON.parse(event.data);

        if (log.type === 'complete') {
          setStatus('complete');
          eventSource.close();
        } else if (log.type === 'error') {
          setStatus('error');
          eventSource.close();
        } else {
          setLogs(prev => [...prev, log]);
        }
      };

      eventSource.onerror = () => {
        setStatus('error');
        eventSource.close();
      };

    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setLogs(prev => [...prev, {
        level: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Matter Automation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Automate form filling with remote browser control
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Status</h2>
              <StatusIndicator status={status} />
            </div>

            {/* CDP URL Input */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chrome CDP URL
              </label>
              <input
                type="text"
                value={cdpUrl}
                onChange={(e) => setCdpUrl(e.target.value)}
                placeholder="http://localhost:9222"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={status === 'testing' || status === 'running'}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Or use the buttons below to manage Chrome
              </p>
            </div>

            {/* Chrome Management */}
            <ChromeControls
              cdpUrl={cdpUrl}
              onCdpUrlChange={setCdpUrl}
              onStatusChange={setChromeStatus}
            />
            <ChromeStatusDisplay status={chromeStatus} />

            {/* Open Lawmatics Button */}
            <OpenLawmaticsButton
              cdpUrl={cdpUrl}
              onLogsChange={setLogs}
              onStatusChange={setStatus}
            />

            {/* Firm Selection and Testing Document Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <FirmSelector
                selectedFirm={selectedFirm}
                onFirmSelect={setSelectedFirm}
              />
            </div>

            {/* Testing Document Upload Form */}
            <TestingDocumentUpload
              cdpUrl={cdpUrl}
              selectedFirm={selectedFirm}
              onLogsChange={setLogs}
              onStatusChange={setStatus}
            />

            {/* Document Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Document</h2>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={status === 'processing' || status === 'running'}
                className="w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900 dark:file:text-blue-300
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {uploadedFile && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Uploaded: {uploadedFile.name}
                </p>
              )}
              {parsedData && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Data parsed successfully</p>
                </div>
              )}
            </div>

            {/* Run Automation Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Run Automation</h2>
              <button
                onClick={runAutomation}
                disabled={!parsedData || status === 'testing' || status === 'running'}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {status === 'running' ? 'Running...' : 'Run Form Automation'}
              </button>
            </div>
          </div>

          {/* Right Column - Logs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Real-time Logs</h2>
            <LogViewer logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
}
