import { BulkMattersRequest, BulkMattersResponse } from '../types/lawmatics.types';

export async function runBulkMatters(request: BulkMattersRequest): Promise<BulkMattersResponse> {
  const response = await fetch('/api/bulk-matters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to start bulk matters automation');
  }

  return response.json();
}
