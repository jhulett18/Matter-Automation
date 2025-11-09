export interface LawmaticsAuthCredentials {
  email: string;
  password: string;
}

export interface LawmaticsLoginRequest {
  cdpUrl: string;
  // Password is read from LAWMATICS_PASSWORD environment variable
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

export interface BulkMatterUploadRequest {
  cdpUrl: string;
  data?: string; // Optional field for bulk matter upload input data
  selectedFirm?: string; // Selected law firm from dropdown
}

export interface BulkMatterUploadResponse {
  success: boolean;
  sessionId: string;
  message: string;
}
