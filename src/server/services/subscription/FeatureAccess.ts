import { SubscriptionService } from './SubscriptionService';
import { PLAN_LIMITS } from './plans';

export class FeatureAccess {
  static async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const plan = await SubscriptionService.getCurrentPlan(userId);
    const config = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
    return config.allowedFeatures.includes(feature);
  }
}
