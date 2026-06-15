import { IPaymentService } from './interface';

export class NonePaymentService implements IPaymentService {
  async createCheckoutSession(userId: string, planCode: 'PRO' | 'POWER', redirectUrl: string): Promise<{ url: string }> {
    // Redirect to the billing page itself, or we can handle this gracefully on the frontend.
    // In our design, we want to show a "Payment page will be available soon" page/modal or redirect.
    // Let's redirect to `/dashboard/billing?unavailable=true`
    return { url: `${redirectUrl}?unavailable=true` };
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    return { url: `${returnUrl}?unavailable=true` };
  }

  async confirmMockCheckout(userId: string, planCode: 'PRO' | 'POWER'): Promise<{ success: boolean; plan: string }> {
    throw new Error('confirmMockCheckout is not supported in NonePaymentService');
  }
}
