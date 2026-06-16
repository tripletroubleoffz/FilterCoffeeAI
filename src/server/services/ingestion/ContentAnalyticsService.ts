import { db as prisma } from '@/lib/db';

export class ContentAnalyticsService {
  /**
   * Generates or updates the daily analytics record.
   * This should be called at the end of each day or periodically.
   */
  static async updateDailyAnalytics(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setDate(today.getDate() + 1);

    // 1. Articles Ingested
    const ingestedCount = await prisma.contentItem.count({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay }
      }
    });

    // 2. Duplicates Removed (from IngestionJob)
    const jobs = await prisma.ingestionJob.aggregate({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay }
      },
      _sum: {
        duplicatesFound: true,
      }
    });
    const duplicatesRemoved = jobs._sum.duplicatesFound || 0;

    // 3. Clusters Created
    const clustersCreated = await prisma.contentCluster.count({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay }
      }
    });

    // 4. Top Sources (Aggregation)
    const sourcesAgg = await prisma.contentItem.groupBy({
      by: ['source'],
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay }
      },
      _count: { source: true },
      orderBy: { _count: { source: 'desc' } },
      take: 5
    });

    const topSources = sourcesAgg.map((s: any) => ({ source: s.source, count: s._count.source }));

    // 5. Trending Topics (from Enrichment or Clusters)
    const trendingClusters = await prisma.contentCluster.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay }
      },
      orderBy: { importance: 'desc' },
      take: 5,
      select: { theme: true, importance: true }
    });

    // Update or create analytics record
    await prisma.contentAnalytics.upsert({
      where: { date: today },
      update: {
        articlesIngested: ingestedCount,
        duplicatesRemoved,
        clustersCreated,
        topSources: topSources as any,
        trendingTopics: trendingClusters as any,
      },
      create: {
        date: today,
        articlesIngested: ingestedCount,
        duplicatesRemoved,
        clustersCreated,
        topSources: topSources as any,
        trendingTopics: trendingClusters as any,
      }
    });
  }
}
