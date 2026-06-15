import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Cleaning mock signals...');
  // Delete signals where url matches our mock URLs or source is null or category is mock
  // In `getMockSourceItems`, we used urls like:
  // 'https://openai.com/blog/gpt-5-preview-agent-orchestration'
  // 'https://linkedin.com/reports/rust-demand-grow-cloud'
  // 'https://github.com/trending/oss-agent-yaml'
  
  const mockUrls = [
    'https://openai.com/blog/gpt-5-preview-agent-orchestration',
    'https://anthropic.com/news/claude-3-5-opus',
    'https://mistral.ai/news/pixtral-large-vision',
    'https://federalreserve.gov/news/interest-rate-june-2026',
    'https://techcrunch.com/qdrant-series-b-45m',
    'https://bloomberg.com/news/tech-market-correction-capex',
    'https://linkedin.com/reports/rust-demand-grow-cloud',
    'https://hiringtrends.com/roles/ai-orchestration-engineers',
    'https://workplaces.org/reports/hybrid-tech-hubs-stabilize',
    'https://github.com/trending/oss-agent-yaml'
  ];

  const result = await db.signal.deleteMany({
    where: {
      url: { in: mockUrls }
    }
  });

  console.log(`Deleted ${result.count} mock signals from the database.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
