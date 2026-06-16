import { IAIService } from './interface';

export class AnthropicService implements IAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'mock-anthropic-key') {
      throw new Error('ANTHROPIC_API_KEY must be configured to use AnthropicService');
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: options.prompt }],
        temperature: options.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API responded with code: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid response payload from Anthropic API');
    }
    return data.content[0].text.trim();
  }

  async generateEmbedding(text: string): Promise<number[]> {
    throw new Error('Anthropic does not have an embedding model integrated. Please use Gemini for embeddings.');
  }
}
