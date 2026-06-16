export interface IAIService {
  generateContent(prompt: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string>;
  summarizeContent(text: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string>;
  analyzeContent(text: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string>;
  createRoast(topic: string, options?: { systemPrompt?: string; temperature?: number }): Promise<string>;
  createBrew(signals: string | string[], options?: { systemPrompt?: string; temperature?: number }): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
  generateText(options: { systemPrompt?: string; prompt: string; temperature?: number }): Promise<string>;
}
