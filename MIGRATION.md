# FilterCoffee.ai — Production Migration Guide

This document provides a comprehensive blueprint and checklist for transitioning the **FilterCoffee.ai** platform from Phase 1 Local Mock/Validation Mode to a secure, scaled production-grade deployment.

---

## 1. Mocked vs. Production Service Matrix

The architecture uses a clean service abstraction and factory resolver pattern. You can toggle services from mock to production by swapping `*_PROVIDER` environment variables in `.env` without changing any business logic.

| Service | Mock Implementation Details | Production Provider Options | Configuration Key(s) |
| :--- | :--- | :--- | :--- |
| **Authentication** | Cookie-based session manager (`fc_session`). Automatic user profile generation. | **Clerk** | `AUTH_PROVIDER="clerk"` |
| **Payments & Billing** | Mock success redirects with URL parameters; local DB subscription adjustments. | **Stripe** | `PAYMENT_PROVIDER="stripe"` |
| **Emails** | Local SQLite console logger and database table logs (`EmailLog`). | **Resend** | `EMAIL_PROVIDER="resend"` |
| **AI / Embeddings** | Offline word-frequency hashing (1536-dim vectors) & template-based briefings. | **OpenAI**, **Anthropic**, **Gemini** | `AI_PROVIDER="openai" \| "anthropic" \| "gemini"` |
| **Vector DB** | In-memory / local JSON store (`prisma/vector_db.json`) using Cosine similarity. | **Qdrant Cloud** | `VECTOR_PROVIDER="qdrant"` |
| **Background Cache** | Local in-memory JS `Map` object cache. | **Redis** | `CACHE_PROVIDER="redis"` |
| **Storage / Uploads** | Writing buffers to local folder `public/uploads/` & returning local URLs. | **AWS S3** | `STORAGE_PROVIDER="s3"` |

---

## 2. Environment Variables Specification

Ensure these keys are configured in your production hosting panel (Vercel, Render, AWS ECS, etc.).

```env
# ==============================================================================
# Service Provider Toggles
# ==============================================================================
AUTH_PROVIDER="clerk"
PAYMENT_PROVIDER="stripe"
EMAIL_PROVIDER="resend"
AI_PROVIDER="openai"       # Or "anthropic", "gemini"
CACHE_PROVIDER="redis"
VECTOR_PROVIDER="qdrant"
STORAGE_PROVIDER="s3"

# ==============================================================================
# Database Configuration (PostgreSQL Production)
# ==============================================================================
DATABASE_URL="postgresql://[user]:[password]@[db-host]:5432/[db-name]?sslmode=require"

# ==============================================================================
# Clerk Authentication Keys
# ==============================================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# ==============================================================================
# Stripe Billing Keys & Webhooks
# ==============================================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_API_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # Obtained from Stripe CLI / Dashboard Webhooks

# ==============================================================================
# Resend Email API Key
# ==============================================================================
RESEND_API_KEY="re_..."

# ==============================================================================
# AI API Keys
# ==============================================================================
OPENAI_API_KEY="sk-proj-..."       # Required if AI_PROVIDER="openai"
ANTHROPIC_API_KEY="sk-ant-..."     # Required if AI_PROVIDER="anthropic"
GEMINI_API_KEY="AIzaSy..."         # Required if AI_PROVIDER="gemini"

# ==============================================================================
# Qdrant Vector DB Credentials
# ==============================================================================
QDRANT_URL="https://[cluster-id].aws.qdrant.io:6333"
QDRANT_API_KEY="your-qdrant-read-write-token"

# ==============================================================================
# Redis Queue & Cache URL
# ==============================================================================
REDIS_URL="rediss://default:[password]@[redis-host]:6379"

# ==============================================================================
# AWS S3 Storage Credentials
# ==============================================================================
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="filtercoffee-briefings-prod"

# ==============================================================================
# General Platform Variables
# ==============================================================================
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://filtercoffee.ai"  # Custom production URL
```

---

## 3. Production Provider Setup Instructions

### A. Authentication: Clerk
1. Sign up on [Clerk.com](https://clerk.com) and create a production application.
2. Go to **API Keys** in the Clerk Dashboard and copy the Publishable Key and Secret Key.
3. Configure the sign-in and sign-up URL redirects in Clerk to point to `/sign-in` and `/sign-up` respectively.
4. Set up a Webhook in Clerk pointing to `https://filtercoffee.ai/api/webhooks/clerk` with the `user.created` event selected. Ensure the signing secret is verified inside the route handler to sync user profiles instantly.

### B. Payments & Billing: Stripe
1. Sign up or log into [Stripe Dashboard](https://dashboard.stripe.com).
2. Create two recurring prices under the **Product Catalog**:
   - **Pro Subscription**: Name it `PRO`, set monthly billing (e.g. $4.99/mo). Price ID must match `price_pro_monthly` (or map to your custom pricing identifier).
   - **Power Subscription**: Name it `POWER`, set monthly billing (e.g. $9.99/mo). Price ID must match `price_power_monthly`.
3. Create a Portal Configuration under **Settings > Billing Customer Portal** to enable self-serve invoice downloads and plan cancellations.
4. Set up a webhook endpoint in Stripe targeting `https://filtercoffee.ai/api/webhooks/stripe`. Subscribe to these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copy the Stripe webhook signing secret (starts with `whsec_`) and set it as `STRIPE_WEBHOOK_SECRET`.

### C. Emails: Resend
1. Sign up at [Resend.com](https://resend.com).
2. Navigate to **Domains**, add your domain (e.g. `filtercoffee.ai`), and configure the required MX, SPF, and DKIM DNS records at your domain registrar.
3. Generate an API Key under **API Keys** with "Sending" permissions. Copy and set it as `RESEND_API_KEY`.
4. Update the sending address in `src/lib/services/email/resend.ts` to reflect your validated domain (e.g., `briefings@filtercoffee.ai`).

### D. AI: OpenAI / Anthropic / Gemini
1. Obtain API access keys from your preferred LLM provider dashboard:
   - OpenAI: [platform.openai.com](https://platform.openai.com)
   - Anthropic: [console.anthropic.com](https://console.anthropic.com)
   - Gemini: [aistudio.google.com](https://aistudio.google.com)
2. Add the selected provider keys to your environment, and toggle the `AI_PROVIDER` flag.

### E. Vector Database: Qdrant
1. Create a free-tier or cluster instance on [Qdrant Cloud](https://cloud.qdrant.io).
2. Retrieve the Cluster URI (e.g. `https://xxx.aws.qdrant.io:6333`) and generate a read/write API key.
3. The production service adapter (`QdrantVectorService`) will automatically initialize the `signals` collection with 1536-dimensional Cosine vector matching upon boot.

### F. Queue Cache: Redis
1. Set up a Redis instance on [Upstash](https://upstash.com) (Serverless, excellent for Vercel/Render) or [Aiven](https://aiven.io).
2. Ensure the connection URL uses SSL (`rediss://`) and set the `maxRetriesPerRequest` option to `null` to comply with BullMQ connection rules.

### G. Cloud Storage: AWS S3
1. Create an AWS S3 Bucket on your AWS Console. Set CORS policies to allow reading assets from your web domain.
2. Under AWS IAM, create a programmatically accessible user with `AmazonS3FullAccess` limited to the created bucket.
3. Generate an AWS Access Key ID and Secret Access Key, setting them under S3 environment variables.

---

## 4. Database Migration Steps (SQLite to PostgreSQL)

To move relational data safely from local SQLite (`prisma/dev.db`) to PostgreSQL:

1. **Dump Relational Schema**: 
   Since Prisma abstractions keep database operations provider-agnostic, you do not need database-specific SQL files. Simply update `provider = "postgresql"` inside your Prisma schema:
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. **Execute Schema Sync**:
   Run the Prisma migration generator to initialize the PostgreSQL target:
   ```bash
   npx prisma migrate deploy
   ```
3. **Data Export/Import (Optional)**:
   Use utility libraries like `pgloader` or a custom script reading local SQLite models and upserting them using standard Prisma Client hooks if you need to migrate local test topics, signals, or mock payment histories.
   For a clean start, you can simply seed the database:
   ```bash
   npx prisma db seed
   ```

---

## 5. Deployment Architectures

### A. Vercel (Frontend & Serverless API Routes)
- Push your repository to GitHub.
- Connect your repo on the [Vercel Dashboard](https://vercel.com).
- Under Project Settings, insert all environment variables.
- **Queue/Worker Caveat**: Serverless routes on Vercel are limited to 10–60s timeouts. We recommend running long-running cron jobs (e.g. indexing RSS feeds) using Vercel Cron jobs (`vercel.json`) invoking `/api/cron/ingest` routes, or deploying the separate ingestion worker.

### B. Render / AWS (Relational DB & Persistent Worker Process)
For the Background Worker (`src/lib/worker.ts` & `src/lib/queue.ts`), a persistent Node process is required to pull jobs off the BullMQ pipeline:
- **Render Setup**:
  1. Deploy a **Web Service** for the Next.js frontend app.
  2. Deploy a **Background Worker** service linking the same repository, running the command `npm run start:worker`.
- **AWS ECS (Docker Setup)**:
  Use the provided `Dockerfile.worker` to build the background queue listener image:
  ```bash
  docker build -f Dockerfile.worker -t filtercoffee-worker:latest .
  ```
  Run this task on AWS ECS Fargate attached to your Redis instance.

---

## 6. Security Recommendations for Production

1. **Verify Webhook Signatures**:
   Always verify the cryptographic signatures for Clerk (`svix`) and Stripe (`stripe.constructEvent`) endpoints. Never skip signatures in production profiles.
2. **Database SSL Enforcements**:
   Append `?sslmode=require` to your production PostgreSQL connection string. Ensure your database rejects non-SSL TCP queries.
3. **HTTP-Only Session Cookies**:
   If utilizing any cookie-based fallback authentications, enforce `secure: true`, `sameSite: "lax"`, and `httpOnly: true` properties.
4. **API Rate Limiting**:
   Employ Next.js route rate-limit headers or attach Cloudflare proxy limits on API routes (`/api/trpc/*`) to protect against token-exhaustion attacks.

---

## 7. Step-by-Step Conversion Checklist

- [ ] 1. Provision all production SaaS services (Clerk, Stripe, Resend, Qdrant, Redis, AWS S3).
- [ ] 2. Provision production PostgreSQL database and execute `npx prisma migrate deploy`.
- [ ] 3. Update `.env` or set environment variables in your hosting dashboard with real credentials.
- [ ] 4. Swap all provider flags to production options:
  - `AUTH_PROVIDER="clerk"`
  - `PAYMENT_PROVIDER="stripe"`
  - `EMAIL_PROVIDER="resend"`
  - `AI_PROVIDER="openai"` (or `anthropic`/`gemini`)
  - `CACHE_PROVIDER="redis"`
  - `VECTOR_PROVIDER="qdrant"`
  - `STORAGE_PROVIDER="s3"`
- [ ] 5. Set up DNS records for email domain verification on Resend.
- [ ] 6. Build the Next.js application in production mode (`npm run build`) and verify it compiles without warnings.
- [ ] 7. Launch web container and persistent background worker thread.
- [ ] 8. Perform a test checkout flow and inspect webhook processing logs.
