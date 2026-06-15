import { IEmailService } from './interface';
import { ResendEmailService } from './resend';
import { MockEmailService } from './mock';

let instance: IEmailService | null = null;

const emailService = new Proxy({} as IEmailService, {
  get(target, prop) {
    if (!instance) {
      if (process.env.EMAIL_PROVIDER === 'mock' || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'mock-resend-key') {
        instance = new MockEmailService();
      } else {
        instance = new ResendEmailService();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { emailService };
export type { IEmailService };

