import { IAIService } from './interface';

export class MockAIService implements IAIService {
  async generateText(options: { systemPrompt?: string; prompt: string; temperature?: number }): Promise<string> {
    const prompt = options.prompt.toLowerCase();
    
    if (prompt.includes('digest') || prompt.includes('briefing')) {
      return `### What Changed
- **OpenAI releases GPT-5 Preview**: Initial benchmarks indicate significant gains in logic, tool usage, and visual understanding, moving closer to autonomous agent orchestration.
- **Federal Reserve Maintains Current Rates**: Economic reports suggest a cautious approach towards interest rate adjustments amid persistent core service inflation.
- **Hiring Surge in Rust & Go Ecosystems**: Remote jobs for backend infrastructure and systems design saw a 14% quarter-on-quarter increase as teams focus on efficiency and runtime performance optimization.

### Why This Matters
- **AI Strategic Pivot**: Developers and startup founders should prioritize agent-native UI frameworks; prompt engineering is transitioning entirely into agent design.
- **Capital Allocation Constraints**: Lower cost of capital is delayed, meaning early-stage startups must maintain strict runway control and lean teams.
- **Skill Shift**: Traditional frontend engineers are upskilling in systems programming to optimize low-latency web interfaces and server-side runtimes.

### Sources
- [OpenAI Developer Blog](https://openai.com/blog)
- [Federal Reserve Press Release](https://federalreserve.gov)
- [GitHub Tech Trends 2026](https://github.com/trends)`;
    }
    
    if (prompt.includes('career') || prompt.includes('skill')) {
      return `### Career & Skill Signal
- **Growing Skill**: **Rust Programming** (+28% Job Postings). Primarily driven by low-latency serverless and web assembly microservices.
- **Declining Skill**: **Basic CSS/Bootstrap** (-18% Demand). Fully replaced by atomic Tailwind utilities and AI-assisted design tool integrations.
- **Emerging Role**: **AI Orchestration Engineer**. Specializing in multi-agent routing, vector embedding pipelines, and state machines.
- **Salary Index**: Median base salary for AI Orchestration Engineers reaches **$175,000** globally (+12% YoY).`;
    }
    
    if (prompt.includes('finance') || prompt.includes('market')) {
      return `### Finance & Market Signal
- **Macro Trend**: High-interest rate persistence is driving early-stage companies to adopt self-hostable tools (e.g. Supabase, Docker, Redis) over expensive managed enterprise services to optimize OPEX.
- **Funding Round**: **Qdrant** raises $45M Series B to expand cluster automation and real-time semantic searching for decentralized agent networks.
- **Earnings Call**: Cloud providers report a 32% year-on-year growth in AI compute API revenue, suggesting enterprise adoption of external API gateways remains strong.`;
    }

    return `### FilterCoffee.ai Intelligence Signal
- **Signal Summary**: Professional insights generated successfully.
- **Strategic Impact**: Professional teams are shifting resources toward custom, context-enriched models using vector embedding pipelines for high-accuracy operations.
- **Recommendation**: Audit dependency configurations and minimize external vendor APIs where possible.`;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const vector = new Array(1536).fill(0);
    const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words = cleanText.split(/\s+/).filter(w => w.length > 2);

    if (words.length === 0) {
      vector[0] = 1.0;
      return vector;
    }

    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % 1536;
      vector[index] += 1;
    }

    const sumOfSquares = vector.reduce((sum, val) => sum + val * val, 0);
    const magnitude = Math.sqrt(sumOfSquares);
    if (magnitude > 0) {
      for (let i = 0; i < 1536; i++) {
        vector[i] /= magnitude;
      }
    } else {
      vector[0] = 1.0;
    }

    return vector;
  }
}
