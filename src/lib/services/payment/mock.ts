import { IPaymentService } from './interface';
import { db } from '../../db';

export class MockPaymentService implements IPaymentService {
  async createCheckoutSession(userId: string, planCode: 'PRO' | 'POWER', redirectUrl: string): Promise<{ url: string }> {
    // Return mock success URL back to the application checkout confirmation hook
    return {
      url: `${redirectUrl}?mock_checkout_success=true&plan=${planCode}`,
    };
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    return {
      url: `${returnUrl}?mock_portal=true`,
    };
  }

  async confirmMockCheckout(userId: string, planCode: 'PRO' | 'POWER'): Promise<{ success: boolean; plan: string }> {
    const priceId = planCode === 'PRO' ? 'price_pro_monthly' : 'price_power_monthly';

    // 1. Create or update user subscription record
    const sub = await db.subscription.upsert({
      where: { userId },
      update: {
        status: 'ACTIVE',
        stripePriceId: priceId,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      },
      create: {
        userId,
        stripeCustomerId: 'cus_mock_' + Math.random().toString(36).substring(7),
        stripePriceId: priceId,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 2. Add mock payment record
    await db.payment.create({
      data: {
        subscriptionId: sub.id,
        amount: planCode === 'PRO' ? 49900 : 99900,
        currency: 'inr',
        stripeChargeId: 'ch_mock_' + Math.random().toString(36).substring(7),
        status: 'succeeded',
      },
    });

    // 3. Log security/billing audit trail
    await db.auditLog.create({
      data: {
        userId,
        action: 'BILLING_UPGRADE_MOCK',
        details: `Simulated upgrade to plan ${planCode} succeeded.`,
      },
    });

    return { success: true, plan: planCode };
  }
}
