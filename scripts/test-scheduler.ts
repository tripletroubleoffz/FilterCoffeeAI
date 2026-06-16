import { PrismaClient } from '@prisma/client';
import { IngestionScheduler } from '../src/server/services/ingestion/IngestionScheduler';

const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING SCHEDULER TEST ===');
  
  const startTime = Date.now();
  console.log('Running IngestionScheduler.runIngestionForCategory("AI")...');
  
  await IngestionScheduler.runIngestionForCategory('AI');
  
  console.log(`Scheduler execution finished in ${Date.now() - startTime}ms.`);

  const jobs = await prisma.ingestionJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  
  console.log('IngestionJobs populated in DB:', JSON.stringify(jobs, null, 2));
}

main()
  .catch(e => {
    console.error('Error running scheduler test:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
