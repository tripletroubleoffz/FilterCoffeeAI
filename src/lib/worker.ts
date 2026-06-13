import { db } from './db';
import { getEmbedding, cosineSimilarity } from './embeddings';
import { upsertSignal, searchSimilarSignals } from './qdrant';
import { generateText } from './llm';

// Resend Email Setup
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendEmail(to: string, subject: string, html: string) {
  if (RESEND_API_KEY && RESEND_API_KEY !== 'mock-resend-key') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'FilterCoffee.ai <briefings@filtercoffee.ai>',
          to,
          subject,
          html,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        await db.emailLog.create({
          data: { email: to, subject, status: 'SENT' },
        });
        return data;
      } else {
        throw new Error(data.message || 'Resend error');
      }
    } catch (error: any) {
      console.error(`Failed to send email to ${to}:`, error);
      await db.emailLog.create({
        data: { email: to, subject, status: 'FAILED', error: error.message },
      });
    }
  } else {
    // Offline / Mock Local Logger
    console.log(`[EMAIL SEND SIMULATION]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content HTML length: ${html.length} chars`);
    console.log(`--------------------------------------------------`);
    await db.emailLog.create({
      data: { email: to, subject, status: 'SENT' },
    });
  }
}

// Simple XML helper to extract RSS items without heavy libraries
function parseRss(xmlText: string) {
  const items: Array<{ title: string; content: string; url: string; publishedAt: Date }> = [];
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g);
  if (!itemMatches) return items;

  for (const itemXml of itemMatches) {
    const title = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
                  itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
    const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
    const description = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
                        itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
    const pubDateStr = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
    
    if (title && link) {
      items.push({
        title: title.trim(),
        content: description.trim().replace(/<[^>]*>/g, ''), // strip html tags
        url: link.trim(),
        publishedAt: pubDateStr ? new Date(pubDateStr) : new Date(),
      });
    }
  }
  return items;
}

// Core Ingestion logic
export async function ingestSource(sourceId: string) {
  const source = await db.source.findUnique({ where: { id: sourceId } });
  if (!source || !source.isActive) return;

  console.log(`[Ingestion] Starting ingestion for: ${source.name} (${source.url})`);

  let items: Array<{ title: string; content: string; url: string; publishedAt: Date }> = [];

  try {
    if (source.url.startsWith('http')) {
      const response = await fetch(source.url, { headers: { 'User-Agent': 'FilterCoffee/1.0' } });
      if (response.ok) {
        const text = await response.text();
        items = parseRss(text);
      }
    }
  } catch (error) {
    console.error(`[Ingestion] Network error fetching ${source.name}:`, error);
  }

  // Fallback to rich mock data if no items were parsed or it is a placeholder URL
  if (items.length === 0) {
    console.log(`[Ingestion] Generating mock signals for source type: ${source.type}`);
    items = getMockSourceItems(source.type, source.name);
  }

  let signalsAdded = 0;

  for (const item of items) {
    try {
      // 1. Check if signal already exists in SQL database (exact URL check)
      const existing = await db.signal.findFirst({ where: { url: item.url } });
      if (existing) continue;

      // 2. Generate embedding for similarity checks
      const textToEmbed = `${item.title}. ${item.content}`;
      const embedding = await getEmbedding(textToEmbed);

      // 3. Query vector store for duplicates (threshold 0.88)
      const similar = await searchSimilarSignals(embedding, 1, 0.88);
      if (similar.length > 0) {
        console.log(`[Ingestion] Deduplicated signal: "${item.title}" (similarity score: ${similar[0].score.toFixed(3)})`);
        continue;
      }

      // 4. Determine pillar category and score
      let category = 'General';
      const lowTitle = item.title.toLowerCase();
      const lowContent = item.content.toLowerCase();
      if (lowTitle.includes('ai') || lowContent.includes('gpt') || lowContent.includes('llm') || lowContent.includes('openai') || lowContent.includes('anthropic') || lowContent.includes('model')) {
        category = 'AI';
      } else if (lowTitle.includes('market') || lowTitle.includes('rate') || lowTitle.includes('funding') || lowTitle.includes('shares') || lowTitle.includes('finance') || lowContent.includes('fed')) {
        category = 'Finance';
      } else if (lowTitle.includes('career') || lowTitle.includes('hiring') || lowTitle.includes('jobs') || lowContent.includes('skills') || lowContent.includes('remote')) {
        category = 'Career';
      }

      // 5. Store in Prisma Database
      const newSignal = await db.signal.create({
        data: {
          sourceId: source.id,
          title: item.title,
          content: item.content,
          url: item.url,
          publishedAt: item.publishedAt,
          category,
          score: 1.0, // base ranking score
        },
      });

      // 6. Index in Qdrant (or mock vector DB)
      await upsertSignal(newSignal.id, embedding, {
        title: item.title,
        category,
        url: item.url,
        publishedAt: item.publishedAt.toISOString(),
      });

      signalsAdded++;
    } catch (err) {
      console.error(`[Ingestion] Failed to ingest item "${item.title}":`, err);
    }
  }

  // Update last fetched timestamp
  await db.source.update({
    where: { id: source.id },
    data: { lastFetched: new Date() },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      action: 'INGESTION',
      details: `Ingested source "${source.name}". Added ${signalsAdded} new signals.`,
    },
  });

  console.log(`[Ingestion] Complete for ${source.name}. Added ${signalsAdded} signals.`);
}

// Compiles personalized briefing for a user
export async function generateUserDigest(userId: string, frequency: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      topics: {
        where: { isActive: true },
        include: { keywords: true },
      },
    },
  });

  if (!user || user.topics.length === 0) return;

  console.log(`[Digest] Generating ${frequency} digest for user: ${user.email}`);

  // 1. Collect all matching signals for user topics
  const matchSignals: any[] = [];
  const processedSignalIds = new Set<string>();

  for (const topic of user.topics) {
    const keywords = topic.keywords.map(k => k.keyword.toLowerCase());
    const excludeKeywords = topic.keywords.filter(k => k.isExclude).map(k => k.keyword.toLowerCase());
    const includeKeywords = topic.keywords.filter(k => !k.isExclude).map(k => k.keyword.toLowerCase());

    // Fetch signals from last 7 days (or 1 day depending on frequency)
    const timeLimit = new Date();
    if (frequency === 'DAILY') {
      timeLimit.setDate(timeLimit.getDate() - 2); // 2 days window to ensure coverage
    } else {
      timeLimit.setDate(timeLimit.getDate() - 8); // 8 days window
    }

    const candidateSignals = await db.signal.findMany({
      where: {
        publishedAt: { gte: timeLimit },
      },
      orderBy: { publishedAt: 'desc' },
    });

    for (const signal of candidateSignals) {
      if (processedSignalIds.has(signal.id)) continue;

      const title = signal.title.toLowerCase();
      const content = signal.content.toLowerCase();

      // Check filters
      const matchesTopicName = title.includes(topic.name.toLowerCase()) || content.includes(topic.name.toLowerCase());
      
      let matchesIncludes = includeKeywords.length === 0;
      if (includeKeywords.length > 0) {
        matchesIncludes = includeKeywords.some(kw => title.includes(kw) || content.includes(kw));
      }

      const matchesExcludes = excludeKeywords.length > 0 && excludeKeywords.some(kw => title.includes(kw) || content.includes(kw));

      if ((matchesTopicName || matchesIncludes) && !matchesExcludes) {
        matchSignals.push(signal);
        processedSignalIds.add(signal.id);
      }
    }
  }

  if (matchSignals.length === 0) {
    console.log(`[Digest] No new signals found matching topics for ${user.email}. Skipping digest.`);
    return;
  }

  // 2. Format signals into LLM prompt
  const signalsContext = matchSignals
    .map((sig, idx) => `[Signal #${idx + 1}]
Title: ${sig.title}
Category: ${sig.category}
Source: ${sig.url}
Content: ${sig.content}`)
    .join('\n\n');

  const systemPrompt = `You are a premium business intelligence compiler at FilterCoffee.ai.
Your job is to read news signals and generate a highly polished, calm, and readable personal morning digest.
Structure your digest EXACTLY with these three main sections:
1. ### What Changed: 3-4 bullet points summarizing the most important facts from the signals. Make it extremely direct and fact-driven.
2. ### Why This Matters: 2-3 bullet points offering deep contextual analysis on strategic implications, capital/market impact, or careers/skills.
3. ### Sources: Clickable markdown links to the source URLs, with clean titles.

Do not use emojis. Use professional, elegant tone.`;

  const prompt = `Here are the matching signals for the user's topics today:
${signalsContext}

Compile the morning briefing.`;

  // 3. Generate content using the LLM Router
  const summaryMarkdown = await generateText({ systemPrompt, prompt });

  // 4. Save digest to Database
  const digest = await db.digest.create({
    data: {
      userId: user.id,
      title: `Your Morning Briefing - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      summary: summaryMarkdown,
      frequency,
      sentAt: new Date(),
    },
  });

  // Link topics and signals in DB
  for (const topic of user.topics) {
    await db.digestTopic.create({
      data: { digestId: digest.id, topicId: topic.id },
    }).catch(() => {});
  }

  for (const sig of matchSignals) {
    await db.digestSignal.create({
      data: { digestId: digest.id, signalId: sig.id },
    }).catch(() => {});
  }

  // 5. Send Digest Email
  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111; line-height: 1.6;">
      <div style="border-bottom: 2px solid #8b5a2b; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #8b5a2b; margin: 0;">FilterCoffee.ai</h1>
        <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">Brewed Intelligence for Professionals</p>
      </div>
      <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">${digest.title}</h2>
      <div style="font-size: 15px; color: #222;">
        ${summaryMarkdown
          .replace(/### (.*)/g, '<h3 style="font-size: 16px; font-weight: 700; color: #8b5a2b; margin-top: 25px; margin-bottom: 10px; border-left: 3px solid #8b5a2b; padding-left: 8px;">$1</h3>')
          .replace(/- \*\*(.*?)\*\*(.*)/g, '<li style="margin-bottom: 8px;"><strong>$1</strong>$2</li>')
          .replace(/- (.*)/g, '<li style="margin-bottom: 8px;">$1</li>')
          .replace(/\n\n/g, '<br/>')
        }
      </div>
      <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #999;">
        <p>You received this digest because you subscribe to topic feeds on FilterCoffee.ai.</p>
        <p><a href="http://localhost:3000/dashboard/settings" style="color: #8b5a2b; text-decoration: none;">Manage subscriptions</a> | <a href="http://localhost:3000/dashboard/billing" style="color: #8b5a2b; text-decoration: none;">Billing</a></p>
      </div>
    </div>
  `;

  await sendEmail(user.email, digest.title, emailHtml);
  console.log(`[Digest] Finished sending digest to ${user.email}`);
}

export async function runAllIngestions() {
  const sources = await db.source.findMany({ where: { isActive: true } });
  console.log(`[Ingestion] Starting ingestion for all ${sources.length} sources`);
  for (const source of sources) {
    await ingestSource(source.id);
  }
}

// Generate high quality mock signals depending on source type
function getMockSourceItems(type: string, name: string) {
  const timestamp = new Date();
  
  if (type === 'AI') {
    return [
      {
        title: 'OpenAI Launches GPT-5 Preview with Native Multi-Agent Orchestration',
        content: 'OpenAI has released GPT-5 Preview to developers. The model features native agent coordination, allowing developers to define complex sub-agent hierarchies directly through the API. Performance on reasoning and planning benchmarks shows a 35% improvement over GPT-4o.',
        url: 'https://openai.com/blog/gpt-5-preview-agent-orchestration',
        publishedAt: timestamp,
      },
      {
        title: 'Anthropic Unveils Claude 3.5 Opus with Deep Context Graph Routing',
        content: 'Anthropic has announced Claude 3.5 Opus. The highlight of this release is Graph Routing, which allows the model to map dependencies in long context window inputs, leading to a massive drop in hallucination rates on massive source documentation repositories.',
        url: 'https://anthropic.com/news/claude-3-5-opus',
        publishedAt: timestamp,
      },
      {
        title: 'Mistral AI Releases Pixtral Large: Open-Weights 123B Vision Model',
        content: 'Mistral AI, in collaboration with Hugging Face, has released Pixtral Large, an open-weights multimodal model boasting 123 billion parameters. It scores highly on visual reasoning and PDF chart analysis, competing directly with proprietary models.',
        url: 'https://mistral.ai/news/pixtral-large-vision',
        publishedAt: timestamp,
      }
    ];
  }
  
  if (type === 'Finance') {
    return [
      {
        title: 'Federal Reserve Holds Interest Rates Steady, Citing Sticky Core Inflation',
        content: 'The Federal Reserve Open Market Committee announced it will maintain interest rates at current levels. Chairman Powell stated that while employment remains strong, core service inflation remains sticky, indicating rate cuts may be pushed into the fourth quarter.',
        url: 'https://federalreserve.gov/news/interest-rate-june-2026',
        publishedAt: timestamp,
      },
      {
        title: 'Qdrant Raises $45M Series B for Real-Time Vector Database Sharding',
        content: 'Vector database startup Qdrant announced a $45M Series B funding round led by Benchmark. The capital will be used to build self-healing partitioned vector architectures capable of handling real-time indexing for billions of streaming telemetry events.',
        url: 'https://techcrunch.com/qdrant-series-b-45m',
        publishedAt: timestamp,
      },
      {
        title: 'Tech Stocks Correction: Nasdaq Down 2.4% as AI Capex Rises',
        content: 'Major technology stock indices faced corrections today, with the Nasdaq index dropping 2.4%. Wall Street analysts cite concerns over rising AI capital expenditure (Capex) amongst hyperscalers compared to immediate consumer adoption software monetization.',
        url: 'https://bloomberg.com/news/tech-market-correction-capex',
        publishedAt: timestamp,
      }
    ];
  }

  if (type === 'Career') {
    return [
      {
        title: 'Demand for Rust Engineers Grows 28% Driven by Cloud Run-Time Cost Savings',
        content: 'A job market report from LinkedIn shows a 28% year-on-year increase in job postings requesting Rust. Companies are actively migrating cloud-native microservices from Node.js/Python to Rust to reduce memory footprint and Serverless execution costs.',
        url: 'https://linkedin.com/reports/rust-demand-grow-cloud',
        publishedAt: timestamp,
      },
      {
        title: 'The Shift to AI Orchestration Engineers: New Tech Role Emerges',
        content: 'Recruiting agencies report a surge in demand for "AI Orchestration Engineers." Unlike pure data scientists, this role focuses on constructing stateful agents, setting up semantic caching, indexing vector databases, and managing rate limits.',
        url: 'https://hiringtrends.com/roles/ai-orchestration-engineers',
        publishedAt: timestamp,
      },
      {
        title: 'Remote Hybrid Models Settle at 3-Days in Office for Tech Hubs',
        content: 'A national workplace study reveals that tech companies in San Francisco, Seattle, and New York have solidified hybrid attendance schedules, settling on a 3-days in office and 2-days remote rhythm as employee churn stabilizing factor.',
        url: 'https://workplaces.org/reports/hybrid-tech-hubs-stabilize',
        publishedAt: timestamp,
      }
    ];
  }

  // General news
  return [
    {
      title: 'GitHub Trending Report: Declarative Agent Configurations Dominate OSS',
      content: 'The Github trending page shows that open-source repositories built around declarative YAML configurations for AI agent behaviors are receiving the highest star growth, replacing traditional imperative typescript agent code.',
      url: 'https://github.com/trending/oss-agent-yaml',
      publishedAt: timestamp,
    }
  ];
}
