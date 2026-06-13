import { db } from './db';
import { getEmbedding, cosineSimilarity } from './embeddings';
import { upsertSignal, searchSimilarSignals } from './qdrant';
import { generateText } from './llm';
import { emailService } from './services/email';
import Parser from 'rss-parser';
import sanitizeHtml from 'sanitize-html';

export async function sendEmail(to: string, subject: string, html: string) {
  return emailService.sendEmail(to, subject, html);
}


const rssParser = new Parser({
  customFields: {
    item: ['category', 'description', 'content:encoded', 'pubDate'],
  }
});

export async function parseRss(xmlText: string) {
  const items: Array<{ title: string; content: string; url: string; publishedAt: Date }> = [];
  try {
    const feed = await rssParser.parseString(xmlText);
    for (const item of feed.items) {
      if (item.title && item.link) {
        const rawContent = item['content:encoded'] || item.content || item.description || '';
        const cleanContent = sanitizeHtml(rawContent, {
          allowedTags: [], // Strip all HTML to prevent XSS
          allowedAttributes: {}
        }).trim();

        items.push({
          title: item.title.trim(),
          content: cleanContent,
          url: item.link.trim(),
          publishedAt: item.isoDate ? new Date(item.isoDate) : (item.pubDate ? new Date(item.pubDate) : new Date()),
        });
      }
    }
  } catch (error) {
    console.error('[Ingestion] XML parse error:', error);
  }
  return items;
}

// Core Ingestion logic
export async function ingestSource(sourceId: string) {
  const source = await db.source.findUnique({ where: { id: sourceId } });
  if (!source || !source.isActive) return;

  console.log(`[Ingestion] Starting ingestion for: ${source.name} (${source.url})`);

  let items: Array<{ title: string; content: string; url: string; publishedAt: Date }> = [];
  let ingestionError: string | null = null;

  try {
    if (source.url.startsWith('http')) {
      const response = await fetch(source.url, { headers: { 'User-Agent': 'FilterCoffee/1.0' } });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      if (source.format === 'RSS') {
        const text = await response.text();
        items = await parseRss(text);
      } else if (source.format === 'API') {
        const data = await response.json();
        const rawItems = Array.isArray(data) ? data : (data.items || data.articles || data.data || []);
        if (Array.isArray(rawItems)) {
          for (const raw of rawItems) {
            const title = raw.title || raw.name || raw.heading || '';
            const content = raw.content || raw.description || raw.body || raw.summary || '';
            const url = raw.url || raw.link || raw.href || source.url;
            const publishedAt = raw.publishedAt || raw.pubDate || raw.date || new Date();
            if (title) {
              const cleanContent = sanitizeHtml(String(content), { allowedTags: [], allowedAttributes: {} }).trim();
              items.push({
                title: String(title).trim(),
                content: cleanContent,
                url: String(url).trim(),
                publishedAt: new Date(publishedAt),
              });
            }
          }
        }
      } else {
        // CUSTOM
        const text = await response.text();
        const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          items.push({
            title: titleMatch[1].trim(),
            content: `Custom parsed integration page from ${source.url}`,
            url: source.url,
            publishedAt: new Date(),
          });
        }
      }
    }
  } catch (error: any) {
    console.error(`[Ingestion] Fetching error for ${source.name}:`, error);
    ingestionError = error.message || String(error);
  }

  if (items.length === 0 && !ingestionError) {
    ingestionError = "No items parsed from source feed";
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
      let category = source.category || 'General';
      const lowTitle = item.title.toLowerCase();
      const lowContent = item.content.toLowerCase();
      if (lowTitle.includes('ai') || lowContent.includes('gpt') || lowContent.includes('llm') || lowContent.includes('openai') || lowContent.includes('anthropic') || lowContent.includes('model')) {
        category = 'AI';
      } else if (lowTitle.includes('market') || lowTitle.includes('rate') || lowTitle.includes('funding') || lowTitle.includes('shares') || lowTitle.includes('finance') || lowContent.includes('fed')) {
        category = 'Finance';
      } else if (lowTitle.includes('career') || lowTitle.includes('hiring') || lowTitle.includes('jobs') || lowContent.includes('skills') || lowContent.includes('remote')) {
        category = 'Career';
      }

      // 5. Generate AI Summarization structured JSON
      let structuredContent = item.content;
      try {
        const systemPrompt = `You are a premium AI news intelligence summarizer for FilterCoffee.ai.
Your goal is to parse raw news signals and output a JSON object representing executive-level insights.
The JSON object must have EXACTLY these fields:
- "body": A clear description of the development (1-2 sentences).
- "tldr": A very concise, direct summary of the event (1 sentence).
- "whyItMatters": A brief analysis of why this is important for the industry or market (1-2 sentences).
- "careerImpact": A brief analysis of how it changes hiring demand or trending skills (1 sentence).
- "businessImpact": A brief analysis of operational or strategic corporate effects (1 sentence).
- "confidenceScore": An integer from 10 to 100 indicating confidence in the news facts.
- "credibilityScore": An integer from 10 to 100 indicating source credibility.

Output ONLY the raw JSON. Do not write markdown tags or block quotes.`;

        const prompt = `Title: ${item.title}\nContent: ${item.content}\nSource: ${source.name}`;

        const aiSummary = await generateText({ systemPrompt, prompt });
        const cleanJson = aiSummary.trim().replace(/^```json/, '').replace(/```$/, '').trim();
        JSON.parse(cleanJson); // validate
        structuredContent = cleanJson;
      } catch (e) {
        console.warn(`[Ingestion] AI summarization failed for "${item.title}", saving fallback structure:`, e);
        structuredContent = JSON.stringify({
          body: item.content,
          tldr: item.title,
          whyItMatters: 'Industry intelligence signal update.',
          careerImpact: 'Upskilling in AI and system engineering recommended.',
          businessImpact: 'General operational optimization.',
          confidenceScore: 85,
          credibilityScore: 85
        });
      }

      // 6. Store in Prisma Database
      const newSignal = await db.signal.create({
        data: {
          sourceId: source.id,
          title: item.title,
          content: structuredContent,
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

  // Update last fetched timestamp, health status, and error status
  await db.source.update({
    where: { id: source.id },
    data: {
      lastFetched: new Date(),
      healthStatus: ingestionError ? 'FAILING' : 'HEALTHY',
      lastError: ingestionError,
    },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      action: 'INGESTION',
      details: `Ingested source "${source.name}". Added ${signalsAdded} new signals. Status: ${ingestionError ? 'DEGRADED' : 'HEALTHY'}.`,
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://filtercoffee.ai';
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
        <p><a href="${baseUrl}/dashboard/settings" style="color: #8b5a2b; text-decoration: none;">Manage subscriptions</a> | <a href="${baseUrl}/dashboard/billing" style="color: #8b5a2b; text-decoration: none;">Billing</a></p>
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


