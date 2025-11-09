import type {
  ChromeStartRequest,
  ChromeStartResponse,
} from '../types/chrome.types';

export const startChrome = async (
  request: ChromeStartRequest = {}
): Promise<ChromeStartResponse> => {
  const response = await fetch('/api/chrome/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data;
};
