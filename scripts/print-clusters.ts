import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clusters = await prisma.contentCluster.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`TOTAL CLUSTERS: ${clusters.length}`);
  console.log('='.repeat(100));

  clusters.forEach((c, idx) => {
    console.log(`[Cluster #${idx + 1}] ID: ${c.id}`);
    console.log(`Title: ${c.theme}`);
    console.log(`Summary: ${c.summary || '(No Summary Generated)'}`);
    console.log(`Importance: ${c.importance}`);
    console.log(`Creation Timestamp: ${c.createdAt.toISOString()}`);
    console.log(`Number of items: ${c.items.length}`);
    console.log('Items:');
    c.items.forEach((item, i) => {
      console.log(`  - [${i+1}] Title: "${item.title}" | Score: ${item.finalScore} | URL: ${item.url}`);
    });
    console.log('-'.repeat(100));
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
