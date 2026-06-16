import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getAuthorityScore(source: string): number {
  const s = source.toLowerCase();
  if (s.includes('openai') || s.includes('arxiv')) return 100;
  if (s.includes('anthropic') || s.includes('google ai') || s.includes('deepmind') || s.includes('papers with code')) return 95;
  if (s.includes('hacker news') || s.includes('github') || s.includes('meta ai') || s.includes('huggingface') || s.includes('y combinator')) return 90;
  if (s.includes('techcrunch') || s.includes('product hunt') || s.includes('venturebeat') || s.includes('mistral') || s.includes('cohere') || s.includes('perplexity')) return 85;
  return 50;
}

function getRecencyScore(publishedAt: Date): number {
  const ageMs = Date.now() - publishedAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays <= 0) return 100;
  if (ageDays >= 7) return 0;
  return Math.max(0, 100 - (ageDays * (100 / 7)));
}

function getTrendScore(direction: string): number {
  switch (direction.toUpperCase()) {
    case 'RISING': return 100;
    case 'STABLE': return 50;
    case 'DECLINING': return 10;
    default: return 50;
  }
}

async function main() {
  const items = await prisma.contentItem.findMany({
    orderBy: { finalScore: 'desc' },
    take: 20,
    include: { enrichment: true }
  });

  console.log('RANKED CONTENT ITEMS TABLE:');
  console.log('='.repeat(120));
  console.log(
    '#'.padEnd(3) + ' | ' +
    'Title'.padEnd(50) + ' | ' +
    'Score'.padEnd(6) + ' | ' +
    'Recency'.padEnd(7) + ' | ' +
    'Authority'.padEnd(9) + ' | ' +
    'Importance'.padEnd(10) + ' | ' +
    'Trend'.padEnd(5) + ' | ' +
    'Source'
  );
  console.log('='.repeat(120));

  items.forEach((item, index) => {
    const recency = getRecencyScore(item.publishedAt).toFixed(1);
    const authority = getAuthorityScore(item.source);
    const importance = item.enrichment?.importanceScore ?? 50;
    const trend = item.enrichment ? getTrendScore(item.enrichment.trendDirection) : 50;
    const title = item.title.length > 47 ? item.title.substring(0, 47) + '...' : item.title;

    console.log(
      `${String(index + 1).padEnd(3)} | ` +
      `${title.padEnd(50)} | ` +
      `${String(item.finalScore).padEnd(6)} | ` +
      `${String(recency).padEnd(7)} | ` +
      `${String(authority).padEnd(9)} | ` +
      `${String(importance).padEnd(10)} | ` +
      `${String(trend).padEnd(5)} | ` +
      `${item.source}`
    );
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
