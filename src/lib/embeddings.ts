import { aiService } from './services/ai';

export async function getEmbedding(text: string): Promise<number[]> {
  return aiService.generateEmbedding(text);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}
