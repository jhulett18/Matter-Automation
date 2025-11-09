import type {
  ChromeStatusRequest,
  ChromeStatusResponse,
} from '../types/chrome.types';

export const getChromeStatus = async (
  request: ChromeStatusRequest
): Promise<ChromeStatusResponse> => {
  const response = await fetch('/api/chrome/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data = await response.json();
  return data;
};
