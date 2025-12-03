export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  replied: boolean;
}

export interface InquirySettings {
  forwardingEmail: string;
}
