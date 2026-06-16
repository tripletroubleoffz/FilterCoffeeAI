import { IBillingProvider } from './BillingProvider';
import { CheckoutSessionInput, CheckoutSessionResult, PortalSessionResult } from './BillingTypes';

export class RazorpayProvider implements IBillingProvider {
  name = 'razorpay';

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    console.log('[RazorpayProvider] createCheckoutSession called (pluggable placeholder)', input);
    return {
      success: true,
      message: 'Razorpay integration is prepared for production launch.',
    };
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<PortalSessionResult> {
    console.log('[RazorpayProvider] createPortalSession called for user', userId);
    return { url: returnUrl };
  }
}
