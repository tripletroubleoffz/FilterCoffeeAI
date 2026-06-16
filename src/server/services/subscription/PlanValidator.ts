import { db } from '@/lib/db';
import { SubscriptionService } from './SubscriptionService';
import { PLAN_LIMITS } from './plans';

export class PlanValidator {
  static async getDailyUsageCount(userId: string, action: string): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const logs = await db.usageLog.aggregate({
      where: {
        userId,
        action: { equals: action, mode: 'insensitive' },
        createdAt: {
          gte: todayStart,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    return logs._sum.quantity || 0;
  }

  static async checkUsageLimits(userId: string, action: string): Promise<{ allowed: boolean; current: number; limit: number }> {
    const plan = await SubscriptionService.getCurrentPlan(userId);
    const config = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

    let limit = 0;
    const mappedAction = action.toUpperCase();

    if (mappedAction === 'SEARCH') {
      limit = config.maxDailySearches;
    } else if (mappedAction === 'ROAST') {
      limit = config.maxDailyRoasts;
    } else if (mappedAction === 'BREW') {
      limit = config.maxDailyBrews;
    } else if (mappedAction === 'SUMMARY') {
      limit = config.maxDailySummaries;
    } else if (mappedAction === 'REPORTS') {
      limit = config.maxDailyReports;
    } else if (mappedAction === 'EXPORTS') {
      limit = config.maxDailyExports;
    } else if (mappedAction === 'AI_GENERATION' || mappedAction === 'AI') {
      limit = config.maxDailyAiGenerations;
    } else if (mappedAction === 'API') {
      limit = config.maxDailyApiUsage;
    } else {
      return { allowed: true, current: 0, limit: 999999 };
    }

    const current = await this.getDailyUsageCount(userId, action);
    return {
      allowed: current < limit,
      current,
      limit,
    };
  }

  static async enforceUsageLimits(userId: string, action: string): Promise<void> {
    const check = await this.checkUsageLimits(userId, action);
    if (!check.allowed) {
      throw new Error(`Daily limit exceeded for ${action}. Limit: ${check.limit}, Current: ${check.current}. Please upgrade your subscription plan.`);
    }
  }
}
