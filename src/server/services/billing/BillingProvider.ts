import { CheckoutSessionInput, CheckoutSessionResult, PortalSessionResult } from './BillingTypes';

export interface IBillingProvider {
  name: string;
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
  createPortalSession(userId: string, returnUrl: string): Promise<PortalSessionResult>;
}
