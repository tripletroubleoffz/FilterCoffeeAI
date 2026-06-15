import { IEmailService } from './interface';
import { db } from '../../db';

export class MockEmailService implements IEmailService {
  async sendEmail(to: string, subject: string, html: string): Promise<any> {
    console.log(`\n================= [MOCK EMAIL] =================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content HTML length: ${html.length} characters`);
    console.log(`================================================\n`);

    try {
      await db.emailLog.create({
        data: { email: to, subject, status: 'SENT' },
      });
    } catch (e) {
      console.error('[Mock Email] Failed to log email to DB:', e);
    }

    return { id: `mock_email_${Math.random().toString(36).substring(2, 11)}` };
  }
}
