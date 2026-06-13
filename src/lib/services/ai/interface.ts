export interface IAIService {
  generateText(options: { systemPrompt?: string; prompt: string; temperature?: number }): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
}
