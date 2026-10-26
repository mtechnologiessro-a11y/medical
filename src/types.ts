export interface DoctorRecord {
  id: string;
  name: string;
  clinicAddress: string;
  phoneNumber: string;
  emailAddress: string;
  specialty?: string;
  profileUrl: string;
  sourcePage: number;
  scrapedAt: string;
  status: 'success' | 'partial' | 'failed';
  notes?: string;
}

export interface ScraperConfig {
  baseUrl: string;
  paginationParam: string;
  maxPages: number;
  minDelay: number; // in seconds
  maxDelay: number; // in seconds
  timeout: number; // in seconds
  userAgent: string;
  outputFilename: string;
  includeBom: boolean;
  selectors: {
    doctorLinks: string;
    doctorName: string;
    clinicAddress: string;
    phoneNumber: string;
    emailAddress: string;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  stage: 'listing' | 'detail' | 'csv' | 'system';
  message: string;
  httpStatus?: number;
  url?: string;
}

export interface MockPage {
  pageNumber: number;
  doctors: Array<{
    id: string;
    slug: string;
    name: string;
    specialty: string;
    address: string;
    phone: string;
    email: string;
    htmlSnippet: string;
  }>;
}
