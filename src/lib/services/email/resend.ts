import { IEmailService } from './interface';
import { db } from '../../db';

export class ResendEmailService implements IEmailService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'mock-resend-key') {
      throw new Error('RESEND_API_KEY must be configured to use ResendEmailService');
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<any> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: 'FilterCoffee.ai <briefings@filtercoffee.ai>',
          to,
          subject,
          html,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        await db.emailLog.create({
          data: { email: to, subject, status: 'SENT' },
        });
        return data;
      } else {
        throw new Error(data.message || 'Resend error');
      }
    } catch (err: any) {
      console.error('Resend email failed:', err);
      await db.emailLog.create({
        data: { email: to, subject, status: 'FAILED', error: err.message },
      });
      throw err;
    }
  }
}
