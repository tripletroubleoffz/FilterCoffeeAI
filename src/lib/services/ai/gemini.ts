import { IAIService } from './interface';

export class GeminiService implements IAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'mock-gemini-key') {
      throw new Error('GEMINI_API_KEY must be configured to use GeminiService');
    }
  }

  async generateContent(prompt: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string> {
    return this.generateText({
      prompt,
      systemPrompt: options?.systemPrompt || 'You are a content writer.',
      temperature: options?.temperature,
    });
  }

  async summarizeContent(text: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string> {
    return this.generateText({
      prompt: `Please provide a clean, executive summary of the following text:\n\n${text}`,
      systemPrompt: options?.systemPrompt || 'You are a professional content summarizer.',
      temperature: options?.temperature,
    });
  }

  async analyzeContent(text: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string> {
    return this.generateText({
      prompt: `Please provide a detailed strategic analysis of the following text:\n\n${text}`,
      systemPrompt: options?.systemPrompt || 'You are a staff analyst providing deep insights.',
      temperature: options?.temperature,
    });
  }

  async createRoast(topic: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string> {
    return this.generateText({
      prompt: `Please provide a highly critical, witty, and factual roast of the following topic/venture:\n\n${topic}`,
      systemPrompt: options?.systemPrompt || 'You are a critical venture capitalist who roasts project ideas.',
      temperature: options?.temperature,
    });
  }

  async createBrew(signals: string | string[], options?: { systemPrompt?: string; temperature?: number }): Promise<string> {
    const signalsText = Array.isArray(signals) ? signals.join('\n\n') : signals;
    return this.generateText({
      prompt: `Compile a daily intelligence briefing from the following signals:\n\n${signalsText}`,
      systemPrompt: options?.systemPrompt || 'You compile morning briefs for professionals. Calm, factual, professional.',
      temperature: options?.temperature,
    });
  }

  async generateText(options: { systemPrompt?: string; prompt: string; temperature?: number }): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${options.systemPrompt || ''}\n\n${options.prompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: options.temperature ?? 0.2,
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API responded with code: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response format from Gemini API');
    }
    return data.candidates[0].content.parts[0].text.trim();
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: {
              parts: [{ text }]
            }
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Embedding API responded with code: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      if (!data.embedding || !data.embedding.values) {
        throw new Error('Invalid response payload from Gemini Embedding API');
      }

      const values: number[] = data.embedding.values;
      if (values.length === 768) {
        return [...values, ...values];
      }
      return values;
    } catch (e: any) {
      console.error('Gemini embedding generation failed:', e);
      throw e;
    }
  }
}
