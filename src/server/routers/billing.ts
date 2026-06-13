import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import Stripe from 'stripe';

const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const isMockStripe = !STRIPE_API_KEY || STRIPE_API_KEY.includes('mock');

const stripe = !isMockStripe
  ? new Stripe(STRIPE_API_KEY!, { apiVersion: '2025-01-27' as any })
  : null;

import { PLANS } from '@/lib/constants';

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
    };
  }),

  // Create Stripe checkout redirect URL
  createCheckoutSession: protectedProcedure
    .input(z.object({ planCode: z.enum(['PRO', 'POWER']) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        include: { subscription: true },
      });

      if (!user) throw new Error('User not found.');

      const priceId = input.planCode === 'PRO' ? 'price_pro_monthly' : 'price_power_monthly';
      const redirectUrl = `http://localhost:3000/dashboard/billing`;

      if (isMockStripe) {
        // Mock success URL redirecting back to local billing page with query flag
        console.log(`[Stripe Mock] Simulating checkout creation for plan ${input.planCode}`);
        return {
          url: `${redirectUrl}?mock_checkout_success=true&plan=${input.planCode}`,
        };
      }

      // Real Stripe Checkout Session creation
      try {
        const session = await stripe!.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          customer: user.subscription?.stripeCustomerId,
          success_url: `${redirectUrl}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: redirectUrl,
          metadata: {
            userId: user.id,
            planCode: input.planCode,
          },
        });

        return { url: session.url! };
      } catch (err: any) {
        console.error('Stripe session creation error:', err);
        throw new Error(err.message || 'Stripe initialization failed.');
      }
    }),

  // Manage billing redirect
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      throw new Error('No active subscription found.');
    }

    if (isMockStripe) {
      console.log(`[Stripe Mock] Simulating customer portal redirect`);
      return {
        url: `http://localhost:3000/dashboard/billing?mock_portal=true`,
      };
    }

    try {
      const session = await stripe!.billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: 'http://localhost:3000/dashboard/billing',
      });

      return { url: session.url };
    } catch (err: any) {
      console.error('Stripe Portal error:', err);
      throw new Error(err.message || 'Stripe portal failed.');
    }
  }),

  // Simulate payment callback for mock checkout
  confirmMockCheckout: protectedProcedure
    .input(z.object({ planCode: z.enum(['PRO', 'POWER']) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        include: { subscription: true },
      });

      if (!user) throw new Error('User not found.');

      const priceId = input.planCode === 'PRO' ? 'price_pro_monthly' : 'price_power_monthly';

      // Update mock subscription in database
      const sub = await ctx.db.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: 'ACTIVE',
          stripePriceId: priceId,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        },
        create: {
          userId: user.id,
          stripeCustomerId: 'cus_mock_' + Math.random().toString(36).substring(7),
          stripePriceId: priceId,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Insert dummy payment record
      await ctx.db.payment.create({
        data: {
          subscriptionId: sub.id,
          amount: input.planCode === 'PRO' ? 49900 : 99900,
          currency: 'inr',
          stripeChargeId: 'ch_mock_' + Math.random().toString(36).substring(7),
          status: 'succeeded',
        },
      });

      // Audit log
      await ctx.db.auditLog.create({
        data: {
          userId: user.id,
          action: 'BILLING_UPGRADE_MOCK',
          details: `Simulated upgrade to plan ${input.planCode} succeeded.`,
        },
      });

      return { success: true, plan: input.planCode };
    }),
});
