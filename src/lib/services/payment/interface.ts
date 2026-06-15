export interface IPaymentService {
  createCheckoutSession(userId: string, planCode: 'PRO' | 'POWER', redirectUrl: string): Promise<{ url: string }>;
  createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }>;
  confirmMockCheckout(userId: string, planCode: 'PRO' | 'POWER'): Promise<{ success: boolean; plan: string }>;
}
