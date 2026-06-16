import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching top 20 ContentItems ordered by finalScore...');

  const topItems = await prisma.contentItem.findMany({
    orderBy: { finalScore: 'desc' },
    take: 20,
    include: { enrichment: true }
  });

  console.log('Top Items JSON Output:');
  console.log(JSON.stringify(topItems, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
