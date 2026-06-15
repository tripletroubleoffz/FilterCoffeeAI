import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { PLANS } from '@/lib/constants';

export const topicsRouter = router({
  // Get all active topics for the logged in user
  getTopics: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.topic.findMany({
      where: { userId: ctx.user.id },
      include: { keywords: true },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Create a new topic feed with inclusive and exclusive keywords
  createTopic: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        frequency: z.enum(['DAILY', 'WEEKLY']).default('DAILY'),
        includeKeywords: z.array(z.string()).default([]),
        excludeKeywords: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch current subscription and topic count to enforce plan limits
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
      let maxTopics = PLANS.FREE.maxTopics;

      if (sub?.status === 'ACTIVE') {
        if (sub.stripePriceId === 'price_pro_monthly' || sub.stripePriceId?.includes('pro')) {
          maxTopics = PLANS.PRO.maxTopics;
        } else if (sub.stripePriceId === 'price_power_monthly' || sub.stripePriceId?.includes('power')) {
          maxTopics = PLANS.POWER.maxTopics;
        }
      }

      if (user._count.topics >= maxTopics) {
        throw new Error(`You have reached the maximum number of topic feeds allowed for your plan (${maxTopics} topic${maxTopics === 1 ? '' : 's'}). Please upgrade your subscription to add more feeds.`);
      }

      // 2. Create the base topic
      const topic = await ctx.db.topic.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          frequency: input.frequency,
          isActive: true,
        },
      });

      // 2. Create the associated keywords
      if (input.includeKeywords.length > 0) {
        await ctx.db.topicKeyword.createMany({
          data: input.includeKeywords.map(kw => ({
            topicId: topic.id,
            keyword: kw.trim().toLowerCase(),
            isExclude: false,
          })),
        });
      }

      if (input.excludeKeywords.length > 0) {
        await ctx.db.topicKeyword.createMany({
          data: input.excludeKeywords.map(kw => ({
            topicId: topic.id,
            keyword: kw.trim().toLowerCase(),
            isExclude: true,
          })),
        });
      }

      // Record audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'TOPIC_CREATE',
          details: `Created topic "${input.name}" with ${input.includeKeywords.length} include and ${input.excludeKeywords.length} exclude keywords.`,
        },
      });

      return ctx.db.topic.findUnique({
        where: { id: topic.id },
        include: { keywords: true },
      });
    }),

  // Update topic basic information
  updateTopic: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50),
        frequency: z.enum(['DAILY', 'WEEKLY']),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const topic = await ctx.db.topic.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!topic) {
        throw new Error('Topic not found or access denied.');
      }

      const updated = await ctx.db.topic.update({
        where: { id: input.id },
        data: {
          name: input.name,
          frequency: input.frequency,
          isActive: input.isActive,
        },
        include: { keywords: true },
      });

      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'TOPIC_UPDATE',
          details: `Updated topic "${input.name}". Active status: ${input.isActive}.`,
        },
      });

      return updated;
    }),

  // Toggle topic active status
  toggleTopicActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const topic = await ctx.db.topic.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!topic) {
        throw new Error('Topic not found.');
      }

      const updated = await ctx.db.topic.update({
        where: { id: input.id },
        data: { isActive: !topic.isActive },
      });

      return updated;
    }),

  // Delete a topic feed
  deleteTopic: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const topic = await ctx.db.topic.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!topic) {
        throw new Error('Topic not found or access denied.');
      }

      await ctx.db.topic.delete({ where: { id: input.id } });

      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'TOPIC_DELETE',
          details: `Deleted topic "${topic.name}".`,
        },
      });

      return { success: true };
    }),
});
