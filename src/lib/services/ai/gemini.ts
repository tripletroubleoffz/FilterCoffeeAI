import { IAIService } from './interface';

export class GeminiService implements IAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'mock-gemini-key') {
      throw new Error('GEMINI_API_KEY must be configured to use GeminiService');
    }
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
    return data.candidates[0].content.parts[0].text.trim();
  }

  // Call Gemini's text-embedding-004 model directly, stretching the output to 1536 dimensions
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
      // If the model returns 768 dimensions, duplicate to match 1536 size expected by the collection schema
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
