// Shared in-memory log store
// In production, this should be replaced with Redis or a similar persistent store
// Using globalThis to ensure the Map is shared across all API routes in dev mode
const globalForLogStore = globalThis as unknown as {
  logStore: Map<string, any[]> | undefined;
};

export const logStore = globalForLogStore.logStore ?? new Map<string, any[]>();

if (process.env.NODE_ENV !== 'production') {
  globalForLogStore.logStore = logStore;
}

export function addLog(sessionId: string, log: any) {
  const logs = logStore.get(sessionId) || [];
  logs.push(log);
  logStore.set(sessionId, logs);
  console.log(`[logStore] Added log to session ${sessionId}, total: ${logs.length}`);
}

export function getLogs(sessionId: string): any[] {
  return logStore.get(sessionId) || [];
}

export function clearLogs(sessionId: string) {
  logStore.delete(sessionId);
}
