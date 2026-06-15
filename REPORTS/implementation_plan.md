# Security Enhancement Plan: Enable Row Level Security (RLS) on Database Tables

Enable Row Level Security (RLS) across all tables in the `public` schema on the Supabase database. This resolves the Security Advisor warnings in Supabase, preventing direct client-side access to sensitive user data, payment logs, bookmarks, and configurations, while allowing the backend Prisma client (running as postgres superuser) to function normally.

## User Review Required

> [!IMPORTANT]
> Enabling RLS without policies blocks all direct access to the tables via the Supabase client-side API (PostgREST).
> Since our application architecture channels all data reads and writes through tRPC/Prisma (running server-side with superuser privileges), this change has **zero impact** on standard user operations, while **significantly improving security** by closing public PostgREST API access.

---

## Proposed Changes

### Database Configurations

#### [NEW] [enable-rls.ts](file:///c:/Users/Umamaheswari%20C/OneDrive/Desktop/FilterCoffeeAI/src/scripts/enable-rls.ts)
Create a script that uses Prisma Client to execute raw SQL queries to enable Row Level Security on the following 19 tables in the `public` schema:
* `User`
* `Subscription`
* `Payment`
* `Source`
* `TopicKeyword`
* `Signal`
* `Digest`
* `DigestTopic`
* `DigestSignal`
* `Bookmark`
* `Report`
* `CareerTrend`
* `FinanceTrend`
* `AiTrend`
* `Analytics`
* `AuditLog`
* `EmailLog`
* `ContactMessage`
* `Topic`

The script will execute:
```sql
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
-- (repeated for all 19 tables)
```

---

## Verification Plan

### Automated Run
- Execute `npx tsx src/scripts/enable-rls.ts` to apply the changes to the Supabase database.

### Manual Verification
- Verify that the Supabase Security Advisor warnings disappear.
- Confirm using the browser subagent that a logged-in user can still successfully load and save their profile, view logs, and perform standard dashboard actions (since backend TRPC bypasses RLS).
