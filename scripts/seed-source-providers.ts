import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SourceProviders...');

  const providers = [
    {
      name: 'Hacker News Top Stories',
      url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
      type: 'API_HACKERNEWS',
      format: 'JSON',
      category: 'AI',
      pollingInterval: 15,
      isActive: true,
    },
    {
      name: 'arXiv CS AI Papers',
      url: 'https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=5',
      type: 'API_ARXIV',
      format: 'XML',
      category: 'AI',
      pollingInterval: 15,
      isActive: true,
    }
  ];

  for (const provider of providers) {
    const record = await prisma.sourceProvider.upsert({
      where: { url: provider.url },
      update: {
        type: provider.type,
        format: provider.format,
        category: provider.category,
        pollingInterval: provider.pollingInterval,
        isActive: provider.isActive,
      },
      create: provider,
    });
    console.log(`Seeded provider: ${record.name} (${record.id})`);
  }

  console.log('SourceProviders seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding SourceProviders:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
