import { BulkMatterUploadRequest, BulkMatterUploadResponse } from '../types/lawmatics.types';

export async function runBulkMatterUpload(request: BulkMatterUploadRequest): Promise<BulkMatterUploadResponse> {
  const response = await fetch('/api/bulk-matter-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to start bulk matter upload automation');
  }

  return response.json();
}
