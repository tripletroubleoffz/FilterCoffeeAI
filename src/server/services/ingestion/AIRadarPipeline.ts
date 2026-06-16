import { db as prisma } from '@/lib/db';
import { ContentItem } from '@prisma/client';
import { ProviderFallbackChain } from '../ai/ProviderFallbackChain';

const aiChain = new ProviderFallbackChain();

export interface RadarEntry {
  title: string;
  summary: string;
  impact: string;
  affectedUsers: string;
  recommendedAction: string;
  importanceScore: number;
  sourceUrl?: string;
  category: string;
}

export class AIRadarPipeline {
  /**
   * Identifies if an item belongs to the AI Radar categories.
   */
  private static async analyzeForRadar(item: ContentItem): Promise<RadarEntry | null> {
    const prompt = `
Analyze this article for the AI Radar report. 
Does this article announce: A Model Release, Pricing Change, AI Funding, Acquisition, Research Breakthrough, Open Source Release, or Benchmark Change?
If NO, reply with "NULL".
If YES, output STRICTLY a JSON object matching this schema:
{
  "category": "Model Release", // Choose from the list above
  "title": "Clear concise title",
  "summary": "1-2 sentence summary of what happened",
  "impact": "1 sentence on industry impact",
  "affectedUsers": "Who needs to care (e.g. Developers, Enterprise, Researchers)",
  "recommendedAction": "1 sentence on what to do (e.g. Test new model, Update pricing docs)",
  "importanceScore": 85 // Integer 0-100
}
Article Title: ${item.title}
Article Content: ${item.content.substring(0, 1500)}
`;

    try {
      const response = await aiChain.generateText({ prompt, temperature: 0.1 });
      const text = response.trim();
      
      if (text === 'NULL' || text.includes('"NULL"')) return null;

      const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      return {
        ...parsed,
        sourceUrl: item.url,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Generates radar entries for recent high-importance items.
   * This would typically be saved to a specific Report model or Radar table.
   */
  static async generateRadarReport(hoursBack = 24): Promise<RadarEntry[]> {
    const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    // Fetch top items
    const topItems = await prisma.contentItem.findMany({
      where: {
        createdAt: { gte: cutoff },
        finalScore: { gte: 70 }, // Only high value items
        category: { in: ['AI', 'RESEARCH', 'STARTUPS', 'FUNDING', 'MARKET'] }
      },
      orderBy: { finalScore: 'desc' },
      take: 20
    });

    const entries: RadarEntry[] = [];

    for (const item of topItems) {
      const entry = await this.analyzeForRadar(item);
      if (entry) {
        entries.push(entry);
      }
    }

    // Sort by importance descending
    entries.sort((a, b) => b.importanceScore - a.importanceScore);

    return entries;
  }
}
