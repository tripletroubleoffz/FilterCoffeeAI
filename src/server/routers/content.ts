import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { db as prisma } from '@/lib/db';
import { IngestionScheduler } from '../services/ingestion/IngestionScheduler';
import { ContentAnalyticsService } from '../services/ingestion/ContentAnalyticsService';

export const contentRouter = router({
  // Public / User facing queries
  getRadarEntries: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      // In a real implementation, AIRadar entries might be saved in a DB table
      // Here we fetch high score items to mock the radar if we don't have a radar table
      return prisma.contentItem.findMany({
        where: { finalScore: { gte: 70 }, status: 'CLUSTERED' },
        orderBy: { finalScore: 'desc' },
        take: input.limit,
        include: { enrichment: true }
      });
    }),

  getBrew: protectedProcedure
    .input(z.object({ type: z.enum(['MORNING', 'EVENING', 'WEEKLY', 'MONTHLY']) }))
    .query(async ({ input }) => {
      // Fetch latest report or content matching the brew
      // Placeholder since BrewOutput is not a Prisma model yet
      return null;
    }),

  // Admin facing queries
  getSources: adminProcedure
    .query(async () => {
      return prisma.sourceProvider.findMany({
        orderBy: { category: 'asc' }
      });
    }),

  addSource: adminProcedure
    .input(z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.string(),
      category: z.string()
    }))
    .mutation(async ({ input }) => {
      return prisma.sourceProvider.create({
        data: {
          name: input.name,
          url: input.url,
          type: input.type,
          category: input.category,
        }
      });
    }),

  triggerIngestion: adminProcedure
    .input(z.object({ category: z.string() }))
    .mutation(async ({ input }) => {
      // Run async
      IngestionScheduler.runIngestionForCategory(input.category).catch(console.error);
      return { success: true, message: `Triggered ingestion for ${input.category}` };
    }),

  getAnalytics: adminProcedure
    .query(async () => {
      return prisma.contentAnalytics.findMany({
        orderBy: { date: 'desc' },
        take: 7
      });
    }),

  getIngestionJobs: adminProcedure
    .query(async () => {
      return prisma.ingestionJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    }),
});
