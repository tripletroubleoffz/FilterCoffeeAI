import { IBillingProvider } from './BillingProvider';
import { MockBillingProvider } from './MockBillingProvider';
import { StripeProvider } from './StripeProvider';
import { RazorpayProvider } from './RazorpayProvider';
import { CheckoutSessionInput, CheckoutSessionResult, PortalSessionResult, BillingAnalyticsResult } from './BillingTypes';
import { db } from '@/lib/db';
import { PurchaseIntentStatus, Prisma } from '@prisma/client';

export class BillingService {
  private static provider: IBillingProvider | null = null;

  static getProvider(): IBillingProvider {
    if (!this.provider) {
      const type = process.env.BILLING_PROVIDER || 'mock';
      if (type === 'stripe') {
        this.provider = new StripeProvider();
      } else if (type === 'razorpay') {
        this.provider = new RazorpayProvider();
      } else {
        this.provider = new MockBillingProvider();
      }
    }
    return this.provider;
  }

  static async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    return this.getProvider().createCheckoutSession(input);
  }

  static async createPortalSession(userId: string, returnUrl: string): Promise<PortalSessionResult> {
    return this.getProvider().createPortalSession(userId, returnUrl);
  }

  static async getAnalytics(): Promise<BillingAnalyticsResult> {
    const totalAttempts = await db.purchaseIntent.count();
    const pendingCount = await db.purchaseIntent.count({ where: { status: 'PENDING' } });
    const reviewedCount = await db.purchaseIntent.count({ where: { status: 'REVIEWED' } });
    const contactedCount = await db.purchaseIntent.count({ where: { status: 'CONTACTED' } });
    const approvedCount = await db.purchaseIntent.count({ where: { status: 'APPROVED' } });
    const rejectedCount = await db.purchaseIntent.count({ where: { status: 'REJECTED' } });

    // Group by requestedPlan
    const planCounts = await db.purchaseIntent.groupBy({
      by: ['requestedPlan'],
      _count: {
        id: true,
      },
    });

    const popularPlans = planCounts.map((g) => ({
      plan: g.requestedPlan || 'UNKNOWN',
      count: g._count.id,
    })).sort((a, b) => b.count - a.count);

    // Intent growth (by day)
    const rawGrowth = await db.purchaseIntent.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
    });

    // We can group raw growth by date in TS
    const growthMap: Record<string, number> = {};
    for (const item of rawGrowth) {
      const dateStr = item.createdAt.toISOString().split('T')[0];
      growthMap[dateStr] = (growthMap[dateStr] || 0) + item._count.id;
    }

    const intentGrowth = Object.entries(growthMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalAttempts,
      pendingCount,
      reviewedCount,
      contactedCount,
      approvedCount,
      rejectedCount,
      popularPlans,
      intentGrowth,
    };
  }

  static async listIntents(params: {
    status?: PurchaseIntentStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseIntentWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { notes: { contains: params.search, mode: 'insensitive' } },
        { requestedPlan: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      db.purchaseIntent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      db.purchaseIntent.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async updateIntent(id: string, data: { status?: PurchaseIntentStatus; notes?: string }) {
    return db.purchaseIntent.update({
      where: { id },
      data,
    });
  }
}
