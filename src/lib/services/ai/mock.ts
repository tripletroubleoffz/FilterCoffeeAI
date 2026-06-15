import { IAIService } from './interface';

export class MockAiService implements IAIService {
  async generateText(options: { systemPrompt?: string; prompt: string; temperature?: number }): Promise<string> {
    return `### What Changed
- **FilterCoffee AI Local Simulation Activated**: All service dependencies (AI, Vector DB, Payments, Caching, and Mail) have been successfully redirected to offline mock handlers.
- **SQLite Database Integration Enabled**: Local relational schema sync is now executing via file-based SQLite database.

### Why This Matters
- **Instant Developer Bootstrapping**: Dev server runs with zero external keys, allowing fast layout testing, testing routing flow, and schema additions.
- **Reliable Offline Diagnostics**: Ability to verify tRPC endpoints and database operations completely sandbox-independent.

### Sources
- [FilterCoffee Developer Docs](https://filtercoffee.ai/docs/local-simulation)`;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Generate deterministic 1536-dimensional mock embedding based on character counts/hash of text
    const embedding = new Array(1536).fill(0);
    const lowercase = text.toLowerCase();
    for (let i = 0; i < lowercase.length; i++) {
      const code = lowercase.charCodeAt(i);
      embedding[code % 1536] += 1;
    }
    // L2 normalize
    let sumSq = 0;
    for (let i = 0; i < 1536; i++) {
      sumSq += embedding[i] * embedding[i];
    }
    const magnitude = Math.sqrt(sumSq) || 1;
    for (let i = 0; i < 1536; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
    return embedding;
  }
}
