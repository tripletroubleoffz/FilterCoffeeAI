import { IEmailService } from './interface';
import { MockEmailService } from './mock';
import { ResendEmailService } from './resend';

const emailProvider = process.env.EMAIL_PROVIDER || 'mock';

let emailService: IEmailService;

if (emailProvider === 'resend' && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'mock-resend-key') {
  try {
    emailService = new ResendEmailService();
  } catch (e) {
    console.error('Failed to initialize Resend service, falling back to mock email Logger:', e);
    emailService = new MockEmailService();
  }
} else {
  emailService = new MockEmailService();
}

export { emailService };
export type { IEmailService };
