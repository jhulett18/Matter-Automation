'use client';

import { useState, useEffect } from 'react';

interface FirmSelectorProps {
  onFirmSelect: (firm: string) => void;
  selectedFirm: string;
}

export default function FirmSelector({ onFirmSelect, selectedFirm }: FirmSelectorProps) {
  const [firms, setFirms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsExtraction, setNeedsExtraction] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const response = await fetch('/api/get-firms');
        const data = await response.json();

        if (data.needsExtraction) {
          setNeedsExtraction(true);
          setMessage(data.message);
        } else {
          setFirms(data.firms || []);
        }
      } catch (error) {
        console.error('Error fetching firms:', error);
        setMessage('Error loading firms data');
      } finally {
        setLoading(false);
      }
    };

    fetchFirms();
  }, []);

  if (loading) {
    return (
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading law firms...</p>
      </div>
    );
  }

  if (needsExtraction) {
    return (
      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">{message}</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor="firm-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Please choose law firm
      </label>
      <select
        id="firm-select"
        value={selectedFirm}
        onChange={(e) => onFirmSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="">-- Select a law firm --</option>
        {firms.map((firm) => (
          <option key={firm} value={firm}>
            {firm}
          </option>
        ))}
      </select>
    </div>
  );
}
