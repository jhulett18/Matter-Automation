'use client';

import { useState, useEffect } from 'react';

interface DocumentSelectorProps {
  onDocumentSelect: (document: string) => void;
  selectedDocument: string;
}

export default function DocumentSelector({ onDocumentSelect, selectedDocument }: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsExtraction, setNeedsExtraction] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/get-documents');
        const data = await response.json();

        if (data.needsExtraction) {
          setNeedsExtraction(true);
          setMessage(data.message);
        } else {
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setMessage('Error loading custom documents data');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading custom documents...</p>
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
      <label htmlFor="document-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Custom Document
      </label>
      <select
        id="document-select"
        value={selectedDocument}
        onChange={(e) => onDocumentSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      >
        <option value="">-- Select a document --</option>
        {documents.map((document) => (
          <option key={document} value={document}>
            {document}
          </option>
        ))}
      </select>
    </div>
  );
}
