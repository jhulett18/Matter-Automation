import type {
  LawmaticsLoginRequest,
  LawmaticsLoginResponse,
} from '../types/lawmatics.types';

export const openLawmatics = async (
  request: LawmaticsLoginRequest
): Promise<LawmaticsLoginResponse> => {
  console.log('[Lawmatics API] Sending request to /api/test-browser');

  const response = await fetch('/api/test-browser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  console.log('[Lawmatics API] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('[Lawmatics API] Error response:', errorData);
    throw new Error(errorData.error || 'Failed to open Lawmatics');
  }

  const data = await response.json();
  console.log('[Lawmatics API] Response data:', data);

  return data;
};
