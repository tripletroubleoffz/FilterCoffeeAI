import { IEmailService } from './interface';
import { db } from '../../db';

export class MockEmailService implements IEmailService {
  async sendEmail(to: string, subject: string, html: string): Promise<any> {
    console.log(`==================================================`);
    console.log(`[Mock Email Sent]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content HTML size: ${html.length} characters`);
    console.log(`==================================================`);

    // Log to Database so the admin panel can show mock email history
    return db.emailLog.create({
      data: {
        email: to,
        subject,
        status: 'SENT',
      },
    });
  }
}
