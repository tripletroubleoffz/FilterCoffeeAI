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
});

// Seed defaults
async function seedDefaultData(db: any) {
  const sources = [
    { name: 'OpenAI Developer Blog', url: 'https://openai.com/blog/rss.xml', type: 'AI' },
    { name: 'Anthropic News', url: 'https://anthropic.com/news/rss.xml', type: 'AI' },
    { name: 'Federal Reserve Announcements', url: 'https://federalreserve.gov/rss/press.xml', type: 'Finance' },
    { name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/', type: 'Finance' },
    { name: 'Hiring Momentum Reports', url: 'https://hiringtrends.com/feed/', type: 'Career' },
  ];

  for (const src of sources) {
    const createdSource = await db.source.upsert({
      where: { url: src.url },
      update: {},
      create: { name: src.name, url: src.url, type: src.type },
    });

    // Generate 3 mock signals for each source
    const items = getMockSignalsForSource(src.type, src.name);
    for (const item of items) {
      await db.signal.create({
        data: {
          sourceId: createdSource.id,
          title: item.title,
          content: item.content,
          url: item.url,
          publishedAt: item.publishedAt,
          category: src.type,
        },
      });
    }
  }
}

async function seedDefaultTrends(db: any) {
  // Career trends
  const careerData = [
    { type: 'SKILL', name: 'Rust', value: 'Backend Infrastructures', change: 28.4, period: 'WEEKLY' },
    { type: 'SKILL', name: 'TypeScript / Next.js', value: 'Web Applications', change: 12.1, period: 'WEEKLY' },
    { type: 'ROLE', name: 'AI Orchestration Engineer', value: 'Agents & Vector DBs', change: 42.6, period: 'MONTHLY' },
    { type: 'SALARY', name: 'Machine Learning Lead', value: '$210,000 Median', change: 8.5, period: 'YEARLY' },
    { type: 'ADOPTION', name: 'Tailwind CSS v4', value: 'Atomic Layout engines', change: 65.0, period: 'MONTHLY' },
  ];

  for (const tr of careerData) {
    await db.careerTrend.create({ data: tr });
  }

  // Finance trends
  const financeData = [
    { name: 'Federal Reserve Rate decision', value: 5.25, change: 0.0, details: 'Held steady, waiting for inflation slowdown.', period: 'WEEKLY' },
    { name: 'Qdrant Series B Funding', value: 45000000, change: 100.0, details: 'Led by Benchmark for vector database auto-scaling.', period: 'WEEKLY' },
    { name: 'Vercel SaaS Hosting Valuation', value: 3200000000, change: 14.5, period: 'YEARLY' },
  ];

  for (const tr of financeData) {
    await db.financeTrend.create({ data: tr });
  }

  // AI trends
  const aiData = [
    { company: 'OpenAI', type: 'Product Release', title: 'GPT-5 Preview', description: 'Introducing native agent hierarchies and orchestration APIs.', importance: 'Shifts UI/UX frameworks toward agentic state systems.' },
    { company: 'Anthropic', type: 'Breakthrough', title: 'Claude 3.5 Opus Graph Routing', description: 'Reduces long-context halluncinations in large documents.', importance: 'Unlocks reliable context retrieval for legacy codebase analysis.' },
    { company: 'Google DeepMind', type: 'Model Release', title: 'Gemini 2.0 Pro', description: 'Massive context window with native real-time audio and visual feed inputs.', importance: 'Powers real-time interactive voice bots without transcription delay.' },
  ];

  for (const tr of aiData) {
    await db.aiTrend.create({ data: tr });
  }
}

function getMockSignalsForSource(type: string, sourceName: string) {
  const t = new Date();
  if (type === 'AI') {
    return [
      { title: `${sourceName} - GPT-5 Agent Orchestration`, content: 'Autonomous agent hierarchies can now be designed declaratively in YAML, reducing the boilerplate TypeScript code in agent routers.', url: 'https://openai.com/mock-gpt5', publishedAt: t },
      { title: `${sourceName} - Claude 3.5 Opus release`, content: 'Anthropic releases Claude 3.5 Opus with a 500k context window and dependency graph mapping for lower memory overhead.', url: 'https://anthropic.com/mock-opus', publishedAt: t },
    ];
  } else if (type === 'Finance') {
    return [
      { title: `Macro Outlook: Fed Interest Rate Decisions`, content: 'Interest rates remain at 5.25% to 5.50% as core CPI indicators remain above 2.8%. Long-term growth targets unchanged.', url: 'https://fed.gov/mock-rates', publishedAt: t },
      { title: `SaaS Revenue Multiples Stabilize`, content: 'Public SaaS revenue multiples hover between 7x-9x ARR, showing a return to pre-bubble historical averages.', url: 'https://bloomberg.com/mock-multiples', publishedAt: t },
    ];
  } else {
    return [
      { title: `AI Engineers Commanding Premium Salaries`, content: 'The average salary for AI engineering roles has grown to $185k, outpacing standard frontend and mobile dev growth.', url: 'https://hiring.com/mock-salaries', publishedAt: t },
      { title: `Hybrid Work Models Stabilization`, content: 'Tech hubs stabilize at three office days per week. Fully remote positions remain competitive with 200+ applicants per listing.', url: 'https://hiring.com/mock-remote', publishedAt: t },
    ];
  }
}
