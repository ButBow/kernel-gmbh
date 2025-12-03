export interface InquiryAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType?: string;
  budget?: string;
  subject: string;
  message: string;
  attachments?: InquiryAttachment[];
  createdAt: string;
  read: boolean;
  replied: boolean;
}

export const INQUIRY_TYPES = [
  { value: 'project', label: 'Projektanfrage' },
  { value: 'support', label: 'Support' },
  { value: 'collaboration', label: 'Zusammenarbeit' },
  { value: 'other', label: 'Sonstiges' },
] as const;

export const BUDGET_RANGES = [
  { value: 'under-1k', label: 'Unter 1.000 €' },
  { value: '1k-5k', label: '1.000 - 5.000 €' },
  { value: '5k-10k', label: '5.000 - 10.000 €' },
  { value: '10k-plus', label: 'Über 10.000 €' },
  { value: 'unknown', label: 'Noch unklar' },
] as const;
