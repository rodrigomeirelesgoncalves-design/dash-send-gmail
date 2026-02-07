export interface Satellite {
  id: string;
  alias: string;
  sheetId: string;
  webUrl: string;
  isActive: boolean;
  createdAt: Date;
}

export interface EmailMetrics {
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  failed: number;
  optOut: number;
}

export interface SatelliteMetrics extends EmailMetrics {
  satelliteId: string;
  satelliteAlias: string;
  lastUpdated: Date;
}

export interface EmailResponse {
  id: string;
  senderEmail: string;
  recipientEmail: string;
  responseContent: string;
  receivedAt: Date;
  satelliteAlias: string;
}

export interface UploadedLead {
  email: string;
  company?: string;
  name?: string;
  [key: string]: string | undefined;
}
