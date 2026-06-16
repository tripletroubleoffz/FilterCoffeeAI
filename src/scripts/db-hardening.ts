import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Starting Database Hardening...');

  // 1. Credit Ledger negative balance protection check constraint
  try {
    console.log('Applying negative balance check constraint to CreditLedger...');
    await db.$executeRawUnsafe(`
      ALTER TABLE "CreditLedger" DROP CONSTRAINT IF EXISTS check_positive_balance;
    `);
    await db.$executeRawUnsafe(`
      ALTER TABLE "CreditLedger" ADD CONSTRAINT check_positive_balance CHECK ("currentBalance" >= 0);
    `);
    console.log('✓ CreditLedger negative balance check constraint applied.');
  } catch (err: any) {
    console.error('✗ Failed to apply CreditLedger check constraint:', err.message);
  }

  // 2. Define RLS Policies for user isolation
  const policies = [
    {
      table: 'Digest',
      name: 'digest_user_isolation',
      definition: `("userId" = (SELECT id FROM "User" WHERE "authId" = auth.uid()::text))`
    },
    {
      table: 'Bookmark',
      name: 'bookmark_user_isolation',
      definition: `("userId" = (SELECT id FROM "User" WHERE "authId" = auth.uid()::text))`
    },
    {
      table: 'Topic',
      name: 'topic_user_isolation',
      definition: `("userId" = (SELECT id FROM "User" WHERE "authId" = auth.uid()::text))`
    },
    {
      table: 'CreditLedger',
      name: 'credit_ledger_user_isolation',
      definition: `("userId" = (SELECT id FROM "User" WHERE "authId" = auth.uid()::text))`
    },
    {
      table: 'AiGeneration',
      name: 'ai_generation_user_isolation',
      definition: `("userId" = (SELECT id FROM "User" WHERE "authId" = auth.uid()::text))`
    },
    {
      table: 'UsageLog',
      name: 'usage_log_user_isolation',
      definition: `("userId" = (SELECT id FROM "User" WHERE "authId" = auth.uid()::text))`
    }
  ];

  for (const policy of policies) {
    try {
      console.log(`Applying RLS policy for ${policy.table}...`);
      await db.$executeRawUnsafe(`
        ALTER TABLE "public"."${policy.table}" ENABLE ROW LEVEL SECURITY;
      `);
      await db.$executeRawUnsafe(`
        DROP POLICY IF EXISTS "${policy.name}" ON "public"."${policy.table}";
      `);
      await db.$executeRawUnsafe(`
        CREATE POLICY "${policy.name}" ON "public"."${policy.table}"
        FOR ALL USING (${policy.definition});
      `);
      console.log(`✓ RLS Policy "${policy.name}" applied successfully to ${policy.table}.`);
    } catch (err: any) {
      console.error(`✗ Failed to apply RLS policy to table ${policy.table}:`, err.message);
    }
  }

  // 3. PurchaseIntent RLS policies for public INSERT and owner/admin SELECT
  try {
    console.log('Applying RLS policies for PurchaseIntent...');
    await db.$executeRawUnsafe(`
      ALTER TABLE "public"."PurchaseIntent" ENABLE ROW LEVEL SECURITY;
    `);
    await db.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "purchase_intent_select" ON "public"."PurchaseIntent";
    `);
    await db.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "purchase_intent_insert" ON "public"."PurchaseIntent";
    `);
    await db.$executeRawUnsafe(`
      CREATE POLICY "purchase_intent_select" ON "public"."PurchaseIntent"
      FOR SELECT USING (
        "userId" = (SELECT id FROM "User" WHERE "authId" = auth.uid()::text)
        OR (SELECT role FROM "User" WHERE "authId" = auth.uid()::text) = 'ADMIN'
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE POLICY "purchase_intent_insert" ON "public"."PurchaseIntent"
      FOR INSERT WITH CHECK (true);
    `);
    console.log('✓ PurchaseIntent RLS policies applied.');
  } catch (err: any) {
    console.error('✗ Failed to apply PurchaseIntent RLS policies:', err.message);
  }

  console.log('Database Hardening completed.');
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
