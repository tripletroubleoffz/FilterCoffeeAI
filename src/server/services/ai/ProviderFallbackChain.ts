import { IAIService } from '@/lib/services/ai/interface';
import { ProviderRouter } from './ProviderRouter';
import { ProviderHealthService } from './ProviderHealthService';

export class ProviderFallbackChain implements IAIService {
  private async executeWithFallback<T>(
    operation: (provider: IAIService, providerName: string) => Promise<T>
  ): Promise<T> {
    const chain = ProviderRouter.getActiveProviderChain();
    let lastError: unknown = null;

    for (const providerName of chain) {
      try {
        const provider = ProviderRouter.getProviderInstance(providerName);
        const result = await operation(provider, providerName);

        ProviderHealthService.reportSuccess(providerName);
        return result;
      } catch (err: unknown) {
        console.error(`[AI Failover] Provider ${providerName} query failed:`, (err as Error).message || err);
        ProviderHealthService.reportFailure(providerName);
        lastError = err;
      }
    }

    try {
      console.log('[AI Failover] Fallback chain exhausted. Executing Mock client fallback.');
      const mockProvider = ProviderRouter.getProviderInstance('MOCK');
      return await operation(mockProvider, 'MOCK');
    } catch (mockErr: unknown) {
      console.error('[AI Failover] Mock fallback client failed:', (mockErr as Error).message);
    }

    throw lastError || new Error('All AI providers in fallback chain failed.');
  }

  async generateContent(prompt: string, options?: Record<string, unknown>): Promise<string> {
    return this.executeWithFallback((provider) => provider.generateContent(prompt, options));
  }

  async summarizeContent(text: string, options?: Record<string, unknown>): Promise<string> {
    return this.executeWithFallback((provider) => provider.summarizeContent(text, options));
  }

  async analyzeContent(text: string, options?: Record<string, unknown>): Promise<string> {
    return this.executeWithFallback((provider) => provider.analyzeContent(text, options));
  }

  async createRoast(topic: string, options?: Record<string, unknown>): Promise<string> {
    return this.executeWithFallback((provider) => provider.createRoast(topic, options));
  }

  async createBrew(signals: string | string[], options?: Record<string, unknown>): Promise<string> {
    return this.executeWithFallback((provider) => provider.createBrew(signals, options));
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.executeWithFallback((provider) => provider.generateEmbedding(text));
  }

  async generateText(options: { systemPrompt?: string; prompt: string; temperature?: number }): Promise<string> {
    return this.executeWithFallback((provider) => provider.generateText(options));
  }
}
