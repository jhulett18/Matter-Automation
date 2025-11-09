// Shared in-memory log store
// In production, this should be replaced with Redis or a similar persistent store
export const logStore = new Map<string, any[]>();

export function addLog(sessionId: string, log: any) {
  const logs = logStore.get(sessionId) || [];
  logs.push(log);
  logStore.set(sessionId, logs);
}

export function getLogs(sessionId: string): any[] {
  return logStore.get(sessionId) || [];
}

export function clearLogs(sessionId: string) {
  logStore.delete(sessionId);
}
