export interface LawmaticsAuthCredentials {
  email: string;
  password: string;
}

export interface LawmaticsLoginRequest {
  cdpUrl: string;
  password: string;
}

export interface LawmaticsLoginResponse {
  success: boolean;
  sessionId: string;
  message: string;
}

export interface LawmaticsLog {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  type?: 'complete' | 'error';
}

export interface BulkMattersRequest {
  cdpUrl: string;
  data?: string; // Optional field for bulk matters input data
}

export interface BulkMattersResponse {
  success: boolean;
  sessionId: string;
  message: string;
}
