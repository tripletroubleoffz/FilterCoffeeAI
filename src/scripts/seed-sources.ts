import { PrismaClient, Role, UserStatus } from '@prisma/client';

const db = new PrismaClient();

const DEFAULT_SOURCES = [
  // AI & LLM SOURCES
  { name: 'OpenAI News', url: 'https://openai.com/news/', type: 'AI', format: 'RSS', category: 'AI', pollingInterval: 60 },
  { name: 'Anthropic News', url: 'https://www.anthropic.com/news', type: 'AI', format: 'RSS', category: 'AI', pollingInterval: 60 },
  { name: 'Google DeepMind Blog', url: 'https://deepmind.google/discover/blog/', type: 'AI', format: 'RSS', category: 'AI', pollingInterval: 120 },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog', type: 'AI', format: 'RSS', category: 'AI', pollingInterval: 120 },
  { name: 'NVIDIA Blog', url: 'https://blogs.nvidia.com/', type: 'AI', format: 'RSS', category: 'AI', pollingInterval: 120 },
  { name: 'Meta AI Blog', url: 'https://ai.meta.com/blog/', type: 'AI', format: 'RSS', category: 'AI', pollingInterval: 180 },
  { name: 'Microsoft AI Blog', url: 'https://blogs.microsoft.com/ai/', type: 'AI', format: 'RSS', category: 'AI', pollingInterval: 180 },

  // STARTUP & PRODUCT SOURCES
  { name: 'TechCrunch', url: 'https://techcrunch.com/', type: 'Finance', format: 'RSS', category: 'Startups', pollingInterval: 60 },
  { name: 'Y Combinator Blog', url: 'https://www.ycombinator.com/blog', type: 'Finance', format: 'RSS', category: 'Startups', pollingInterval: 120 },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/', type: 'General', format: 'API', category: 'Startups', pollingInterval: 60 },
  { name: 'Crunchbase News', url: 'https://news.crunchbase.com/', type: 'Finance', format: 'RSS', category: 'Startups', pollingInterval: 120 },
  { name: 'VentureBeat', url: 'https://venturebeat.com/', type: 'Finance', format: 'RSS', category: 'Startups', pollingInterval: 60 },
  { name: 'First Round Review', url: 'https://review.firstround.com/', type: 'Career', format: 'RSS', category: 'Startups', pollingInterval: 240 },
  { name: 'Andreessen Horowitz (a16z)', url: 'https://a16z.com/news-content/', type: 'Finance', format: 'RSS', category: 'Startups', pollingInterval: 180 },

  // RESEARCH SOURCES
  { name: 'arXiv AI', url: 'https://arxiv.org/', type: 'AI', format: 'RSS', category: 'Research', pollingInterval: 240 },
  { name: 'Papers With Code', url: 'https://paperswithcode.com/', type: 'AI', format: 'RSS', category: 'Research', pollingInterval: 240 },
  { name: 'Google Research Blog', url: 'https://research.google/blog/', type: 'AI', format: 'RSS', category: 'Research', pollingInterval: 240 },
  { name: 'OpenReview', url: 'https://openreview.net/', type: 'AI', format: 'CUSTOM', category: 'Research', pollingInterval: 360 },

  // DEVELOPER SOURCES
  { name: 'GitHub Blog', url: 'https://github.blog/', type: 'General', format: 'RSS', category: 'Programming', pollingInterval: 120 },
  { name: 'GitHub Trending', url: 'https://github.com/trending', type: 'General', format: 'CUSTOM', category: 'Programming', pollingInterval: 120 },
  { name: 'React Blog', url: 'https://react.dev/blog', type: 'General', format: 'RSS', category: 'Programming', pollingInterval: 360 },
  { name: 'Next.js Blog', url: 'https://nextjs.org/blog', type: 'General', format: 'RSS', category: 'Programming', pollingInterval: 360 },
  { name: 'Vercel Blog', url: 'https://vercel.com/blog', type: 'General', format: 'RSS', category: 'Programming', pollingInterval: 120 },
  { name: 'Stack Overflow Blog', url: 'https://stackoverflow.blog/', type: 'Career', format: 'RSS', category: 'Programming', pollingInterval: 180 },
  { name: 'Docker Blog', url: 'https://www.docker.com/blog/', type: 'General', format: 'RSS', category: 'Programming', pollingInterval: 180 },
  { name: 'Kubernetes Blog', url: 'https://kubernetes.io/blog/', type: 'General', format: 'RSS', category: 'Programming', pollingInterval: 240 },
  { name: 'Cloudflare Blog', url: 'https://blog.cloudflare.com/', type: 'General', format: 'RSS', category: 'Programming', pollingInterval: 60 },

  // CLOUD SOURCES
  { name: 'AWS News Blog', url: 'https://aws.amazon.com/blogs/aws/', type: 'General', format: 'RSS', category: 'Cloud', pollingInterval: 120 },
  { name: 'Google Cloud Blog', url: 'https://cloud.google.com/blog', type: 'General', format: 'RSS', category: 'Cloud', pollingInterval: 120 },
  { name: 'Azure Blog', url: 'https://azure.microsoft.com/blog/', type: 'General', format: 'RSS', category: 'Cloud', pollingInterval: 120 },
  { name: 'DigitalOcean Blog', url: 'https://www.digitalocean.com/blog', type: 'General', format: 'RSS', category: 'Cloud', pollingInterval: 240 },

  // CYBERSECURITY SOURCES
  { name: 'The Hacker News', url: 'https://thehackernews.com/', type: 'General', format: 'RSS', category: 'Security', pollingInterval: 60 },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/', type: 'General', format: 'RSS', category: 'Security', pollingInterval: 120 },
  { name: 'CISA News', url: 'https://www.cisa.gov/news-events', type: 'General', format: 'RSS', category: 'Security', pollingInterval: 240 },
  { name: 'Cloudflare Security Blog', url: 'https://blog.cloudflare.com/tag/security/', type: 'General', format: 'RSS', category: 'Security', pollingInterval: 120 },

  // MOBILE SOURCES
  { name: 'Android Developers Blog', url: 'https://android-developers.googleblog.com/', type: 'Career', format: 'RSS', category: 'Mobile', pollingInterval: 240 },
  { name: 'Apple Developer News', url: 'https://developer.apple.com/news/', type: 'Career', format: 'RSS', category: 'Mobile', pollingInterval: 240 },

  // HARDWARE SOURCES
  { name: 'Intel Newsroom', url: 'https://www.intel.com/content/www/us/en/newsroom/home.html', type: 'General', format: 'RSS', category: 'Hardware', pollingInterval: 180 },
  { name: 'AMD Newsroom', url: 'https://community.amd.com/', type: 'General', format: 'RSS', category: 'Hardware', pollingInterval: 180 },
  { name: 'Qualcomm News', url: 'https://www.qualcomm.com/news', type: 'General', format: 'RSS', category: 'Hardware', pollingInterval: 180 },

  // GENERAL TECHNOLOGY SOURCES
  { name: 'Reuters Technology', url: 'https://www.reuters.com/technology/', type: 'General', format: 'RSS', category: 'Technology', pollingInterval: 60 },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/', type: 'General', format: 'RSS', category: 'Technology', pollingInterval: 120 },
  { name: 'Ars Technica', url: 'https://arstechnica.com/', type: 'General', format: 'RSS', category: 'Technology', pollingInterval: 60 },
  { name: 'Wired', url: 'https://www.wired.com/', type: 'General', format: 'RSS', category: 'Technology', pollingInterval: 60 },
  { name: 'The Verge', url: 'https://www.theverge.com/tech', type: 'General', format: 'RSS', category: 'Technology', pollingInterval: 60 }
];

async function main() {
  console.log('Seeding default technology sources...');
  let addedCount = 0;
  let updatedCount = 0;

  for (const src of DEFAULT_SOURCES) {
    const existing = await db.source.findUnique({
      where: { url: src.url }
    });

    if (existing) {
      await db.source.update({
        where: { url: src.url },
        data: {
          format: src.format,
          category: src.category,
          pollingInterval: src.pollingInterval,
          type: src.type
        }
      });
      updatedCount++;
    } else {
      await db.source.create({
        data: {
          name: src.name,
          url: src.url,
          type: src.type,
          format: src.format,
          category: src.category,
          pollingInterval: src.pollingInterval,
          isActive: true
        }
      });
      addedCount++;
    }
  }

  console.log(`Seeding complete. Added: ${addedCount}, Updated: ${updatedCount}`);

  // Seed Admin Account
  console.log('Seeding Admin and Test accounts...');
  const adminUser = await db.user.upsert({
    where: { email: 'founder@filtercoffee.ai' },
    update: {
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'founder@filtercoffee.ai',
      name: 'Founder Admin',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      authProvider: 'MOCK',
      authId: 'mock_founder_admin',
    },
  });

  await db.subscription.upsert({
    where: { userId: adminUser.id },
    update: {
      plan: 'POWER',
      status: 'ACTIVE',
    },
    create: {
      userId: adminUser.id,
      plan: 'POWER',
      status: 'ACTIVE',
      stripeCustomerId: 'cus_admin_stripe',
      stripePriceId: 'price_power_monthly',
    },
  });

  const adminLedger = await db.creditLedger.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      currentBalance: 10000,
      purchasedCredits: 10000,
    },
  });

  // Seed Test User
  const testUser = await db.user.upsert({
    where: { email: 'test@filtercoffee.ai' },
    update: {
      role: Role.USER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'test@filtercoffee.ai',
      name: 'Test Coffee User',
      role: Role.USER,
      status: UserStatus.ACTIVE,
      authProvider: 'MOCK',
      authId: 'mock_test_user',
    },
  });

  await db.subscription.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      plan: 'PRO',
      status: 'ACTIVE',
      stripeCustomerId: 'cus_test_stripe',
      stripePriceId: 'price_pro_monthly',
    },
  });

  await db.creditLedger.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      currentBalance: 1000,
      purchasedCredits: 1000,
    },
  });

  console.log('Admin and Test accounts seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding sources:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
