import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const signalsRouter = router({
  // Get premium ingested signals filtered by category
  getSignals: protectedProcedure
    .input(
      z.object({
        category: z.enum(['AI', 'Finance', 'Career', 'General']).optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause = input.category ? { category: input.category } : {};
      
      let signals = await ctx.db.signal.findMany({
        where: whereClause,
        orderBy: { publishedAt: 'desc' },
        take: input.limit,
        include: { source: true },
      });

      // Auto-seed signals if empty
      if (signals.length === 0) {
        console.log('Seeding mock signals into database...');
        await seedDefaultData(ctx.db);
        
        signals = await ctx.db.signal.findMany({
          where: whereClause,
          orderBy: { publishedAt: 'desc' },
          take: input.limit,
          include: { source: true },
        });
      }

      return signals;
    }),

  // Get user briefings/digests list
  getBriefings: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.digest.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Fetch career, finance, and AI industry trends
  getTrends: protectedProcedure.query(async ({ ctx }) => {
    let career = await ctx.db.careerTrend.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    let finance = await ctx.db.financeTrend.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    let ai = await ctx.db.aiTrend.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });

    if (career.length === 0 || finance.length === 0 || ai.length === 0) {
      await seedDefaultTrends(ctx.db);
      career = await ctx.db.careerTrend.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
      finance = await ctx.db.financeTrend.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
      ai = await ctx.db.aiTrend.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    }

    return { career, finance, ai };
  }),

  // Bookmark / Unbookmark a signal
  toggleBookmark: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.bookmark.findFirst({
        where: {
          userId: ctx.user.id,
          url: input.url,
        },
      });

      if (existing) {
        await ctx.db.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false };
      } else {
        await ctx.db.bookmark.create({
          data: {
            userId: ctx.user.id,
            title: input.title,
            url: input.url,
          },
        });
        return { bookmarked: true };
      }
    }),

  // Get user's active bookmarks
  getBookmarks: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.bookmark.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Advanced Coffee Search endpoint
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        category: z.enum(['ALL', 'SIGNALS', 'COMPANIES', 'MODELS', 'RESEARCH', 'FUNDING', 'CAREER', 'MARKET']).default('ALL'),
      })
    )
    .query(async ({ ctx, input }) => {
      const query = input.query.trim();
      if (!query) {
        return { signals: [], models: [], companies: [], career: [], funding: [], market: [] };
      }

      let signals: any[] = [];
      let models: any[] = [];
      let companies: any[] = [];
      let career: any[] = [];
      let funding: any[] = [];
      let market: any[] = [];

      // 1. Semantic search for signals using embeddings & Qdrant/Mock Vector DB
      try {
        const { getEmbedding } = await import('@/lib/embeddings');
        const { searchSimilarSignals } = await import('@/lib/qdrant');
        
        const queryVector = await getEmbedding(query);
        const vectorResults = await searchSimilarSignals(queryVector, 15, 0.1);
        const signalIds = vectorResults.map((r) => r.id);

        if (signalIds.length > 0) {
          const matchedSignals = await ctx.db.signal.findMany({
            where: { id: { in: signalIds } },
            include: { source: true },
          });

          signals = vectorResults
            .map((vRes) => {
              const sig = matchedSignals.find((s) => s.id === vRes.id);
              if (!sig) return null;
              return {
                ...sig,
                similarity: vRes.score,
              };
            })
            .filter((s): s is any => s !== null);
        }
      } catch (error) {
        console.error('Semantic search error, falling back to database keyword search:', error);
      }

      // Fallback/Union with database keyword search on signals
      if (signals.length === 0) {
        signals = await ctx.db.signal.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: { source: true },
          take: 15,
        });
      }

      // 2. Query models (AiTrend with type === 'MODEL')
      models = await ctx.db.aiTrend.findMany({
        where: {
          type: 'MODEL',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { importance: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });

      // 3. Query companies (AiTrend with type === 'COMPANY')
      companies = await ctx.db.aiTrend.findMany({
        where: {
          type: 'COMPANY',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { importance: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });

      // 4. Query career trends (CareerTrend)
      career = await ctx.db.careerTrend.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { value: { contains: query, mode: 'insensitive' } },
            { type: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });

      // 5. Query funding/market trends (FinanceTrend)
      const financeMatches = await ctx.db.financeTrend.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { ticker: { contains: query, mode: 'insensitive' } },
            { details: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 15,
      });

      funding = financeMatches.filter(
        (f) =>
          f.name.toLowerCase().includes('raise') ||
          f.name.toLowerCase().includes('round') ||
          f.name.toLowerCase().includes('series') ||
          (f.details && (f.details.toLowerCase().includes('fund') || f.details.toLowerCase().includes('round') || f.details.toLowerCase().includes('valuation')))
      );

      market = financeMatches.filter(
        (f) =>
          !f.name.toLowerCase().includes('raise') &&
          !f.name.toLowerCase().includes('round') &&
          !(f.details && (f.details.toLowerCase().includes('fund') || f.details.toLowerCase().includes('round')))
      );

      // Filter by category
      if (input.category === 'SIGNALS') {
        return { signals, models: [], companies: [], career: [], funding: [], market: [] };
      }
      if (input.category === 'MODELS') {
        return { signals: [], models, companies: [], career: [], funding: [], market: [] };
      }
      if (input.category === 'COMPANIES') {
        return { signals: [], models: [], companies, career: [], funding: [], market: [] };
      }
      if (input.category === 'CAREER') {
        return { signals: [], models: [], companies: [], career, funding: [], market: [] };
      }
      if (input.category === 'FUNDING') {
        return { signals: [], models: [], companies: [], career: [], funding, market: [] };
      }
      if (input.category === 'MARKET') {
        return { signals: [], models: [], companies: [], career: [], funding: [], market };
      }

      return { signals, models, companies, career, funding, market };
    }),
});

// Seed defaults
async function seedDefaultData(db: any) {
  // Clear first to avoid duplicates
  await db.signal.deleteMany({});
  await db.source.deleteMany({});

  const sources = [
    { name: 'OpenAI Developer Blog', url: 'https://openai.com/blog/rss.xml', type: 'AI' },
    { name: 'Anthropic News', url: 'https://anthropic.com/news/rss.xml', type: 'AI' },
    { name: 'Google DeepMind Blog', url: 'https://deepmind.google/blog/rss.xml', type: 'AI' },
    { name: 'Federal Reserve Announcements', url: 'https://federalreserve.gov/rss/press.xml', type: 'Finance' },
    { name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/', type: 'Finance' },
    { name: 'Hiring Momentum Reports', url: 'https://hiringtrends.com/feed/', type: 'Career' },
    { name: 'ArXiv Artificial Intelligence', url: 'https://arxiv.org/rss/cs.AI', type: 'General' },
  ];

  const sourceMap: Record<string, string> = {};

  for (const src of sources) {
    const createdSource = await db.source.upsert({
      where: { url: src.url },
      update: {},
      create: { name: src.name, url: src.url, type: src.type },
    });
    sourceMap[src.type] = createdSource.id;
  }

  // Rich list of signals
  const signalsToSeed = [
    // AI News
    {
      title: 'OpenAI Launches GPT-5 Preview with Native Multi-Agent Orchestration',
      category: 'AI',
      url: 'https://openai.com/blog/gpt-5-preview-agent-orchestration',
      publishedAt: new Date(),
      score: 9.8,
      content: JSON.stringify({
        body: 'OpenAI has released GPT-5 Preview to developers. The model features native agent coordination, allowing developers to define complex sub-agent hierarchies directly through the API. Performance on reasoning and planning benchmarks shows a 35% improvement over GPT-4o.',
        tldr: 'GPT-5 Preview brings native multi-agent orchestration directly to the OpenAI API, boosting complex planning scores by 35%.',
        whyItMatters: 'Developers can now bypass third-party orchestration libraries (like LangChain or AutoGen) and deploy multi-agent state machines natively, improving execution speed and cost.',
        careerImpact: 'Engineers who specialize in declarative agent YAML design and multi-agent routing will see a surge in contract and hiring rates.',
        businessImpact: 'B2B companies can build more reliable workflows (e.g. customer support routing, document auditing) with a fraction of the custom glue code.',
        confidenceScore: 95,
        credibilityScore: 98
      })
    },
    {
      title: 'Anthropic Releases Claude 3.5 Opus with Deep Context Graph Routing',
      category: 'AI',
      url: 'https://anthropic.com/news/claude-3-5-opus',
      publishedAt: new Date(Date.now() - 3600000),
      score: 9.5,
      content: JSON.stringify({
        body: 'Anthropic has announced Claude 3.5 Opus. The highlight of this release is Graph Routing, which allows the model to map dependencies in long context window inputs, leading to a massive drop in hallucination rates on massive source documentation repositories.',
        tldr: 'Claude 3.5 Opus is now live, featuring a Graph Routing engine to process long contexts with near-zero hallucinations.',
        whyItMatters: 'Solves the primary obstacle to deploying LLMs over massive enterprise codebases and regulatory documents—hallucinating in the middle of long contexts.',
        careerImpact: 'Architects working on Retrieval-Augmented Generation (RAG) must re-evaluate their chunking strategies to leverage Opus\'s graph mapping.',
        businessImpact: 'Unlocks automated legal auditing and legacy codebase refactoring, reducing time-to-production for enterprise AI tasks.',
        confidenceScore: 94,
        credibilityScore: 97
      })
    },
    // Funding / Finance
    {
      title: 'Qdrant Raises $45M Series B for Real-Time Vector Database Sharding',
      category: 'Finance',
      url: 'https://techcrunch.com/qdrant-series-b-45m',
      publishedAt: new Date(Date.now() - 7200000),
      score: 8.9,
      content: JSON.stringify({
        body: 'Vector database startup Qdrant announced a $45M Series B funding round led by Benchmark. The capital will be used to build self-healing partitioned vector architectures capable of handling real-time indexing for billions of streaming telemetry events.',
        tldr: 'Qdrant raises $45M in a Series B round led by Benchmark to expand its distributed vector sharding technology.',
        whyItMatters: 'Vector databases are maturing into core database infrastructure, similar to how Elasticsearch matured for search. Benchmark\'s backing signals high confidence in independent vector databases over relational add-ons.',
        careerImpact: 'Skills in vector DB cluster admin (Qdrant, pgvector scaling) are entering the standard DevOps checklist.',
        businessImpact: 'Lower search latency for real-time recommendation engines and real-time agent memory clusters.',
        confidenceScore: 92,
        credibilityScore: 95
      })
    },
    {
      title: 'Physical Intelligence Closes $400M Seed Round to Build General Robot Brains',
      category: 'Finance',
      url: 'https://techcrunch.com/physical-intelligence-400m-seed',
      publishedAt: new Date(Date.now() - 14400000),
      score: 9.2,
      content: JSON.stringify({
        body: 'Physical Intelligence (Pi), a startup focused on general-purpose software for robots, has raised $400M at a $2.4B valuation from Bezos Expeditions, OpenAI, and Thrive Capital. Pi aims to train large-scale foundation models for physical movement.',
        tldr: 'Robot brain startup Physical Intelligence raises $400M seed round at $2.4B valuation to build universal control models.',
        whyItMatters: 'Venture capital is shifting from digital-only software agents into physical-digital robotics, anticipating a breakthrough in general hardware automation.',
        careerImpact: 'Opportunities in reinforcement learning, ROS (Robot Operating System), and embedded machine learning are surging.',
        businessImpact: 'Accelerates warehouse and logistics automation by enabling off-the-shelf arm manipulators to perform diverse sorting and packaging tasks.',
        confidenceScore: 96,
        credibilityScore: 94
      })
    },
    // Career News
    {
      title: 'AI Ingestion and Caching Talents Outpace Standard React Roles by 35% in Salary',
      category: 'Career',
      url: 'https://hiringtrends.com/roles/ai-ingestion-salaries',
      publishedAt: new Date(Date.now() - 28800000),
      score: 8.5,
      content: JSON.stringify({
        body: 'A recruiting report from LinkedIn shows a 35% salary premium for web engineers who demonstrate skills in semantic caching, vector sharding, and prompt pipeline design over traditional React frontend developers.',
        tldr: 'AI integration skills command a 35% salary premium over traditional frontend roles, indicating a shift from view-layer to intelligent middleware coding.',
        whyItMatters: 'The market is saturated with standard UI developers. High-value engineering is moving into telemetry pipelines, semantic caches, and agent state machines.',
        careerImpact: 'Frontend developers should immediately upskill in Next.js backend routing, Redis caching, and vector querying.',
        businessImpact: 'Companies must budget more for engineering, but will build significantly faster and cheaper software overall using LLM orchestration.',
        confidenceScore: 90,
        credibilityScore: 91
      })
    },
    // Research / General
    {
      title: 'DeepMind Introduces AlphaFold 3: Modeling Protein-DNA Interactions',
      category: 'General',
      url: 'https://deepmind.google/alphafold-3-protein-dna',
      publishedAt: new Date(Date.now() - 43200000),
      score: 9.7,
      content: JSON.stringify({
        body: 'Google DeepMind has unveiled AlphaFold 3, which can predict the structure and interactions of all life\'s molecules, including proteins, DNA, RNA, and chemical compounds. This represents a major leap in molecular biology research.',
        tldr: 'Google DeepMind launches AlphaFold 3, expanding structural predictions from proteins to DNA, RNA, and molecular drugs.',
        whyItMatters: 'Accelerates drug discovery and therapeutic research by letting scientists simulate how candidate compounds bind with DNA/RNA in silico before clinical lab trials.',
        careerImpact: 'Biotech and bioinformatics fields are seeing massive job expansion for software engineers who understand molecular biology.',
        businessImpact: 'Decreases R&D costs for pharmaceutical companies, shortening the pre-clinical validation window from years to weeks.',
        confidenceScore: 98,
        credibilityScore: 99
      })
    }
  ];

  for (const sig of signalsToSeed) {
    await db.signal.create({
      data: {
        sourceId: sourceMap[sig.category] || null,
        title: sig.title,
        content: sig.content,
        url: sig.url,
        publishedAt: sig.publishedAt,
        category: sig.category,
        score: sig.score
      }
    });
  }
}

async function seedDefaultTrends(db: any) {
  // Clear first
  await db.careerTrend.deleteMany({});
  await db.financeTrend.deleteMany({});
  await db.aiTrend.deleteMany({});

  // 1. Career Trends
  const careerData = [
    { type: 'SKILL', name: 'Rust', value: 'Low-latency serverless and web assembly microservices.', change: 28.4, period: 'WEEKLY' },
    { type: 'SKILL', name: 'AI Orchestration (LangGraph, YAML)', value: 'Constructing multi-agent state machines.', change: 42.6, period: 'WEEKLY' },
    { type: 'SKILL', name: 'Vector Sharding & pgvector', value: 'Scaling semantic databases for real-time telemetry.', change: 35.0, period: 'MONTHLY' },
    { type: 'SKILL', name: 'Tailwind CSS v4', value: 'Atomic layout engine optimization.', change: 65.0, period: 'MONTHLY' },
    { type: 'ROLE', name: 'AI Orchestration Engineer', value: '$175,000 Median Base', change: 12.5, period: 'YEARLY' },
    { type: 'ROLE', name: 'GPU Cluster Architect', value: '$240,000 Median Base', change: 18.2, period: 'YEARLY' },
  ];

  for (const tr of careerData) {
    await db.careerTrend.create({ data: tr });
  }

  // 2. Finance Trends (AI Stock Indicators & Tech Indices)
  const financeData = [
    { name: 'NVIDIA (NVDA)', value: 125.40, change: 4.2, details: 'GPU demand remains unconstrained as hyperscalers expand clusters.', period: 'WEEKLY' },
    { name: 'Microsoft (MSFT)', value: 415.60, change: 1.1, details: 'Office Copilot subscriptions driving SaaS segment margins.', period: 'WEEKLY' },
    { name: 'Google (GOOGL)', value: 175.20, change: 0.8, details: 'Search segment AI integrations stabilized retention.', period: 'WEEKLY' },
    { name: 'NASDAQ 100', value: 19420.00, change: 1.8, details: 'Tech sector leading broader market indexes higher.', period: 'WEEKLY' },
    { name: 'S&P 500', value: 5450.00, change: 1.2, details: 'Robust corporate tech spend cushions macro headwinds.', period: 'WEEKLY' },
    { name: 'Fed Interest Rate', value: 5.25, change: 0.0, details: 'Held steady, waiting for inflation indicators to ease.', period: 'MONTHLY' },
  ];

  for (const tr of financeData) {
    await db.financeTrend.create({ data: tr });
  }

  // 3. AI Trends (Model & Company Profiles)
  const aiData = [
    // Models
    {
      company: 'OpenAI',
      type: 'MODEL',
      title: 'GPT-5 Preview',
      description: JSON.stringify({
        releaseDate: 'Jun 2026',
        contextWindow: '256k tokens',
        mmlu: '91.2%',
        capabilities: 'Native multi-agent orchestration, YAML-defined state routing, 2.5x speed vs GPT-4o.',
        usage: 'Surging in developer segments (+48% MoM).'
      }),
      importance: 'Shifts UI/UX frameworks from manual prompt pipelines to autonomous agent state orchestration.'
    },
    {
      company: 'Anthropic',
      type: 'MODEL',
      title: 'Claude 3.5 Opus',
      description: JSON.stringify({
        releaseDate: 'May 2026',
        contextWindow: '500k tokens',
        mmlu: '89.8%',
        capabilities: 'Deep Graph Routing for long-context file repositories, near-zero hallucination rates.',
        usage: 'Standard for codebase auditing and legal document parsing.'
      }),
      importance: 'Unlocks fully reliable automated code migration and codebase auditing over massive repos.'
    },
    {
      company: 'Google DeepMind',
      type: 'MODEL',
      title: 'Gemini 1.5 Pro',
      description: JSON.stringify({
        releaseDate: 'Mar 2026',
        contextWindow: '2.0M tokens',
        mmlu: '86.4%',
        capabilities: 'Native multi-modal audio and video streaming inputs, real-time voice latency < 150ms.',
        usage: 'Popular for interactive customer service agents and real-time screen parsing.'
      }),
      importance: 'Bypasses speech-to-text layers to build immediate voice conversational interfaces.'
    },
    // Companies
    {
      company: 'OpenAI',
      type: 'COMPANY',
      title: 'OpenAI Corporate Profile',
      description: JSON.stringify({
        funding: '$13.2B total (Last round: $6.6B at $157B valuation)',
        acquisitions: 'Rockset (real-time SQL search), Multi (collaboration platforms)',
        hiring: 'Active hiring in GPU compiler design (+12% YoY)',
        strategicMoves: 'Apple Intelligence default integration, expanding global data centers in partnership with Microsoft.'
      }),
      importance: 'Retains leading market cap in generative AI space; shifting heavily towards custom silicon partnerships.'
    },
    {
      company: 'Anthropic',
      type: 'COMPANY',
      title: 'Anthropic Corporate Profile',
      description: JSON.stringify({
        funding: '$8.4B total (Last round: $4B from Amazon)',
        acquisitions: 'None public',
        hiring: 'Surge in alignment and safety research teams (+24% YoY)',
        strategicMoves: 'De-facto model partner for AWS Bedrock ecosystem, launching Claude enterprise desktop suite.'
      }),
      importance: 'Key challenger in enterprise segment; holds strong compliance and regulatory advantage.'
    },
    {
      company: 'Perplexity',
      type: 'COMPANY',
      title: 'Perplexity AI Corporate Profile',
      description: JSON.stringify({
        funding: '$500M total (Valued at $8B in last round)',
        acquisitions: 'None public',
        hiring: 'Aggressive expansion of publisher relations and ad operations (+45% YoY)',
        strategicMoves: 'Launches revenue-sharing advertising model for web searches, indexing real-time finance feeds.'
      }),
      importance: 'Pioneered LLM-based web search; now expanding into media licensing to prevent publisher lawsuits.'
    }
  ];

  for (const tr of aiData) {
    await db.aiTrend.create({ data: tr });
  }
}

