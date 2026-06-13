import { IAIService } from './interface';

export class OpenAIService implements IAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'mock-openai-key') {
      throw new Error('OPENAI_API_KEY must be configured to use OpenAIService');
    }
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
