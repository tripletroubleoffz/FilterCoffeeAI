import { router, adminProcedure } from '../trpc';
import { z } from 'zod';
import { runAllIngestions, generateUserDigest } from '@/lib/worker';

export const adminRouter = router({
  // Fetch system statistics and KPIs
  getMetrics: adminProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.db.user.count();
    const activeSubscribers = await ctx.db.subscription.count({ where: { status: 'ACTIVE' } });
    const totalTopics = await ctx.db.topic.count();
    const totalSignals = await ctx.db.signal.count();
    const totalEmails = await ctx.db.emailLog.count();
    
    // Simulate cost metrics based on token calculations
    const auditLogsCount = await ctx.db.auditLog.count();
    const estimatedCostCents = totalSignals * 0.05 + totalEmails * 0.1; // estimate: 0.05c per signal vector embedding/parsing, 0.1c per email
    
    // Group signals by category
    const signalsByCategory = await ctx.db.signal.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const categoryStats = {
      AI: 0,
      Finance: 0,
      Career: 0,
      General: 0,
    } as Record<string, number>;

    for (const group of signalsByCategory) {
      if (group.category in categoryStats) {
        categoryStats[group.category] = group._count.id;
      }
    }

    return {
      stats: {
        totalUsers,
        activeSubscribers,
        totalTopics,
        totalSignals,
        totalEmails,
        estimatedCost: `$${(estimatedCostCents / 100).toFixed(2)}`,
        systemHealth: 'Healthy',
      },
      categoryStats,
    };
  }),

  // Manage Feeds Sources
  getSources: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.source.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { signals: true } } },
    });
  }),

  createSource: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        type: z.enum(['AI', 'Finance', 'Career', 'General']),
        format: z.enum(['RSS', 'API', 'CUSTOM']).default('RSS'),
        category: z.string().default('General'),
        pollingInterval: z.number().int().positive().default(60),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.db.source.create({
        data: {
          name: input.name,
          url: input.url,
          type: input.type,
          format: input.format,
          category: input.category,
          pollingInterval: input.pollingInterval,
          isActive: true,
        },
      });

      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'SOURCE_CREATE',
          details: `Admin created source "${input.name}" (${input.url})`,
        },
      });

      return source;
    }),

  deleteSource: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.db.source.findUnique({ where: { id: input.id } });
      if (!source) throw new Error('Source not found.');

      await ctx.db.source.delete({ where: { id: input.id } });

      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'SOURCE_DELETE',
          details: `Admin deleted source "${source.name}".`,
        },
      });

      return { success: true };
    }),

  toggleSourceActive: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.db.source.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'SOURCE_TOGGLE_ACTIVE',
          details: `Admin toggled source active state for "${source.name}" to ${input.isActive}`,
        },
      });

      return source;
    }),

  testIngestSource: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.db.source.findUnique({ where: { id: input.id } });
      if (!source) throw new Error('Source not found.');

      const { ingestSource } = await import('@/lib/worker');
      try {
        await ingestSource(source.id);
        const updated = await ctx.db.source.findUnique({ where: { id: input.id } });
        return {
          success: true,
          healthStatus: updated?.healthStatus || 'HEALTHY',
          lastError: updated?.lastError || null,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || String(err),
        };
      }
    }),

  // Trigger ingestion pipeline instantly for all sources
  triggerManualIngestion: adminProcedure.mutation(async ({ ctx }) => {
    // Fire background ingestion without blocking request
    console.log('[Admin] Triggering manual pipeline ingestion...');
    runAllIngestions().catch((e) => console.error('[Admin] Manual ingestion error:', e));

    await ctx.db.auditLog.create({
      data: {
        userId: ctx.user.id,
        action: 'MANUAL_INGESTION_TRIGGER',
        details: 'Admin triggered manual RSS/API signals collection.',
      },
    });

    return { success: true, message: 'Ingestion pipeline launched in background.' };
  }),

  // Trigger briefing compile for user
  triggerManualDigest: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        frequency: z.enum(['DAILY', 'WEEKLY']).default('DAILY'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(`[Admin] Triggering manual digest for user ${input.userId}`);
      
      const targetUser = await ctx.db.user.findUnique({ where: { id: input.userId } });
      if (!targetUser) throw new Error('Target user not found.');

      // Run generator synchronously to return success status to admin dashboard
      try {
        await generateUserDigest(targetUser.id, input.frequency);
      } catch (err: any) {
        throw new Error(`Failed to generate digest: ${err.message}`);
      }

      await ctx.db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: 'MANUAL_DIGEST_TRIGGER',
          details: `Admin manually compiled and emailed ${input.frequency} digest to ${targetUser.email}.`,
        },
      });

      return { success: true, message: `Digest compiled and queued for ${targetUser.email}.` };
    }),

  // Audit and mail logs
  getEmailLogs: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }),

  getAuditLogs: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { email: true } } },
    });
  }),
});
