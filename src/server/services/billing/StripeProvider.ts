import { IBillingProvider } from './BillingProvider';
import { CheckoutSessionInput, CheckoutSessionResult, PortalSessionResult } from './BillingTypes';

export class StripeProvider implements IBillingProvider {
  name = 'stripe';

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    console.log('[StripeProvider] createCheckoutSession called (pluggable placeholder)', input);
    return {
      success: true,
      message: 'Stripe integration is prepared for production launch.',
    };
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<PortalSessionResult> {
    console.log('[StripeProvider] createPortalSession called for user', userId);
    return { url: returnUrl };
  }
}
