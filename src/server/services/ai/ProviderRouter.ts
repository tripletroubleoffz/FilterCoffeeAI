import { GeminiService } from '@/lib/services/ai/gemini';
import { OpenAIService } from '@/lib/services/ai/openai';
import { AnthropicService } from '@/lib/services/ai/anthropic';
import { MockAiService } from '@/lib/services/ai/mock';
import { IAIService } from '@/lib/services/ai/interface';
import { ProviderHealthService } from './ProviderHealthService';

export class ProviderRouter {
  static getProviderInstance(provider: string): IAIService {
    const provKey = provider.toUpperCase();

    if (provKey === 'GEMINI') {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock-gemini-key') {
        throw new Error('GEMINI_API_KEY is not configured.');
      }
      return new GeminiService();
    }

    if (provKey === 'OPENAI') {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-openai-key') {
        throw new Error('OPENAI_API_KEY is not configured.');
      }
      return new OpenAIService();
    }

    if (provKey === 'ANTHROPIC') {
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'mock-anthropic-key') {
        throw new Error('ANTHROPIC_API_KEY is not configured.');
      }
      return new AnthropicService();
    }

    if (provKey === 'MOCK') {
      return new MockAiService();
    }

    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  static getActiveProviderChain(): string[] {
    const defaultChain = ['GEMINI', 'OPENAI', 'ANTHROPIC'];

    const chain = defaultChain.filter((provider) => {
      const isHealthy = ProviderHealthService.isHealthy(provider);
      let isConfigured = false;

      if (provider === 'GEMINI') {
        isConfigured = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-gemini-key';
      } else if (provider === 'OPENAI') {
        isConfigured = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-openai-key';
      } else if (provider === 'ANTHROPIC') {
        isConfigured = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'mock-anthropic-key';
      }

      return isHealthy && isConfigured;
    });

    // Fallback to MOCK if nothing else is configured
    if (chain.length === 0) {
      return ['MOCK'];
    }

    return chain;
  }
}
