import { IAIService } from './interface';
import { MockAIService } from './mock';

export class AnthropicService implements IAIService {
  private apiKey: string;
  private mockFallback: MockAIService;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'mock-anthropic-key') {
      throw new Error('ANTHROPIC_API_KEY must be configured to use AnthropicService');
    }
    this.mockFallback = new MockAIService();
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
    return data.content[0].text.trim();
  }

  // Anthropic does not offer vector embeddings, delegate to mock L2 normalized generator
  async generateEmbedding(text: string): Promise<number[]> {
    return this.mockFallback.generateEmbedding(text);
  }
}
