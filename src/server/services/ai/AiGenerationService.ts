import { db } from '@/lib/db';
import { EncryptionService } from '../security/EncryptionService';

export interface SaveGenerationOptions {
  userId: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  promptTokens: number;
  completionTokens: number;
  creditsConsumed: number;
  executionTime: number; // in ms
  status?: string;
}

export class AiGenerationService {
  static calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const modelLower = model.toLowerCase();
    let inputCostPerMillion = 0.075; // default gemini flash
    let outputCostPerMillion = 0.30;

    if (modelLower.includes('gpt-4o-mini')) {
      inputCostPerMillion = 0.15;
      outputCostPerMillion = 0.60;
    } else if (modelLower.includes('claude-3-5-sonnet')) {
      inputCostPerMillion = 3.0;
      outputCostPerMillion = 15.0;
    } else if (modelLower.includes('gpt-4')) {
      inputCostPerMillion = 5.0;
      outputCostPerMillion = 15.0;
    }

    const inputCost = (promptTokens / 1000000) * inputCostPerMillion;
    const outputCost = (completionTokens / 1000000) * outputCostPerMillion;

    return Number((inputCost + outputCost).toFixed(6));
  }

  static calculateCredits(model: string, promptTokens: number, completionTokens: number): number {
    const totalTokens = promptTokens + completionTokens;
    const modelLower = model.toLowerCase();

    let rate = 1; // 1 credit per 1000 tokens
    if (modelLower.includes('claude-3-5-sonnet') || modelLower.includes('gpt-4')) {
      rate = 20; // 20 credits per 1000 tokens
    }

    return Math.max(1, Math.ceil((totalTokens / 1000) * rate));
  }

  static async saveGeneration(options: SaveGenerationOptions) {
    const encryptedPrompt = EncryptionService.encrypt(options.prompt);
    const encryptedResponse = EncryptionService.encrypt(options.response);
    const totalTokens = options.promptTokens + options.completionTokens;
    const providerCost = this.calculateCost(options.model, options.promptTokens, options.completionTokens);

    return db.aiGeneration.create({
      data: {
        userId: options.userId,
        prompt: encryptedPrompt,
        response: encryptedResponse,
        modelUsed: options.model,
        tokenCount: totalTokens,
        generationType: 'TEXT',
        status: options.status || 'SUCCESS',
        provider: options.provider.toUpperCase(),
        promptTokens: options.promptTokens,
        completionTokens: options.completionTokens,
        totalTokens,
        providerCost,
        creditsConsumed: options.creditsConsumed,
        executionTime: options.executionTime,
      },
    });
  }

  static async getGenerationHistory(userId: string, limit = 50) {
    const list = await db.aiGeneration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return list.map((item) => ({
      ...item,
      prompt: EncryptionService.decrypt(item.prompt),
      response: EncryptionService.decrypt(item.response),
    }));
  }

  static async getUserUsage(userId: string) {
    const stats = await db.aiGeneration.aggregate({
      where: { userId },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        providerCost: true,
        creditsConsumed: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalGenerationsCount: stats._count.id,
      promptTokensUsed: stats._sum.promptTokens || 0,
      completionTokensUsed: stats._sum.completionTokens || 0,
      totalTokensUsed: stats._sum.totalTokens || 0,
      totalProviderCostUSD: stats._sum.providerCost || 0.0,
      totalCreditsConsumed: stats._sum.creditsConsumed || 0,
    };
  }
}
