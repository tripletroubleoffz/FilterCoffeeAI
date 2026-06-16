import { IAIService } from './interface';

export class MockAiService implements IAIService {
  async generateContent(prompt: string, options?: any): Promise<string> {
    return `[Mock AI Content] Generated content for: ${prompt}`;
  }

  async summarizeContent(text: string, options?: any): Promise<string> {
    return `[Mock AI Summary] Executive summary of: ${text.slice(0, 100)}...`;
  }

  async analyzeContent(text: string, options?: any): Promise<string> {
    return `[Mock AI Analysis] In-depth analysis of developments in: ${text.slice(0, 100)}...`;
  }

  async createRoast(topic: string, options?: any): Promise<string> {
    return `[Mock AI Roast] Highly critical analysis of ${topic} and market viability.`;
  }

  async createBrew(signals: string | string[], options?: any): Promise<string> {
    const signalCount = Array.isArray(signals) ? signals.length : 1;
    return `[Mock AI Brew] Compiled daily intelligence feed from ${signalCount} signals.`;
  }

  async generateText(options: { systemPrompt?: string; prompt: string; temperature?: number }): Promise<string> {
    const isJson = 
      options.prompt.toLowerCase().includes('json') || 
      options.systemPrompt?.toLowerCase().includes('json') || 
      options.prompt.toLowerCase().includes('strictly a json object') || 
      options.systemPrompt?.toLowerCase().includes('strictly as a json');

    if (isJson) {
      // 1. AI Radar query detection
      if (
        options.prompt.toLowerCase().includes('radar') || 
        options.systemPrompt?.toLowerCase().includes('radar') || 
        options.prompt.toLowerCase().includes('announces: a model release')
      ) {
        return JSON.stringify({
          category: "Model Release",
          title: "Gemini 2.5 Flash Preview Released",
          summary: "Google announced the preview of Gemini 2.5 Flash with enhanced low-latency coding capabilities.",
          impact: "Reduces API costs and increases throughput for developer tooling.",
          affectedUsers: "Developers, Tech Leads",
          recommendedAction: "Test the preview model in staging environments.",
          importanceScore: 88
        });
      }

      // 2. Daily Brew / briefing query detection
      if (
        options.prompt.toLowerCase().includes('briefing') || 
        options.prompt.toLowerCase().includes('brew') || 
        options.prompt.toLowerCase().includes('roast') || 
        options.prompt.toLowerCase().includes('blend')
      ) {
        return JSON.stringify({
          headline: "Fast-Paced Innovation in LLMs and Infrastructure",
          keyDevelopments: [
            "Open-source releases continue to match proprietary capabilities.",
            "Local emulation technologies receive significant performance optimizations."
          ],
          whatChanged: "Emulators and local runtime engines are incorporating advanced performance hot-fixes on-the-fly, transforming how legacy codebases are virtualized.",
          whyItMatters: "Allows legacy enterprises to maintain compatibility while scaling up server performance without immediate rewrite costs.",
          recommendedActions: [
            "Assess virtualization overhead in cloud workloads.",
            "Integrate low-latency runtime optimizations."
          ],
          priorityLevel: "HIGH"
        });
      }

      // 3. Default Content Enrichment JSON
      return JSON.stringify({
        aiSummary: "The engineering team discovered performance bottlenecks in emulation runtime and resolved them through immediate localized updates.",
        keyTakeaways: [
          "Micro-optimizations in emulators yield substantial overall speedups.",
          "Factual analysis of compiler outputs guides optimization paths.",
          "Code virtualization benefits from runtime code patching."
        ],
        impactAnalysis: "Reduces execution latency for virtualized instructions on cloud hardware.",
        audiences: ["Engineer", "Founder", "PM"],
        importanceScore: 78,
        sentiment: "POSITIVE",
        trendDirection: "RISING"
      });
    }

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
    const embedding = new Array(1536).fill(0);
    const lowercase = text.toLowerCase();
    for (let i = 0; i < lowercase.length; i++) {
      const code = lowercase.charCodeAt(i);
      embedding[code % 1536] += 1;
    }
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
