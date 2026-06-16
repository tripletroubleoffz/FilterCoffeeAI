import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const tables = [
  'User',
  'Subscription',
  'Payment',
  'Source',
  'TopicKeyword',
  'Signal',
  'Digest',
  'DigestTopic',
  'DigestSignal',
  'Bookmark',
  'Report',
  'CareerTrend',
  'FinanceTrend',
  'AiTrend',
  'Analytics',
  'AuditLog',
  'EmailLog',
  'ContactMessage',
  'Topic',
  'CreditLedger',
  'CreditTransaction',
  'AiGeneration',
  'UsageLog',
  'Feedback',
  'BillingEvent'
];

async function main() {
  console.log('Enabling Row Level Security (RLS) on all database tables...');
  
  for (const table of tables) {
    try {
      await db.$executeRawUnsafe(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ Enabled RLS on table: ${table}`);
    } catch (err: any) {
      console.error(`✗ Failed to enable RLS on table: ${table}. Error:`, err.message);
    }
  }
  
  console.log('Row Level Security configuration completed successfully.');
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
