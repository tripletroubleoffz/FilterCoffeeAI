import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying Database Statistics...');
  try {
    const totalContentItems = await prisma.contentItem.count();
    const totalContentEnrichments = await prisma.contentEnrichment.count();
    const totalContentClusters = await prisma.contentCluster.count();
    const totalIngestionJobs = await prisma.ingestionJob.count();
    const totalSourceProviders = await prisma.sourceProvider.count();

    console.log('\n--- STATISTICS ---');
    console.log(`Total SourceProviders: ${totalSourceProviders}`);
    console.log(`Total ContentItems: ${totalContentItems}`);
    console.log(`Total ContentEnrichments: ${totalContentEnrichments}`);
    console.log(`Total ContentClusters: ${totalContentClusters}`);
    console.log(`Total IngestionJobs: ${totalIngestionJobs}`);

    console.log('\n--- SAMPLE SOURCE PROVIDERS ---');
    const sources = await prisma.sourceProvider.findMany({ take: 3 });
    console.log(JSON.stringify(sources, null, 2));

    console.log('\n--- SAMPLE CONTENT ITEMS ---');
    const items = await prisma.contentItem.findMany({ take: 3 });
    console.log(JSON.stringify(items, null, 2));

    console.log('\n--- SAMPLE ENRICHMENTS ---');
    const enrichments = await prisma.contentEnrichment.findMany({ take: 3 });
    console.log(JSON.stringify(enrichments, null, 2));

    console.log('\n--- SAMPLE CLUSTERS ---');
    const clusters = await prisma.contentCluster.findMany({ take: 3 });
    console.log(JSON.stringify(clusters, null, 2));

    console.log('\n--- SAMPLE INGESTION JOBS ---');
    const jobs = await prisma.ingestionJob.findMany({ take: 3 });
    console.log(JSON.stringify(jobs, null, 2));

  } catch (error) {
    console.error('Error querying stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
