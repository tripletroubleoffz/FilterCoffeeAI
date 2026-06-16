import { db as prisma } from '@/lib/db';
import { ProviderFallbackChain } from '../ai/ProviderFallbackChain';
import { ContentItem } from '@prisma/client';

const aiChain = new ProviderFallbackChain();

export class ContentEnrichmentService {
  /**
   * Enriches a single ContentItem and saves the result in ContentEnrichment table.
   */
  static async enrichItem(itemId: string): Promise<void> {
    const item = await prisma.contentItem.findUnique({ where: { id: itemId } });
    if (!item) return;

    // Check if already enriched
    const existing = await prisma.contentEnrichment.findUnique({ where: { contentItemId: itemId } });
    if (existing) return;

    const systemPrompt = `
You are an expert AI content analyst. Given the following article content and title, extract and analyze the key information.
Provide the output STRICTLY as a JSON object matching this schema:
{
  "aiSummary": "2-4 sentence summary",
  "keyTakeaways": ["point 1", "point 2", "point 3"],
  "impactAnalysis": "Why it matters in 1-2 sentences",
  "audiences": ["Founder", "Engineer"], // Select from: Founder, Engineer, PM, Investor, Student, Enterprise
  "importanceScore": 85, // Integer 0-100
  "sentiment": "POSITIVE", // POSITIVE, NEUTRAL, or NEGATIVE
  "trendDirection": "RISING" // RISING, STABLE, or DECLINING
}
Do NOT wrap the output in markdown code blocks like \`\`\`json. Return ONLY the JSON object.
`;

    const userPrompt = `
Title: ${item.title}
Source: ${item.source}
Content:
${item.content.substring(0, 3000)} // truncate to save tokens
`;

    try {
      const responseText = await aiChain.generateText({
        systemPrompt,
        prompt: userPrompt,
        temperature: 0.2,
      });

      // Parse JSON from response
      const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      await prisma.contentEnrichment.create({
        data: {
          contentItemId: item.id,
          aiSummary: parsed.aiSummary || null,
          keyTakeaways: parsed.keyTakeaways || [],
          impactAnalysis: parsed.impactAnalysis || null,
          audiences: parsed.audiences || [],
          importanceScore: typeof parsed.importanceScore === 'number' ? parsed.importanceScore : 50,
          sentiment: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(parsed.sentiment) ? parsed.sentiment : 'NEUTRAL',
          trendDirection: ['RISING', 'STABLE', 'DECLINING'].includes(parsed.trendDirection) ? parsed.trendDirection : 'STABLE',
        }
      });

      // Update item status
      await prisma.contentItem.update({
        where: { id: item.id },
        data: { status: 'ENRICHED' }
      });

    } catch (error) {
      console.error(`Error enriching item ${item.id}:`, error);
    }
  }

  /**
   * Process a batch of pending items.
   */
  static async processPendingQueue(batchSize = 10): Promise<void> {
    const items = await prisma.contentItem.findMany({
      where: { status: 'PENDING' },
      take: batchSize,
      orderBy: { createdAt: 'desc' }
    });

    for (const item of items) {
      await this.enrichItem(item.id);
    }
  }
}
