import Stripe from 'stripe';
import { IPaymentService } from './interface';
import { db } from '../../db';

export class StripePaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_API_KEY;
    if (!apiKey || apiKey === 'mock-stripe-key') {
      throw new Error('STRIPE_API_KEY must be configured to use StripePaymentService');
    }
    this.stripe = new Stripe(apiKey, { apiVersion: '2025-01-27' as any });
  }

  async createCheckoutSession(userId: string, planCode: 'PRO' | 'POWER', redirectUrl: string): Promise<{ url: string }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) throw new Error('User not found');

    const priceId = planCode === 'PRO' ? 'price_pro_monthly' : 'price_power_monthly';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      customer: user.subscription?.stripeCustomerId || undefined,
      success_url: `${redirectUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: redirectUrl,
      metadata: {
        userId,
        planCode,
      },
    });

    return { url: session.url! };
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user || !user.subscription || !user.subscription.stripeCustomerId) {
      throw new Error('Active billing account not found');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async confirmMockCheckout(userId: string, planCode: 'PRO' | 'POWER'): Promise<{ success: boolean; plan: string }> {
    throw new Error('confirmMockCheckout is only supported in MockPaymentService');
  }
}
