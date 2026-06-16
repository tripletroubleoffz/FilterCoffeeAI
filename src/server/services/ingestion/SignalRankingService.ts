import { db as prisma } from '@/lib/db';
import { ContentItem } from '@prisma/client';

export class SignalRankingService {
  /**
   * Authority scores based on source.
   */
  private static getAuthorityScore(source: string): number {
    const s = source.toLowerCase();
    if (s.includes('openai') || s.includes('arxiv')) return 100;
    if (s.includes('anthropic') || s.includes('google ai') || s.includes('deepmind') || s.includes('papers with code')) return 95;
    if (s.includes('hacker news') || s.includes('github') || s.includes('meta ai') || s.includes('huggingface') || s.includes('y combinator')) return 90;
    if (s.includes('techcrunch') || s.includes('product hunt') || s.includes('venturebeat') || s.includes('mistral') || s.includes('cohere') || s.includes('perplexity')) return 85;
    
    return 50; // Unknown Source
  }

  /**
   * Calculate recency score (decay over 7 days). Max 100.
   */
  private static getRecencyScore(publishedAt: Date): number {
    const ageMs = Date.now() - publishedAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    
    if (ageDays <= 0) return 100;
    if (ageDays >= 7) return 0;
    
    // Linear decay over 7 days
    return Math.max(0, 100 - (ageDays * (100 / 7)));
  }

  /**
   * Trend score based on direction.
   */
  private static getTrendScore(direction: string): number {
    switch (direction.toUpperCase()) {
      case 'RISING': return 100;
      case 'STABLE': return 50;
      case 'DECLINING': return 10;
      default: return 50;
    }
  }

  /**
   * Calculate and save the final score for a ContentItem.
   * finalScore = recency (weight 2) + authority (weight 2) + importance (weight 3) + trend (weight 1) + engagement (weight 1)
   */
  static async rankItem(itemId: string): Promise<void> {
    const item = await prisma.contentItem.findUnique({ 
      where: { id: itemId },
      include: { enrichment: true }
    });

    if (!item || !item.enrichment) return;

    const recency = this.getRecencyScore(item.publishedAt);
    const authority = this.getAuthorityScore(item.source);
    const importance = item.enrichment.importanceScore || 50;
    const trend = this.getTrendScore(item.enrichment.trendDirection);
    const engagement = 50; // default for now, could be based on shares/clicks later

    // Weighted average logic (sum of weights = 9)
    const totalScore = (
      (recency * 2) + 
      (authority * 2) + 
      (importance * 3) + 
      (trend * 1) + 
      (engagement * 1)
    ) / 9;

    await prisma.contentItem.update({
      where: { id: itemId },
      data: { finalScore: Number(totalScore.toFixed(2)) }
    });
  }

  /**
   * Ranks all enriched but unranked items (or just updates all recently enriched).
   */
  static async processRankingQueue(batchSize = 50): Promise<void> {
    const items = await prisma.contentItem.findMany({
      where: { 
        status: 'ENRICHED',
        finalScore: 0.0 
      },
      take: batchSize
    });

    for (const item of items) {
      await this.rankItem(item.id);
    }
  }
}
