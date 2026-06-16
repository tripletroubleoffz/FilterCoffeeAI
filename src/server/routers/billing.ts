import { router, protectedProcedure, publicProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';
import { PLANS } from '@/lib/constants';
import { BillingService } from '../services/billing/BillingService';
import { PurchaseIntentStatus } from '@prisma/client';
import { SubscriptionService } from '../services/subscription/SubscriptionService';

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

    const plan = await SubscriptionService.getCurrentPlan(ctx.user.id);
    const sub = user.subscription;

    const maxTopics = PLANS[plan as keyof typeof PLANS]?.maxTopics || PLANS.FREE.maxTopics;

    return {
      plan,
      status: sub?.status || 'INACTIVE',
      currentPeriodEnd: sub?.currentPeriodEnd,
      maxTopics,
      activeTopicCount: user._count.topics,
      email: user.email,
      name: user.name || 'User',
      role: user.role,
    };
  }),

  // Create Checkout session intent (for logged-in user upgrades)
  createCheckoutSession: protectedProcedure
    .input(z.object({
      planCode: z.enum(['STARTER', 'PRO', 'POWER', 'ENTERPRISE']),
      billingFrequency: z.enum(['MONTHLY', 'YEARLY']).optional(),
      referrer: z.string().optional(),
      sourcePage: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
      });
      if (!user) throw new Error('User not found');

      const currentPlan = await SubscriptionService.getCurrentPlan(ctx.user.id);

      let userAgent = '';
      if (ctx.req) {
        userAgent = ctx.req.headers.get('user-agent') || '';
      }

      try {
        return await BillingService.createCheckoutSession({
          userId: ctx.user.id,
          email: user.email,
          currentPlan,
          requestedPlan: input.planCode,
          intentType: 'UPGRADE',
          billingFrequency: input.billingFrequency || 'MONTHLY',
          sourcePage: input.sourcePage || 'billing',
          userAgent,
          referrer: input.referrer,
        });
      } catch (err) {
        console.error('Session creation error:', err);
        const errMsg = err instanceof Error ? err.message : 'Payment initialization failed.';
        throw new Error(errMsg);
      }
    }),

  // Public/Anonymous endpoint to submit waitlist, early access or custom request intent
  createPurchaseIntent: publicProcedure
    .input(z.object({
      email: z.string().email(),
      currentPlan: z.string().default('FREE'),
      requestedPlan: z.string().optional(),
      requestedCredits: z.number().optional(),
      intentType: z.enum(['WAITLIST', 'EARLY_ACCESS', 'CUSTOM_REQUEST', 'UPGRADE']),
      billingFrequency: z.enum(['MONTHLY', 'YEARLY']).optional(),
      sourcePage: z.string().optional(),
      notes: z.string().optional(),
      referrer: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let userAgent = '';
      if (ctx.req) {
        userAgent = ctx.req.headers.get('user-agent') || '';
      }

      const userId = ctx.user?.id;

      try {
        return await BillingService.createCheckoutSession({
          userId,
          email: input.email,
          currentPlan: input.currentPlan,
          requestedPlan: input.requestedPlan,
          requestedCredits: input.requestedCredits,
          intentType: input.intentType,
          billingFrequency: input.billingFrequency || 'MONTHLY',
          sourcePage: input.sourcePage || 'landing',
          userAgent,
          notes: input.notes,
          referrer: input.referrer,
        });
      } catch (err) {
        console.error('Purchase intent creation error:', err);
        const errMsg = err instanceof Error ? err.message : 'Purchase intent submission failed.';
        throw new Error(errMsg);
      }
    }),

  // Manage billing redirect
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard/billing`;
    try {
      return await BillingService.createPortalSession(ctx.user.id, returnUrl);
    } catch (err) {
      console.error('Portal session creation error:', err);
      const errMsg = err instanceof Error ? err.message : 'Payment portal failed.';
      throw new Error(errMsg);
    }
  }),

  // Simulate payment callback for mock checkout (retained and updated for backend testing)
  confirmMockCheckout: protectedProcedure
    .input(z.object({ planCode: z.enum(['STARTER', 'PRO', 'POWER', 'ENTERPRISE']) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.user.id },
          include: { subscription: true },
        });
        if (!user) throw new Error('User not found');

        const priceId = `price_${input.planCode.toLowerCase()}_monthly`;

        if (user.subscription) {
          await ctx.db.subscription.update({
            where: { id: user.subscription.id },
            data: {
              stripePriceId: priceId,
              status: 'ACTIVE',
              plan: input.planCode,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } else {
          await ctx.db.subscription.create({
            data: {
              userId: ctx.user.id,
              stripeCustomerId: `cus_mock_${Math.random().toString(36).substring(2, 11)}`,
              stripePriceId: priceId,
              status: 'ACTIVE',
              plan: input.planCode,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }

        return { success: true, plan: input.planCode };
      } catch (err) {
        console.error('Mock checkout confirmation error:', err);
        const errMsg = err instanceof Error ? err.message : 'Mock checkout confirmation failed.';
        throw new Error(errMsg);
      }
    }),

  // Admin procedure to query dashboard analytics for demands/attempts
  getAdminAnalytics: adminProcedure.query(async () => {
    try {
      return await BillingService.getAnalytics();
    } catch (err) {
      console.error('Error fetching admin billing analytics:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch admin billing analytics.';
      throw new Error(errMsg);
    }
  }),

  // Admin procedure to fetch list of purchase intents
  listPurchaseIntents: adminProcedure
    .input(z.object({
      status: z.nativeEnum(PurchaseIntentStatus).optional(),
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      try {
        return await BillingService.listIntents(input);
      } catch (err) {
        console.error('Error listing purchase intents:', err);
        const errMsg = err instanceof Error ? err.message : 'Failed to list purchase intents.';
        throw new Error(errMsg);
      }
    }),

  // Admin procedure to update status/notes of a purchase intent
  updatePurchaseIntent: adminProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(PurchaseIntentStatus).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await BillingService.updateIntent(input.id, {
          status: input.status,
          notes: input.notes,
        });
      } catch (err) {
        console.error('Error updating purchase intent:', err);
        const errMsg = err instanceof Error ? err.message : 'Failed to update purchase intent.';
        throw new Error(errMsg);
      }
    }),
});

