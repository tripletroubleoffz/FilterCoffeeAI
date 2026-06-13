import { IAIService } from './interface';
import { GeminiService } from './gemini';

let instance: IAIService | null = null;

const aiService = new Proxy({} as IAIService, {
  get(target, prop) {
    if (!instance) {
      instance = new GeminiService();
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { aiService };
export type { IAIService };
