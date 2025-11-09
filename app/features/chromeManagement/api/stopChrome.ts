import type {
  ChromeStopRequest,
  ChromeStopResponse,
} from '../types/chrome.types';

export const stopChrome = async (
  request: ChromeStopRequest = {}
): Promise<ChromeStopResponse> => {
  const response = await fetch('/api/chrome/stop', {
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
