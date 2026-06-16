import { PrismaClient } from '@prisma/client';
import { ContentIngestionService } from '../src/server/services/ingestion/ContentIngestionService';
import { IngestionScheduler } from '../src/server/services/ingestion/IngestionScheduler';
import { ContentEnrichmentService } from '../src/server/services/ingestion/ContentEnrichmentService';
import { SignalRankingService } from '../src/server/services/ingestion/SignalRankingService';
import { ContentClusteringService } from '../src/server/services/ingestion/ContentClusteringService';
import { DailyBrewPipeline } from '../src/server/services/ingestion/DailyBrewPipeline';
import { AIRadarPipeline } from '../src/server/services/ingestion/AIRadarPipeline';

const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING TEST PIPELINE ===');

  // Find the seeded sources
  const sources = await prisma.sourceProvider.findMany({
    where: { isActive: true }
  });

  if (sources.length === 0) {
    console.error('No active SourceProviders found. Please run seed-source-providers.ts first.');
    return;
  }

  console.log(`Found ${sources.length} active SourceProviders.`);

  // 1. Run live ingestion for each source
  console.log('\n--- 1. RUNNING LIVE INGESTION ---');
  for (const source of sources) {
    console.log(`Ingesting source: ${source.name} (${source.url})`);
    try {
      const result = await ContentIngestionService.ingestSource(source.id);
      console.log(`Result for ${source.name}:`);
      console.log(`  Fetched: ${result.fetched}`);
      console.log(`  Added: ${result.added}`);
      console.log(`  Duplicates: ${result.duplicates}`);
      if (result.error) {
        console.error(`  Error: ${result.error}`);
      }
    } catch (e: any) {
      console.error(`  Failed to ingest: ${e.message}`);
    }
  }

  // Check how many items we have in total now
  const pendingCount = await prisma.contentItem.count({ where: { status: 'PENDING' } });
  console.log(`Total PENDING ContentItems in DB: ${pendingCount}`);

  // Print a sample of 3 ContentItems
  const sampleItems = await prisma.contentItem.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
  console.log('Sample Ingested Items:', JSON.stringify(sampleItems, null, 2));

  // 2. Run Enrichment for 5 items
  console.log('\n--- 2. RUNNING AI ENRICHMENT ---');
  console.log('Enriching 5 pending items...');
  const itemsToEnrich = await prisma.contentItem.findMany({
    where: { status: 'PENDING' },
    take: 5
  });

  console.log(`Found ${itemsToEnrich.length} items to enrich.`);
  for (const item of itemsToEnrich) {
    console.log(`Enriching item: "${item.title}" (ID: ${item.id})`);
    const startTime = Date.now();
    await ContentEnrichmentService.enrichItem(item.id);
    console.log(`Finished enriching "${item.title}" in ${Date.now() - startTime}ms`);
  }

  // Print 5 real ContentEnrichment records
  const enrichments = await prisma.contentEnrichment.findMany({
    take: 5,
    include: { contentItem: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log('\nGenerated ContentEnrichments:', JSON.stringify(enrichments, null, 2));

  // 3. Run Ranking
  console.log('\n--- 3. RUNNING RANKING ENGINE ---');
  console.log('Ranking enriched items...');
  await SignalRankingService.processRankingQueue(10);

  // Print ranked items
  const rankedItems = await prisma.contentItem.findMany({
    where: { finalScore: { gt: 0.0 } },
    orderBy: { finalScore: 'desc' },
    take: 10,
    include: { enrichment: true }
  });
  console.log('Ranked Items:', JSON.stringify(rankedItems, null, 2));

  // 4. Run Clustering
  console.log('\n--- 4. RUNNING CONTENT CLUSTERING ---');
  await ContentClusteringService.processClusters(10);

  // Print clusters and their items
  const clusters = await prisma.contentCluster.findMany({
    include: { items: true },
    take: 5
  });
  console.log('Created Clusters:', JSON.stringify(clusters, null, 2));

  // 5. Generate Morning Brew
  console.log('\n--- 5. GENERATING DAILY MORNING BREW ---');
  // First, make sure some items have finalScore > 50 so that fetchTopItems finds them.
  // If their score is less, let's temporarily force score > 50 for the test items
  const itemsToForceScore = await prisma.contentItem.findMany({
    where: { finalScore: { gt: 0.0 } },
    take: 5
  });
  for (const it of itemsToForceScore) {
    await prisma.contentItem.update({
      where: { id: it.id },
      data: { finalScore: 75.5 }
    });
  }

  const morningBrew = await DailyBrewPipeline.generateMorningBrew();
  console.log('Morning Brew Output:', JSON.stringify(morningBrew, null, 2));

  // 6. Generate AI Radar Report
  console.log('\n--- 6. GENERATING AI RADAR REPORT ---');
  const radarReport = await AIRadarPipeline.generateRadarReport(12); // look back 12 hours
  console.log('AI Radar Report Output:', JSON.stringify(radarReport, null, 2));

  console.log('\n=== PIPELINE RUN COMPLETE ===');
}

main()
  .catch(e => {
    console.error('Error running test pipeline:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
