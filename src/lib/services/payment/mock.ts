import { IPaymentService } from './interface';
import { db } from '../../db';

export class MockPaymentService implements IPaymentService {
  async createCheckoutSession(userId: string, planCode: 'PRO' | 'POWER', redirectUrl: string): Promise<{ url: string }> {
    // Redirect url appends mock flags so frontend can prompt the confirmMockCheckout RPC
    const url = `${redirectUrl}?mock_checkout_success=true&plan_code=${planCode}`;
    return { url };
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string }> {
    return { url: returnUrl };
  }

  async confirmMockCheckout(userId: string, planCode: 'PRO' | 'POWER'): Promise<{ success: boolean; plan: string }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) throw new Error('User not found');

    const priceId = planCode === 'PRO' ? 'price_pro_monthly' : 'price_power_monthly';

    if (user.subscription) {
      await db.subscription.update({
        where: { id: user.subscription.id },
        data: {
          stripePriceId: priceId,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    } else {
      await db.subscription.create({
        data: {
          userId,
          stripeCustomerId: `cus_mock_${Math.random().toString(36).substring(2, 11)}`,
          stripePriceId: priceId,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return { success: true, plan: planCode };
  }
}
