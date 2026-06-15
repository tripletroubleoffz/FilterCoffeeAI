import { IAIService } from './interface';
import { GeminiService } from './gemini';
import { MockAiService } from './mock';

let instance: IAIService | null = null;

const aiService = new Proxy({} as IAIService, {
  get(target, prop) {
    if (!instance) {
      if (process.env.AI_PROVIDER === 'mock' || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-gemini-key') {
        instance = new MockAiService();
      } else {
        instance = new GeminiService();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { aiService };
export type { IAIService };

