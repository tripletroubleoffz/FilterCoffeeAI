import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class UsageMeteringService {
  static async trackUsage(options: {
    userId: string;
    action: string;
    creditsUsed?: number;
    tokensUsed?: number;
    executionTime?: number;
    status: string;
    resourceType?: string;
    quantity?: number;
    metadata?: Prisma.InputJsonValue;
  }) {
    return db.usageLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        creditsUsed: options.creditsUsed ?? 0,
        tokensUsed: options.tokensUsed ?? 0,
        executionTime: options.executionTime ?? 0,
        status: options.status,
        resourceType: options.resourceType || null,
        quantity: options.quantity ?? 1,
        metadata: options.metadata !== undefined ? (typeof options.metadata === 'string' ? JSON.parse(options.metadata) : options.metadata) : null,
      },
    });
  }

  static async getAggregatedUsage(
    userId: string,
    action: string,
    since: Date
  ): Promise<number> {
    const agg = await db.usageLog.aggregate({
      where: {
        userId,
        action: { equals: action, mode: 'insensitive' },
        createdAt: {
          gte: since,
        },
      },
      _sum: {
        quantity: true,
      },
    });
    return agg._sum.quantity || 0;
  }

  static async getDailyUsage(userId: string, action: string): Promise<number> {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    return this.getAggregatedUsage(userId, action, since);
  }

  static async getWeeklyUsage(userId: string, action: string): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    return this.getAggregatedUsage(userId, action, since);
  }

  static async getMonthlyUsage(userId: string, action: string): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    return this.getAggregatedUsage(userId, action, since);
  }

  static async getLifetimeUsage(userId: string, action: string): Promise<number> {
    const since = new Date(0);
    return this.getAggregatedUsage(userId, action, since);
  }

  static async getUserDashboardStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [dailyCredits, monthlyCredits, totalCredits] = await Promise.all([
      db.usageLog.aggregate({
        where: { userId, createdAt: { gte: today } },
        _sum: { creditsUsed: true },
      }),
      db.usageLog.aggregate({
        where: { userId, createdAt: { gte: monthStart } },
        _sum: { creditsUsed: true },
      }),
      db.usageLog.aggregate({
        where: { userId },
        _sum: { creditsUsed: true },
      }),
    ]);

    return {
      dailyCreditsUsed: dailyCredits._sum.creditsUsed || 0,
      monthlyCreditsUsed: monthlyCredits._sum.creditsUsed || 0,
      totalCreditsUsed: totalCredits._sum.creditsUsed || 0,
    };
  }
}
