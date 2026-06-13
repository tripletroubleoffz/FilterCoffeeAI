import { aiService } from './services/ai';

interface GenerateTextOptions {
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
}

export async function generateText({
  systemPrompt = 'You are a professional intelligence analyst.',
  prompt,
  temperature = 0.2,
}: GenerateTextOptions): Promise<string> {
  return aiService.generateText({
    systemPrompt,
    prompt,
    temperature,
  });
}

