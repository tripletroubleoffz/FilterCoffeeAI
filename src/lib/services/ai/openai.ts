import { IAIService } from './interface';

export class OpenAIService implements IAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'mock-openai-key') {
      throw new Error('OPENAI_API_KEY must be configured to use OpenAIService');
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: options.prompt }
        ],
        temperature: options.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API responded with code: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response payload from OpenAI API');
    }
    return data.choices[0].message.content.trim();
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Embeddings API responded with code: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }
}
