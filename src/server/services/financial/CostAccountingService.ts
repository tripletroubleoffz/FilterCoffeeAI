import { db } from '@/lib/db';

export class CostAccountingService {
  static async getFinancialMetrics() {
    const [
      totalUsers,
      activeSubs,
      paymentsSum,
      aiCostStats,
      purchasedCreditsSum,
      usedCreditsSum
    ] = await Promise.all([
      db.user.count(),
      db.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { plan: true, stripePriceId: true },
      }),
      db.payment.aggregate({
        where: { status: 'succeeded' },
        _sum: { amount: true },
      }),
      db.aiGeneration.aggregate({
        _sum: { providerCost: true },
      }),
      db.creditLedger.aggregate({
        _sum: { purchasedCredits: true },
      }),
      db.creditLedger.aggregate({
        _sum: { usedCredits: true },
      }),
    ]);

    let mrrCents = 0;
    for (const sub of activeSubs) {
      const planUpper = sub.plan.toUpperCase();
      if (planUpper === 'STARTER') {
        mrrCents += 19900;
      } else if (planUpper === 'PRO') {
        mrrCents += 49900;
      } else if (planUpper === 'POWER') {
        mrrCents += 99900;
      } else if (planUpper === 'ENTERPRISE') {
        mrrCents += 500000;
      }
    }

    const actualRevenueCents = paymentsSum._sum.amount || 0;
    const actualRevenueINR = actualRevenueCents / 100;
    const actualAiCostUSD = aiCostStats._sum.providerCost || 0.0;
    const actualAiCostINR = actualAiCostUSD * 83;

    const mrrINR = mrrCents / 100;
    const arrINR = mrrINR * 12;

    const grossMarginINR = actualRevenueINR - actualAiCostINR;
    const grossMarginPercentage = actualRevenueINR > 0 ? (grossMarginINR / actualRevenueINR) * 100 : 0;

    const transactionalOverhead = actualRevenueINR * 0.05;
    const netMarginINR = grossMarginINR - transactionalOverhead;
    const netMarginPercentage = actualRevenueINR > 0 ? (netMarginINR / actualRevenueINR) * 100 : 0;

    const revenuePerUserINR = totalUsers > 0 ? actualRevenueINR / totalUsers : 0;

    return {
      totalUsers,
      activeSubscribersCount: activeSubs.length,
      actualRevenueINR: Number(actualRevenueINR.toFixed(2)),
      actualAiCostUSD: Number(actualAiCostUSD.toFixed(4)),
      actualAiCostINR: Number(actualAiCostINR.toFixed(2)),
      mrrINR: Number(mrrINR.toFixed(2)),
      arrINR: Number(arrINR.toFixed(2)),
      grossMarginINR: Number(grossMarginINR.toFixed(2)),
      grossMarginPercentage: Number(grossMarginPercentage.toFixed(2)),
      netMarginINR: Number(netMarginINR.toFixed(2)),
      netMarginPercentage: Number(netMarginPercentage.toFixed(2)),
      revenuePerUserINR: Number(revenuePerUserINR.toFixed(2)),
      totalCreditsPurchased: purchasedCreditsSum._sum.purchasedCredits || 0,
      totalCreditsConsumed: usedCreditsSum._sum.usedCredits || 0,
    };
  }
}
