export interface SendSesMailBody {
  recipient: string;
  subject: string;
  body: string;
  attachments?: string[];
  cc?: string[];
  bcc?: string[];
  senderName?: string;
}
export interface SesMailOptions {
  from: {
    name: string;
    address: string;
  };
  to: string;
  priority: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  attachments?: string[];
}
