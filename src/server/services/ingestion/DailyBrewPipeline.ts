import { db as prisma } from '@/lib/db';
import { ProviderFallbackChain } from '../ai/ProviderFallbackChain';
import { ContentItem } from '@prisma/client';

const aiChain = new ProviderFallbackChain();

export interface BrewOutput {
  headline: string;
  keyDevelopments: string[];
  whatChanged: string;
  whyItMatters: string;
  recommendedActions: string[];
  priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sources: { title: string; url: string }[];
}

export class DailyBrewPipeline {
  private static async generateBrewInternal(items: ContentItem[], context: string): Promise<BrewOutput | null> {
    if (items.length === 0) return null;

    const sourcesPayload = items.map(i => `- ${i.title} (Source: ${i.source})`).join('\n');
    const contentPayload = items.map(i => `[${i.title}]\n${i.content.substring(0, 800)}`).join('\n\n');

    const prompt = `
You are creating a specialized intelligence briefing called "${context}".
Based on the following ranked articles, generate a single cohesive briefing.
Provide output STRICTLY as JSON matching this schema:
{
  "headline": "Catchy, informative overall headline",
  "keyDevelopments": ["point 1", "point 2"],
  "whatChanged": "Paragraph summarizing the technical/market shift",
  "whyItMatters": "Paragraph explaining the strategic impact",
  "recommendedActions": ["action 1", "action 2"],
  "priorityLevel": "HIGH" // Choose CRITICAL, HIGH, MEDIUM, LOW
}

Articles:
${contentPayload}
`;

    try {
      const response = await aiChain.generateText({ prompt, temperature: 0.3 });
      const cleanedText = response.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      return {
        ...parsed,
        sources: items.map(i => ({ title: i.title, url: i.url }))
      };
    } catch (error) {
      console.error(`Error generating brew (${context}):`, error);
      return null;
    }
  }

  private static async fetchTopItems(hoursBack: number, limit: number): Promise<ContentItem[]> {
    return prisma.contentItem.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - hoursBack * 60 * 60 * 1000) },
        finalScore: { gt: 50 } // Must be somewhat relevant
      },
      orderBy: { finalScore: 'desc' },
      take: limit
    });
  }

  static async generateMorningBrew(): Promise<BrewOutput | null> {
    const items = await this.fetchTopItems(12, 10);
    return this.generateBrewInternal(items, "Morning Brew");
  }

  static async generateEveningBrew(): Promise<BrewOutput | null> {
    const items = await this.fetchTopItems(12, 10);
    return this.generateBrewInternal(items, "Evening Brew");
  }

  static async generateWeeklyRoast(): Promise<BrewOutput | null> {
    const items = await this.fetchTopItems(7 * 24, 20);
    return this.generateBrewInternal(items, "Weekly Roast");
  }

  static async generateMonthlyBlend(): Promise<BrewOutput | null> {
    const items = await this.fetchTopItems(30 * 24, 30);
    return this.generateBrewInternal(items, "Monthly Blend");
  }
}
