import { db } from '@/lib/db';
import { PLAN_LIMITS } from './plans';

export class SubscriptionService {
  static async getCurrentPlan(userId: string): Promise<string> {
    const sub = await db.subscription.findUnique({
      where: { userId },
    });

    if (!sub || sub.status !== 'ACTIVE') {
      return 'FREE';
    }

    const priceId = sub.stripePriceId || '';
    if (priceId.includes('enterprise')) return 'ENTERPRISE';
    if (priceId.includes('power')) return 'POWER';
    if (priceId.includes('pro')) return 'PRO';
    if (priceId.includes('starter')) return 'STARTER';

    const plan = (sub.plan || 'FREE').toUpperCase();
    if (PLAN_LIMITS[plan]) return plan;

    return 'FREE';
  }

  static async checkPlan(userId: string) {
    const plan = await this.getCurrentPlan(userId);
    return {
      plan,
      config: PLAN_LIMITS[plan] || PLAN_LIMITS.FREE,
    };
  }
}
