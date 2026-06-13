import { IAIService } from './interface';
import { MockAIService } from './mock';
import { OpenAIService } from './openai';
import { AnthropicService } from './anthropic';
import { GeminiService } from './gemini';

const aiProvider = process.env.AI_PROVIDER || 'mock';

let aiService: IAIService;

if (aiProvider === 'openai' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-openai-key') {
  try {
    aiService = new OpenAIService();
  } catch (e) {
    console.error('Failed to initialize OpenAI service, falling back to mock:', e);
    aiService = new MockAIService();
  }
} else if (aiProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'mock-anthropic-key') {
  try {
    aiService = new AnthropicService();
  } catch (e) {
    console.error('Failed to initialize Anthropic service, falling back to mock:', e);
    aiService = new MockAIService();
  }
} else if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-gemini-key') {
  try {
    aiService = new GeminiService();
  } catch (e) {
    console.error('Failed to initialize Gemini service, falling back to mock:', e);
    aiService = new MockAIService();
  }
} else {
  aiService = new MockAIService();
}

export { aiService };
export type { IAIService };
