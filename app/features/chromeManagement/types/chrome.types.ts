export interface ChromeStartRequest {
  port?: number;
}

export interface ChromeStartResponse {
  success: boolean;
  message: string;
  cdpUrl?: string;
  dataDir?: string;
  profileDirectory?: string;
  alreadyRunning?: boolean;
  hint?: string;
}

export interface ChromeStopRequest {
  port?: number;
}

export interface ChromeStopResponse {
  success: boolean;
  message: string;
  killedPids?: string[];
}

export interface ChromeStatusRequest {
  cdpUrl: string;
}

export interface ChromeProcess {
  command: string;
  pid: string;
  user: string;
}

export interface ChromePage {
  title: string;
  url: string;
  type: string;
}

export interface ChromeStatusResponse {
  success: boolean;
  running: boolean;
  message: string;
  cdpUrl?: string;
  port?: string;
  processes?: ChromeProcess[];
  version?: string;
  browserInfo?: any;
  openPages?: number;
  pages?: ChromePage[];
}
