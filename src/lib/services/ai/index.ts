import { IAIService } from './interface';
import { MockAiService } from './mock';
import { ProviderFallbackChain } from '@/server/services/ai/ProviderFallbackChain';

let instance: IAIService | null = null;

const aiService = new Proxy({} as IAIService, {
  get(target, prop) {
    if (!instance) {
      if (process.env.AI_PROVIDER === 'mock') {
        instance = new MockAiService();
      } else {
        instance = new ProviderFallbackChain();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { aiService };
export type { IAIService };


