import { IEmailService } from './interface';
import { ResendEmailService } from './resend';

let instance: IEmailService | null = null;

const emailService = new Proxy({} as IEmailService, {
  get(target, prop) {
    if (!instance) {
      instance = new ResendEmailService();
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { emailService };
export type { IEmailService };
