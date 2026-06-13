import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { PLANS } from '@/lib/constants';
import { paymentService } from '@/lib/services/payment';

export const billingRouter = router({
  // Fetch current user subscription state
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        subscription: true,
        _count: { select: { topics: true } },
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const sub = user.subscription;
    let currentPlan = 'FREE';
    let maxTopics = PLANS.FREE.maxTopics;

    if (sub?.status === 'ACTIVE') {
      if (sub.stripePriceId === 'price_pro_monthly' || sub.stripePriceId?.includes('pro')) {
        currentPlan = 'PRO';
        maxTopics = PLANS.PRO.maxTopics;
      } else if (sub.stripePriceId === 'price_power_monthly' || sub.stripePriceId?.includes('power')) {
        currentPlan = 'POWER';
        maxTopics = PLANS.POWER.maxTopics;
      }
    }

    return {
      plan: currentPlan,
      status: sub?.status || 'INACTIVE',
      currentPeriodEnd: sub?.currentPeriodEnd,
      maxTopics,
      activeTopicCount: user._count.topics,
      email: user.email,
      name: user.name || 'User',
      role: user.role,
    };
  }),

  // Create Checkout redirect URL
  createCheckoutSession: protectedProcedure
    .input(z.object({ planCode: z.enum(['PRO', 'POWER']) }))
    .mutation(async ({ ctx, input }) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const redirectUrl = `${baseUrl}/dashboard/billing`;
      try {
        return await paymentService.createCheckoutSession(ctx.user.id, input.planCode, redirectUrl);
      } catch (err: any) {
        console.error('Session creation error:', err);
        throw new Error(err.message || 'Payment initialization failed.');
      }
    }),

  // Manage billing redirect
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard/billing`;
    try {
      return await paymentService.createPortalSession(ctx.user.id, returnUrl);
    } catch (err: any) {
      console.error('Portal session creation error:', err);
      throw new Error(err.message || 'Payment portal failed.');
    }
  }),

  // Simulate payment callback for mock checkout
  confirmMockCheckout: protectedProcedure
    .input(z.object({ planCode: z.enum(['PRO', 'POWER']) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await paymentService.confirmMockCheckout(ctx.user.id, input.planCode);
      } catch (err: any) {
        console.error('Mock checkout confirmation error:', err);
        throw new Error(err.message || 'Mock checkout confirmation failed.');
      }
    }),
});
