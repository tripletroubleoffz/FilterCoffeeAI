import { db as prisma } from '@/lib/db';
import { ContentIngestionService } from './ContentIngestionService';
import { ContentEnrichmentService } from './ContentEnrichmentService';
import { SignalRankingService } from './SignalRankingService';
import { ContentClusteringService } from './ContentClusteringService';
import { DailyBrewPipeline } from './DailyBrewPipeline';
import { AIRadarPipeline } from './AIRadarPipeline';

export class IngestionScheduler {
  /**
   * Run ingestion for a specific category of sources.
   */
  static async runIngestionForCategory(category: string): Promise<void> {
    const sources = await prisma.sourceProvider.findMany({
      where: { category, isActive: true }
    });

    for (const source of sources) {
      try {
        const job = await prisma.ingestionJob.create({
          data: { sourceName: source.name, status: 'RUNNING' }
        });

        const startTime = Date.now();
        let attempt = 0;
        const maxRetries = 3;
        let success = false;

        while (attempt < maxRetries && !success) {
          attempt++;
          try {
            const result = await ContentIngestionService.ingestSource(source.id);
            
            await prisma.ingestionJob.update({
              where: { id: job.id },
              data: {
                status: result.error ? 'FAILED' : 'SUCCESS',
                itemsFetched: result.fetched,
                itemsAdded: result.added,
                duplicatesFound: result.duplicates,
                error: result.error || null,
                executionTimeMs: Date.now() - startTime
              }
            });
            success = !result.error;
          } catch (e: any) {
            console.error(`[IngestionScheduler] Attempt ${attempt} failed for source ${source.name}:`, e);
            if (attempt === maxRetries) {
              await prisma.ingestionJob.update({
                where: { id: job.id },
                data: { status: 'FAILED', error: e.message || String(e), executionTimeMs: Date.now() - startTime }
              });
            }
          }
        }
      } catch (err: any) {
        console.error(`[IngestionScheduler] Fatal ingestion loop error for source ${source.name}:`, err);
      }
    }

    // After ingestion completes for a category, run the pipeline
    await this.runProcessingPipeline();
  }

  /**
   * Run Enrichment, Ranking, and Clustering.
   */
  static async runProcessingPipeline(): Promise<void> {
    try {
      // 1. Enrich (Limit batch size)
      await ContentEnrichmentService.processPendingQueue(20);
      
      // 2. Rank
      await SignalRankingService.processRankingQueue(50);
      
      // 3. Cluster
      await ContentClusteringService.processClusters(50);
      
    } catch (e) {
      console.error('Error in processing pipeline:', e);
    }
  }

  // --- Cron Entrypoints ---

  static async run15MinJobs(): Promise<void> {
    await this.runIngestionForCategory('AI');
    // Also generate AI Radar incrementally
    await AIRadarPipeline.generateRadarReport(1); // look back 1 hour
  }

  static async run30MinJobs(): Promise<void> {
    await this.runIngestionForCategory('RESEARCH');
  }

  static async runHourlyJobs(): Promise<void> {
    await this.runIngestionForCategory('STARTUPS');
    await this.runIngestionForCategory('ENGINEERING');
    await this.runIngestionForCategory('PRODUCT');
    await this.runIngestionForCategory('MARKET');
    await this.runIngestionForCategory('FUNDING');
  }

  static async runDailyJobs(): Promise<void> {
    await DailyBrewPipeline.generateMorningBrew();
    await DailyBrewPipeline.generateEveningBrew();
  }

  static async runWeeklyJobs(): Promise<void> {
    await DailyBrewPipeline.generateWeeklyRoast();
  }

  static async runMonthlyJobs(): Promise<void> {
    await DailyBrewPipeline.generateMonthlyBlend();
  }
}
