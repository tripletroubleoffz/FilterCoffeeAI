# FilterCoffee.AI — Master Codebase Report

> **Document Classification:** Confidential — Internal Engineering & Investor Review  
> **Version:** 1.0.0  
> **Generated:** June 15, 2026  
> **Repository:** `tripletroubleoffz/FilterCoffeeAI-MC`  
> **Branch:** `MC`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Requirements Document (PRD)](#2-product-requirements-document-prd)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack Analysis](#4-technology-stack-analysis)
5. [Codebase Analysis](#5-codebase-analysis)
6. [Business Logic Analysis](#6-business-logic-analysis)
7. [Database Documentation](#7-database-documentation)
8. [API Documentation](#8-api-documentation)
9. [Data Flow Analysis](#9-data-flow-analysis)
10. [Workflow Documentation](#10-workflow-documentation)
11. [Security Audit](#11-security-audit)
12. [DevOps & Infrastructure Documentation](#12-devops--infrastructure-documentation)
13. [Dependency Analysis](#13-dependency-analysis)
14. [Performance Analysis](#14-performance-analysis)
15. [Testing Report](#15-testing-report)
16. [Technical Debt Report](#16-technical-debt-report)
17. [Environment Variables Reference](#17-environment-variables-reference)
18. [Third-Party Services Documentation](#18-third-party-services-documentation)
19. [AI System Documentation](#19-ai-system-documentation)
20. [Risks and Limitations](#20-risks-and-limitations)
21. [Future Roadmap](#21-future-roadmap)
22. [Developer Onboarding Guide](#22-developer-onboarding-guide)
23. [Project Handover Documentation](#23-project-handover-documentation)

---

# 1. Executive Summary

## 1.1 Project Identity

| Attribute | Value |
|---|---|
| **Project Name** | FilterCoffee.AI |
| **Product Type** | AI-Powered Intelligence SaaS Platform |
| **Industry Domain** | Business Intelligence / AI News Aggregation |
| **Target Audience** | Software engineers, startup founders, executives, investors |
| **Revenue Model** | Freemium SaaS — ₹0 / ₹499 / ₹999 per month |
| **Primary Currency** | INR (Indian Rupees) |
| **Framework** | Next.js 16 (App Router) |
| **Runtime** | Node.js 20 |
| **Database** | PostgreSQL (Supabase-hosted) |
| **Current Version** | 0.1.0 (Pre-launch) |

## 1.2 What FilterCoffee.AI Does

FilterCoffee.AI is an **AI-powered intelligence aggregation platform** that ingests signals from 45+ technology, finance, career, and research news sources. It uses LLM-based summarization (Google Gemini), vector-based semantic deduplication (Qdrant), and personalized topic filtering to compile executive-level morning briefings delivered via email and an interactive dashboard.

The product positions itself as a blend of:
- **Perplexity-style** AI summaries
- **Bloomberg Terminal-style** market indicators
- **Stripe-level** design aesthetics

## 1.3 Architecture Snapshot

The system is a monolithic Next.js 16 application with:
- **6 tRPC router modules** (signals, topics, billing, admin, contact, user)
- **7 pluggable service layers** (auth, AI, payment, email, vector, cache, storage)
- **Provider Pattern** — every service has a mock fallback for local development
- **BullMQ job queues** with Redis, falling back to `setTimeout` offline schedulers
- **Prisma ORM** against PostgreSQL with 16 database models
- **Vercel cron jobs** for hourly automated ingestion

## 1.4 Production Readiness Assessment

| Dimension | Status | Score |
|---|---|---|
| Authentication | ✅ Functional (Supabase) | 7/10 |
| Database Schema | ✅ Production-grade | 8/10 |
| API Layer | ✅ Type-safe (tRPC + Zod) | 8/10 |
| Payment Integration | ⚠️ Stripe scaffolded, mock active | 5/10 |
| Email Delivery | ⚠️ Resend integrated, test mode | 6/10 |
| AI Pipeline | ✅ Gemini live, mock fallback | 7/10 |
| Vector Search | ⚠️ Qdrant scaffolded, mock active | 5/10 |
| CI/CD | ⚠️ GitHub Actions partial | 4/10 |
| Testing | ❌ Minimal coverage | 2/10 |
| Monitoring | ⚠️ Sentry/PostHog scaffolded | 4/10 |
| **Overall** | **Pre-Launch / Beta** | **5.6/10** |

---

# 2. Product Requirements Document (PRD)

## 2.1 Problem Statement

Technology professionals are overwhelmed by fragmented information across dozens of sources — AI research papers, startup funding rounds, market indicators, career trend reports, and model release announcements. Existing solutions require manually visiting multiple sites, subscribing to numerous newsletters, and spending hours filtering noise from signal.

## 2.2 User Pain Points

| Pain Point | Description |
|---|---|
| **Information Overload** | 100+ daily articles across AI, finance, and career verticals |
| **Duplicate Content** | Same news covered by 10 different outlets |
| **No Personalization** | Generic newsletters not tailored to individual interests |
| **Scattered Sources** | No single pane of glass for AI + Finance + Career |
| **No Actionable Context** | Raw news without career/business impact analysis |

## 2.3 Core Value Proposition

> *"Wake up to a single, AI-curated morning briefing that tells you exactly what changed and why it matters — across AI, finance, and your career."*

## 2.4 User Personas

| Persona | Description | Plan |
|---|---|---|
| **The Builder** | Software engineer tracking AI model releases, framework updates, and skill trends | Pro (₹499) |
| **The Operator** | Startup founder monitoring funding rounds, competitor moves, and market signals | Power (₹999) |
| **The Explorer** | Curious professional testing the waters with one free topic | Free (₹0) |

## 2.5 User Journey Map

```mermaid
journey
    title FilterCoffee.AI User Journey
    section Discovery
      Visit Landing Page: 5: Visitor
      View Features & Pricing: 4: Visitor
    section Onboarding
      Sign Up via Supabase: 4: New User
      Create First Topic: 5: New User
      Add Include/Exclude Keywords: 4: New User
    section Engagement
      Receive First Morning Digest Email: 5: Active User
      Browse Dashboard Signal Feed: 4: Active User
      Search Across All Intelligence: 4: Active User
      Bookmark Important Signals: 3: Active User
    section Monetization
      Hit Topic Limit on Free Plan: 2: Free User
      Upgrade to Pro via Stripe: 4: Paying User
      Manage Billing in Portal: 3: Paying User
    section Retention
      Receive Daily Personalized Digests: 5: Power User
      Export History & Reports: 3: Power User
```

## 2.6 Feature Matrix

| Feature | Free | Pro (₹499) | Power (₹999) |
|---|---|---|---|
| Active Topic Feeds | 1 | 5 | 15 |
| Digest Frequency | Weekly | Daily | Daily + Weekly |
| Exclusion Keyword Filters | ❌ | ✅ | ✅ |
| Bookmarks & Saved Reports | ❌ | ✅ | ✅ |
| Priority Ingestion | ❌ | ❌ | ✅ |
| Complete History Export | ❌ | ❌ | ✅ |
| Email + Dashboard Access | ✅ | ✅ | ✅ |
| Semantic Search | ✅ | ✅ | ✅ |

## 2.7 Business Objectives

1. **Acquire 1,000 free users** within first 60 days of launch
2. **Convert 5%** to Pro/Power paid subscriptions within 90 days
3. **Achieve ₹2.5L MRR** (Monthly Recurring Revenue) within 6 months
4. **Maintain <2% churn** through daily habit-forming email delivery
5. **Expand to 100+ ingestion sources** across global markets

---

# 3. System Architecture

## 3.1 High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Client Layer"]
        Browser["Browser (React 19)"]
        Email["Email Client"]
    end

    subgraph Frontend["Frontend (Next.js 16 App Router)"]
        Landing["Landing Page (page.tsx)"]
        Dashboard["Dashboard Layout"]
        SignIn["Sign In / Sign Up"]
        HubPages["Intelligence Hub Pages"]
    end

    subgraph API["API Layer"]
        TRPC["tRPC v11 Router"]
        CronAPI["Cron API (/api/cron/ingest)"]
        WebhookAPI["Webhook API (/api/webhooks/stripe)"]
        HealthAPI["Health API (/api/health)"]
    end

    subgraph Services["Service Layer (Provider Pattern)"]
        AuthSvc["Auth Service"]
        AISvc["AI Service"]
        PaySvc["Payment Service"]
        EmailSvc["Email Service"]
        VectorSvc["Vector Service"]
        CacheSvc["Cache Service"]
        StorageSvc["Storage Service"]
    end

    subgraph Data["Data Layer"]
        Prisma["Prisma ORM"]
        PG["PostgreSQL (Supabase)"]
        Qdrant["Qdrant Vector DB"]
        Redis["Redis (BullMQ)"]
    end

    subgraph External["External Services"]
        Supabase["Supabase Auth"]
        Gemini["Google Gemini API"]
        Stripe["Stripe Payments"]
        Resend["Resend Email"]
        RSS["RSS/API Sources (45+)"]
    end

    subgraph Workers["Background Workers"]
        Ingestion["Ingestion Pipeline"]
        Digest["Digest Compiler"]
        Queue["BullMQ Job Queue"]
    end

    Browser --> Frontend
    Frontend --> API
    API --> Services
    Services --> Data
    Services --> External
    CronAPI --> Workers
    Workers --> Data
    Workers --> External
    Digest --> Email
    Email --> Email
```

## 3.2 Component Architecture

```mermaid
flowchart LR
    subgraph Routers["tRPC Routers"]
        signals["signals.ts"]
        topics["topics.ts"]
        billing["billing.ts"]
        admin["admin.ts"]
        contact["contact.ts"]
        user["user.ts"]
    end

    subgraph Middleware["tRPC Middleware"]
        isAuthed["isAuthed"]
        isAdmin["isAdmin"]
    end

    subgraph Context["tRPC Context"]
        createContext["createContext()"]
    end

    createContext --> isAuthed
    createContext --> isAdmin
    isAuthed --> signals
    isAuthed --> topics
    isAuthed --> billing
    isAuthed --> user
    isAdmin --> admin
    contact -.- isAuthed
```

## 3.3 Service Provider Architecture

Every core integration follows the **Strategy + Proxy Pattern**:

```mermaid
flowchart TD
    subgraph Interface["Interface Layer"]
        IAI["IAIService"]
        IAuth["IAuthService"]
        IPay["IPaymentService"]
        IEmail["IEmailService"]
        IVector["IVectorService"]
    end

    subgraph Implementations["Concrete Implementations"]
        Gemini["GeminiService"]
        OpenAI["OpenAIService"]
        Anthropic["AnthropicService"]
        MockAI["MockAiService"]
        SupaAuth["SupabaseAuthService"]
        StripePay["StripePaymentService"]
        MockPay["MockPaymentService"]
        NonePay["NonePaymentService"]
        ResendEmail["ResendEmailService"]
        MockEmail["MockEmailService"]
        QdrantVec["QdrantVectorService"]
        MockVec["MockVectorService"]
    end

    subgraph Factory["Lazy Proxy Factory (index.ts)"]
        AIFactory["aiService Proxy"]
        AuthFactory["authService Proxy"]
        PayFactory["paymentService Proxy"]
        EmailFactory["emailService Proxy"]
        VecFactory["vectorService Proxy"]
    end

    IAI --> AIFactory
    AIFactory --> Gemini
    AIFactory --> OpenAI
    AIFactory --> Anthropic
    AIFactory --> MockAI

    IAuth --> AuthFactory
    AuthFactory --> SupaAuth

    IPay --> PayFactory
    PayFactory --> StripePay
    PayFactory --> MockPay
    PayFactory --> NonePay

    IEmail --> EmailFactory
    EmailFactory --> ResendEmail
    EmailFactory --> MockEmail

    IVector --> VecFactory
    VecFactory --> QdrantVec
    VecFactory --> MockVec
```

The Proxy pattern provides **lazy instantiation** — the concrete implementation is only created on first method access, and the provider is selected via environment variables (`AI_PROVIDER`, `PAYMENT_PROVIDER`, `EMAIL_PROVIDER`, `VECTOR_PROVIDER`).

## 3.4 Deployment Architecture

```mermaid
flowchart TD
    subgraph Vercel["Vercel (Primary Deploy Target)"]
        NextApp["Next.js App (Serverless)"]
        CronJob["Vercel Cron (/api/cron/ingest)"]
    end

    subgraph Supabase["Supabase Cloud"]
        SupaAuth["Auth (JWT)"]
        SupaPG["PostgreSQL"]
        SupaRLS["Row Level Security"]
    end

    subgraph AWS["AWS (Terraform - Planned)"]
        ECS["ECS Fargate Cluster"]
        ECR["ECR Container Registry"]
        ALB["Application Load Balancer"]
        ElastiCache["ElastiCache Redis"]
        S3["S3 Attachments Bucket"]
    end

    subgraph Third["Third-Party SaaS"]
        GeminiAPI["Google Gemini API"]
        StripeAPI["Stripe Billing"]
        ResendAPI["Resend Email"]
        QdrantCloud["Qdrant Cloud"]
    end

    NextApp --> SupaPG
    NextApp --> SupaAuth
    NextApp --> GeminiAPI
    NextApp --> StripeAPI
    NextApp --> ResendAPI
    NextApp --> QdrantCloud
    CronJob --> NextApp
```

---

# 4. Technology Stack Analysis

## 4.1 Frontend Stack

| Technology | Version | Purpose | Risk |
|---|---|---|---|
| **Next.js** | 16.2.7 | Full-stack React framework with App Router, SSR, server actions | Low — industry standard |
| **React** | 19.2.4 | UI component library | Low — latest stable |
| **Tailwind CSS** | 4.x | Utility-first CSS framework | Low |
| **Framer Motion** | 12.40.0 | Animation library for page transitions, micro-interactions | Low |
| **GSAP** | 3.15.0 | Advanced scroll-based animations | Low |
| **Lenis** | 1.3.23 | Smooth scroll library | Low |
| **Three.js** | 0.184.0 | 3D WebGL rendering (CoffeeCup hero animation) | Medium — large bundle |
| **@react-three/fiber** | 9.6.1 | React renderer for Three.js | Medium |
| **@react-three/drei** | 10.7.7 | Helpers for react-three-fiber | Medium |
| **Recharts** | 3.8.1 | Chart/graph visualization | Low |
| **Lucide React** | 1.17.0 | Icon library | Low |
| **Zustand** | 5.0.14 | Lightweight state management | Low |
| **clsx** | 2.1.1 | Conditional class name utility | Low |
| **tailwind-merge** | 3.6.0 | Merge conflicting Tailwind classes | Low |

## 4.2 Backend Stack

| Technology | Version | Purpose | Risk |
|---|---|---|---|
| **tRPC** | 11.17.0 | End-to-end typesafe API layer | Low — production proven |
| **Zod** | 4.4.3 | Runtime schema validation for all inputs | Low |
| **Prisma** | 6.19.3 | Type-safe ORM for PostgreSQL | Low |
| **BullMQ** | 5.78.0 | Redis-backed job queue (ingestion, digests) | Medium — requires Redis |
| **ioredis** | 5.11.1 | Redis client for BullMQ | Medium |
| **rss-parser** | 3.13.0 | RSS/Atom feed parser for ingestion | Low |
| **sanitize-html** | 2.17.5 | HTML sanitization to prevent XSS | Low — security critical |

## 4.3 Data Layer

| Technology | Version | Purpose | Risk |
|---|---|---|---|
| **PostgreSQL** | 15 | Primary relational database (via Supabase) | Low |
| **Qdrant** | Latest | Vector database for semantic similarity search | Medium — external dependency |
| **Redis** | 7 | Job queue backing store (BullMQ) | Medium — optional |

## 4.4 Authentication & Security

| Technology | Version | Purpose | Risk |
|---|---|---|---|
| **Supabase Auth** | 2.108.1 | JWT-based authentication (email/password) | Low |
| **@clerk/nextjs** | 7.4.3 | Alternative auth provider (scaffolded, not active) | Low — unused |

## 4.5 Payments

| Technology | Version | Purpose | Risk |
|---|---|---|---|
| **Stripe** | 22.2.0 | Subscription billing, checkout sessions, customer portal | Low |
| **@stripe/stripe-js** | 9.7.0 | Client-side Stripe integration | Low |

## 4.6 Email

| Technology | Version | Purpose | Risk |
|---|---|---|---|
| **Resend** | 6.12.4 | Transactional email delivery (digests, notifications) | Low |

## 4.7 AI & ML

| Technology | Version | Purpose | Risk |
|---|---|---|---|
| **Google Gemini** | API v1beta | Text generation (gemini-1.5-flash) and embeddings (text-embedding-004) | Medium — API costs |

## 4.8 Infrastructure & DevOps

| Technology | Version | Purpose | Risk |
|---|---|---|---|
| **Docker** | Multi-stage | Containerization (web + worker) | Low |
| **Terraform** | >= 1.5.0 | AWS infrastructure as code | Low |
| **Vercel** | - | Primary deployment platform | Low |
| **GitHub Actions** | v4 | CI/CD pipeline (lint, build, deploy) | Low |
| **@sentry/nextjs** | 10.56.0 | Error monitoring (scaffolded) | Low |
| **@vercel/analytics** | 2.0.1 | Web analytics | Low |
| **@vercel/speed-insights** | 2.0.0 | Performance monitoring | Low |
| **posthog-js** | 1.382.0 | Product analytics (scaffolded) | Low |

---

# 5. Codebase Analysis

## 5.1 Directory Structure

```
FilterCoffeeAI/
├── .env                        # Live environment variables
├── .env.example                # Template for new developers
├── .github/workflows/
│   └── deploy.yml              # CI/CD pipeline
├── Dockerfile                  # Multi-stage web app container
├── Dockerfile.worker           # Background worker container
├── docker-compose.yml          # Local dev stack (PG, Redis, Qdrant)
├── terraform/
│   └── main.tf                 # AWS ECS/ECR/ALB/ElastiCache/S3
├── vercel.json                 # Vercel deploy config + cron
├── prisma/
│   └── schema.prisma           # 16-model database schema
├── REPORTS/                    # Generated documentation
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page (682 lines)
│   │   ├── layout.tsx          # Root layout
│   │   ├── providers.tsx       # tRPC + Auth + React Query
│   │   ├── globals.css         # Design system tokens
│   │   ├── sign-in/            # Supabase sign-in page
│   │   ├── sign-up/            # Supabase sign-up page
│   │   ├── dashboard/          # 13 dashboard sub-routes
│   │   │   ├── layout.tsx      # Dashboard shell + sidebar nav
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── admin/          # Admin panel (metrics, sources, logs)
│   │   │   ├── billing/        # Subscription management
│   │   │   ├── profile/        # User profile & settings
│   │   │   ├── topics/         # Topic feed management
│   │   │   ├── bookmarks/      # Saved signals
│   │   │   ├── intelligence/   # Intelligence hub
│   │   │   ├── radar/          # AI & industry radar
│   │   │   ├── market/         # Market intelligence
│   │   │   ├── career/         # Career center
│   │   │   ├── signals/        # Raw signal stream
│   │   │   ├── vault/          # Digest archive
│   │   │   ├── voice-agent/    # Voice agent player
│   │   │   └── contact/        # Contact form (admin)
│   │   ├── api/
│   │   │   ├── trpc/           # tRPC HTTP handler
│   │   │   ├── cron/ingest/    # Hourly ingestion cron
│   │   │   ├── webhooks/stripe/# Stripe webhook handler
│   │   │   └── health/         # Health check endpoint
│   │   ├── brew-feed/          # Public signal feed
│   │   ├── coffee-search/      # Semantic search page
│   │   ├── daily-brew/         # Daily digest view
│   │   ├── weekly-roast/       # Weekly digest view
│   │   ├── monthly-blend/      # Monthly digest view
│   │   ├── annual-reserve/     # Annual reserve view
│   │   └── ... (15+ feature pages)
│   ├── components/
│   │   ├── AuthProvider.tsx     # Supabase auth context
│   │   ├── CoffeeCup.tsx       # 3D animated hero (Three.js)
│   │   ├── VoiceAgentPlayer.tsx # Voice agent interface
│   │   ├── EcosystemMap.tsx     # AI ecosystem visualization
│   │   ├── PremiumGate.tsx      # Paywall component
│   │   └── ...
│   ├── hooks/
│   │   └── useSupabaseAuth.ts   # Auth state hook
│   ├── lib/
│   │   ├── auth.ts              # Auth facade
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── llm.ts               # LLM facade
│   │   ├── embeddings.ts        # Embedding facade
│   │   ├── qdrant.ts            # Vector DB facade
│   │   ├── queue.ts             # BullMQ queue manager
│   │   ├── worker.ts            # Ingestion + digest pipeline (378 lines)
│   │   ├── env.ts               # Environment validator
│   │   ├── constants.ts         # Plan definitions
│   │   ├── supabaseAdmin.ts     # Supabase server client
│   │   ├── supabaseClient.ts    # Supabase browser client
│   │   └── services/
│   │       ├── ai/              # Gemini, OpenAI, Anthropic, Mock
│   │       ├── auth/            # Supabase auth service
│   │       ├── payment/         # Stripe, Mock, None
│   │       ├── email/           # Resend, Mock
│   │       ├── vector/          # Qdrant, Mock
│   │       ├── cache/           # Redis, Mock
│   │       └── storage/         # S3, Mock
│   ├── server/
│   │   ├── trpc.ts              # tRPC init + middleware
│   │   └── routers/
│   │       ├── _app.ts          # Router registry
│   │       ├── signals.ts       # Signal CRUD + search (524 lines)
│   │       ├── topics.ts        # Topic management (185 lines)
│   │       ├── billing.ts       # Subscription billing (85 lines)
│   │       ├── admin.ts         # Admin panel APIs (225 lines)
│   │       ├── contact.ts       # Contact form (142 lines)
│   │       └── user.ts          # Profile + audit (111 lines)
│   ├── scripts/
│   │   ├── seed-sources.ts      # Seed 45+ RSS sources
│   │   ├── worker-run.ts        # Standalone worker runner
│   │   ├── clean-mock-signals.ts# Database cleanup utility
│   │   └── enable-rls.ts        # Supabase RLS enablement
│   └── utils/
│       └── trpc.ts              # tRPC client hooks
└── package.json
```

## 5.2 Code Volume Summary

| Layer | Files | Lines (est.) | Responsibility |
|---|---|---|---|
| `src/app/` (Pages) | ~45 | ~4,500 | UI pages, routing, SSR |
| `src/components/` | 9 | ~1,800 | Reusable UI components |
| `src/server/routers/` | 7 | ~1,270 | API business logic |
| `src/lib/services/` | ~24 | ~1,600 | Service abstractions |
| `src/lib/` (Core) | 8 | ~900 | Worker, queue, auth, DB |
| `prisma/` | 1 | 226 | Database schema |
| Infrastructure | 5 | ~350 | Docker, Terraform, CI/CD |
| **Total** | **~100** | **~10,650** | |

## 5.3 Architecture Patterns

| Pattern | Location | Purpose |
|---|---|---|
| **Strategy Pattern** | `src/lib/services/*/` | Swappable service implementations |
| **Proxy Pattern** | `src/lib/services/*/index.ts` | Lazy instantiation via ES Proxy |
| **Facade Pattern** | `src/lib/auth.ts`, `llm.ts`, `embeddings.ts` | Simplified interface to services |
| **Repository Pattern** | Prisma queries in routers | Data access abstraction |
| **Middleware Pattern** | `src/server/trpc.ts` | Auth enforcement (`isAuthed`, `isAdmin`) |
| **Provider Pattern** | `src/components/AuthProvider.tsx` | React context for auth state |
| **Auto-Seed Pattern** | `src/server/routers/signals.ts` | Auto-populate on empty reads |

---

# 6. Business Logic Analysis

## 6.1 Subscription & Plan Enforcement

The subscription system enforces plan limits at the **topic creation** level:

```
src/lib/constants.ts:
  FREE  → maxTopics: 1
  PRO   → maxTopics: 5
  POWER → maxTopics: 15
```

**Enforcement flow** (in `topics.ts` → `createTopic`):
1. Fetch user with subscription and topic count
2. Determine plan from `subscription.stripePriceId` string matching
3. Compare `user._count.topics >= maxTopics`
4. Throw descriptive error if limit exceeded

> [!WARNING]
> Plan detection relies on **string matching** against `stripePriceId` (e.g., `includes('pro')`). This is fragile — if Stripe price IDs change, plan detection breaks silently.

## 6.2 Signal Ingestion Pipeline

The ingestion pipeline is the core business engine. It runs:
- **Automatically** via Vercel cron (`/api/cron/ingest`) every hour
- **Manually** via admin dashboard trigger
- **Continuously** via BullMQ worker (when Redis is available)

**Pipeline steps per source:**

```mermaid
flowchart TD
    A["Fetch Source URL"] --> B{"Format?"}
    B -->|RSS| C["Parse XML via rss-parser"]
    B -->|API| D["Parse JSON response"]
    B -->|CUSTOM| E["Regex title extraction"]
    C --> F["For each item"]
    D --> F
    E --> F
    F --> G["Check URL duplicate (Prisma)"]
    G -->|Exists| H["Skip"]
    G -->|New| I["Generate Embedding (Gemini)"]
    I --> J["Vector similarity check (Qdrant, threshold 0.88)"]
    J -->|Duplicate| K["Skip (log dedup)"]
    J -->|Unique| L["Categorize (AI/Finance/Career/General)"]
    L --> M["LLM Summarization (Gemini)"]
    M --> N["Store in PostgreSQL"]
    N --> O["Index in Qdrant"]
    O --> P["Update source health status"]
```

## 6.3 Digest Compilation

The digest compiler generates personalized briefings:

1. **Fetch user's active topics** with include/exclude keywords
2. **Query signals** from the last 2 days (daily) or 8 days (weekly)
3. **Match signals** against topic name and keywords
4. **Filter exclusions** to remove unwanted content
5. **Format into LLM prompt** with signal context
6. **Generate markdown briefing** via Gemini with structured sections:
   - "What Changed" — fact-driven bullet points
   - "Why This Matters" — strategic analysis
   - "Sources" — clickable links
7. **Save digest** to database with topic and signal associations
8. **Send email** via Resend with branded HTML template

## 6.4 Semantic Search

The search endpoint (`signals.search`) performs multi-source querying:

1. **Vector search** — Generate query embedding → search Qdrant → retrieve matching signal IDs
2. **Keyword fallback** — If vector search returns nothing, fall back to PostgreSQL `ILIKE` search
3. **Multi-model search** — Parallel queries across signals, AI models, companies, career trends, finance trends
4. **Category filtering** — Optional filtering to specific result types
5. **Funding/Market split** — Finance trends are split into funding rounds vs. market indicators via keyword heuristics

## 6.5 Admin Role Detection

Admin access is determined by the `role` field on the User model:
- Default role: `"USER"`
- Admin role: `"ADMIN"` (assigned when `email === 'founder@filtercoffee.ai'`)
- Enforced via `isAdmin` tRPC middleware

## 6.6 Audit Logging

Every significant action is logged to the `AuditLog` table:

| Action | Trigger |
|---|---|
| `PROFILE_UPDATE` | User edits name/email |
| `TOPIC_CREATE` | User creates topic feed |
| `TOPIC_UPDATE` | User modifies topic |
| `TOPIC_DELETE` | User deletes topic |
| `SOURCE_CREATE` | Admin adds feed source |
| `SOURCE_DELETE` | Admin removes source |
| `SOURCE_TOGGLE_ACTIVE` | Admin enables/disables source |
| `MANUAL_INGESTION_TRIGGER` | Admin triggers ingestion |
| `MANUAL_DIGEST_TRIGGER` | Admin compiles digest for user |
| `INGESTION` | Automated pipeline completion |
| `CONTACT_STATUS_UPDATE` | Admin updates contact ticket |

---

# 7. Database Documentation

## 7.1 Database Provider

| Property | Value |
|---|---|
| **Engine** | PostgreSQL 15 |
| **Host** | Supabase Cloud (`db.dputisltxposlukceoxo.supabase.co`) |
| **ORM** | Prisma 6.19.3 |
| **Connection** | Pooled (port 6543) + Direct (port 5432) |

## 7.2 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Subscription : has
    User ||--o{ Topic : creates
    User ||--o{ Bookmark : saves
    User ||--o{ Digest : receives
    User ||--o{ Report : generates
    User ||--o{ AuditLog : triggers
    User ||--o{ Analytics : tracked

    Subscription ||--o{ Payment : records

    Topic ||--o{ TopicKeyword : contains
    Topic ||--o{ DigestTopic : linked

    Source ||--o{ Signal : produces

    Signal ||--o{ DigestSignal : referenced

    Digest ||--o{ DigestTopic : covers
    Digest ||--o{ DigestSignal : includes

    User {
        string id PK
        string email UK
        string name
        string role
        string supabaseId UK
        datetime createdAt
        datetime updatedAt
    }

    Subscription {
        string id PK
        string userId FK_UK
        string stripeCustomerId UK
        string stripePriceId
        string status
        datetime trialStart
        datetime trialEnd
        datetime currentPeriodEnd
    }

    Payment {
        string id PK
        string subscriptionId FK
        int amount
        string currency
        string stripeChargeId UK
        string status
    }

    Topic {
        string id PK
        string userId FK
        string name
        string frequency
        boolean isActive
    }

    TopicKeyword {
        string id PK
        string topicId FK
        string keyword
        boolean isExclude
    }

    Source {
        string id PK
        string name
        string url UK
        string type
        string format
        string category
        int pollingInterval
        string healthStatus
        boolean isActive
        datetime lastFetched
    }

    Signal {
        string id PK
        string sourceId FK
        string title
        string content
        string url
        datetime publishedAt
        string category
        float score
        string embeddingId
    }

    Digest {
        string id PK
        string userId FK
        string title
        string summary
        string frequency
        datetime sentAt
    }

    DigestTopic {
        string digestId PK_FK
        string topicId PK_FK
    }

    DigestSignal {
        string digestId PK_FK
        string signalId PK_FK
    }

    Bookmark {
        string id PK
        string userId FK
        string title
        string url
        string notes
    }

    Report {
        string id PK
        string userId FK
        string title
        string content
        string range
    }

    CareerTrend {
        string id PK
        string type
        string name
        string value
        float change
        string period
    }

    FinanceTrend {
        string id PK
        string ticker
        string name
        float value
        float change
        string details
        string period
    }

    AiTrend {
        string id PK
        string company
        string type
        string title
        string description
        string importance
    }

    Analytics {
        string id PK
        string userId FK
        string event
        string properties
    }

    AuditLog {
        string id PK
        string userId FK
        string action
        string details
        string ipAddress
    }

    EmailLog {
        string id PK
        string email
        string subject
        string status
        string error
    }

    ContactMessage {
        string id PK
        string name
        string email
        string subject
        string message
        string status
    }
```

## 7.3 Table Details

### Core User Tables

| Table | Rows (est.) | Purpose | Cascade Behavior |
|---|---|---|---|
| `User` | Growing | Central user identity | Parent — cascades to children |
| `Subscription` | 1:1 with User | Stripe billing state | `onDelete: Cascade` from User |
| `Payment` | Per transaction | Payment history | `onDelete: Cascade` from Subscription |

### Content Tables

| Table | Rows (est.) | Purpose | Cascade Behavior |
|---|---|---|---|
| `Source` | 45+ | RSS/API feed sources | Independent |
| `Signal` | Growing rapidly | Ingested news articles | `sourceId` nullable (no cascade) |
| `CareerTrend` | ~6 seeded | Skill/role trend data | Independent |
| `FinanceTrend` | ~6 seeded | Stock/market indicators | Independent |
| `AiTrend` | ~6 seeded | AI model/company profiles | Independent |

### User Activity Tables

| Table | Rows (est.) | Purpose | Cascade Behavior |
|---|---|---|---|
| `Topic` | Per user | Intelligence feed subscriptions | `onDelete: Cascade` from User |
| `TopicKeyword` | Per topic | Include/exclude filter words | `onDelete: Cascade` from Topic |
| `Bookmark` | Per user | Saved signals | `onDelete: Cascade` from User |
| `Digest` | Per delivery | Compiled briefings | `onDelete: Cascade` from User |
| `DigestTopic` | Junction | Links digests ↔ topics | `onDelete: Cascade` (both) |
| `DigestSignal` | Junction | Links digests ↔ signals | `onDelete: Cascade` (both) |
| `Report` | Per user | Custom reports | `onDelete: Cascade` from User |

### System Tables

| Table | Rows (est.) | Purpose | Cascade Behavior |
|---|---|---|---|
| `AuditLog` | Growing | Action audit trail | `userId` nullable (`SetNull` on delete) |
| `Analytics` | Growing | Event tracking | `userId` nullable |
| `EmailLog` | Per email | Email delivery log | Independent |
| `ContactMessage` | Per submission | Support tickets | Independent |

---

# 8. API Documentation

## 8.1 API Layer Architecture

All APIs are exposed through **tRPC v11** over HTTP at `/api/trpc/[trpc]`. The transport is JSON over HTTP POST (mutations) and HTTP GET (queries).

## 8.2 tRPC Router Catalog

### 8.2.1 Signals Router (`signals.*`)

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `getSignals` | Query | Protected | `{ category?, limit }` | Fetch paginated signals by category |
| `getBriefings` | Query | Protected | — | Get user's compiled digests |
| `getTrends` | Query | Protected | — | Get career, finance, AI trends |
| `toggleBookmark` | Mutation | Protected | `{ title, url }` | Add/remove signal bookmark |
| `getBookmarks` | Query | Protected | — | List user's bookmarks |
| `search` | Query | Protected | `{ query, category }` | Semantic + keyword multi-source search |

### 8.2.2 Topics Router (`topics.*`)

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `getTopics` | Query | Protected | — | List user's topic feeds |
| `createTopic` | Mutation | Protected | `{ name, frequency, includeKeywords[], excludeKeywords[] }` | Create new feed with plan limit enforcement |
| `updateTopic` | Mutation | Protected | `{ id, name, frequency, isActive }` | Update topic settings |
| `toggleTopicActive` | Mutation | Protected | `{ id }` | Toggle topic active state |
| `deleteTopic` | Mutation | Protected | `{ id }` | Delete topic feed |

### 8.2.3 Billing Router (`billing.*`)

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `getSubscriptionStatus` | Query | Protected | — | Get current plan, limits, usage |
| `createCheckoutSession` | Mutation | Protected | `{ planCode: PRO\|POWER }` | Create Stripe checkout URL |
| `createPortalSession` | Mutation | Protected | — | Create Stripe billing portal URL |
| `confirmMockCheckout` | Mutation | Protected | `{ planCode: PRO\|POWER }` | Dev-only: simulate payment |

### 8.2.4 Admin Router (`admin.*`)

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `getMetrics` | Query | Admin | — | System KPIs (users, signals, costs) |
| `getSources` | Query | Admin | — | List all feed sources with signal counts |
| `createSource` | Mutation | Admin | `{ name, url, type, format, category, pollingInterval }` | Add new feed source |
| `deleteSource` | Mutation | Admin | `{ id }` | Remove feed source |
| `toggleSourceActive` | Mutation | Admin | `{ id, isActive }` | Enable/disable source |
| `testIngestSource` | Mutation | Admin | `{ id }` | Test-ingest single source |
| `triggerManualIngestion` | Mutation | Admin | — | Trigger full ingestion pipeline |
| `triggerManualDigest` | Mutation | Admin | `{ userId, frequency }` | Compile digest for specific user |
| `getEmailLogs` | Query | Admin | — | View recent email delivery logs |
| `getAuditLogs` | Query | Admin | — | View system audit trail |

### 8.2.5 Contact Router (`contact.*`)

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `submitMessage` | Mutation | **Public** | `{ name, email, subject?, message }` | Submit contact form |
| `getMessages` | Query | Admin | `{ search?, status? }` | List contact tickets |
| `updateStatus` | Mutation | Admin | `{ id, status }` | Update ticket status |

### 8.2.6 User Router (`user.*`)

| Procedure | Type | Auth | Input | Description |
|---|---|---|---|---|
| `getProfile` | Query | Protected | — | Get full user profile with stats |
| `updateProfile` | Mutation | Protected | `{ name, email }` | Update name and email |
| `getAuditLogs` | Query | Protected | `{ search?, filter?, page, limit }` | Paginated user activity logs |
| `deleteAccount` | Mutation | Protected | — | Cascade delete user account |

## 8.3 REST API Endpoints

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET/POST | `/api/trpc/[trpc]` | Via cookie/header | tRPC handler |
| GET | `/api/cron/ingest` | Vercel cron token | Hourly ingestion trigger |
| POST | `/api/webhooks/stripe` | Stripe signature | Payment event handler |
| GET | `/api/health` | None | Health check (ALB target) |

---

# 9. Data Flow Analysis

## 9.1 Signal Ingestion Flow

```mermaid
sequenceDiagram
    participant Cron as Vercel Cron
    participant API as /api/cron/ingest
    participant Worker as worker.ts
    participant RSS as RSS Source
    participant Gemini as Gemini API
    participant PG as PostgreSQL
    participant Qdrant as Qdrant Vector DB

    Cron->>API: GET /api/cron/ingest (hourly)
    API->>Worker: runAllIngestions()
    
    loop For each active source
        Worker->>RSS: fetch(source.url)
        RSS-->>Worker: XML/JSON response
        Worker->>Worker: parseRss() / parseJSON()
        
        loop For each parsed item
            Worker->>PG: Check URL exists?
            alt Already exists
                Worker->>Worker: Skip
            else New signal
                Worker->>Gemini: getEmbedding(title + content)
                Gemini-->>Worker: 1536-dim vector
                Worker->>Qdrant: searchSimilarSignals(vector, threshold=0.88)
                alt Similar found
                    Worker->>Worker: Skip (deduplicated)
                else Unique
                    Worker->>Gemini: generateText(summarize signal)
                    Gemini-->>Worker: Structured JSON summary
                    Worker->>PG: signal.create(structured data)
                    Worker->>Qdrant: upsertSignal(id, vector, metadata)
                end
            end
        end
        
        Worker->>PG: source.update(healthStatus, lastFetched)
        Worker->>PG: auditLog.create(INGESTION)
    end
```

## 9.2 User Authentication Flow

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant AuthProvider as AuthProvider.tsx
    participant Supabase as Supabase Auth
    participant Cookie as Browser Cookie
    participant tRPC as tRPC Context
    participant SupaAdmin as supabaseAdmin
    participant PG as PostgreSQL

    Browser->>AuthProvider: Page load
    AuthProvider->>Supabase: getSession()
    Supabase-->>AuthProvider: Session (access_token + refresh_token)
    AuthProvider->>Cookie: Set sb-*-auth-token cookie
    AuthProvider->>Browser: Render authenticated UI

    Browser->>tRPC: API call (cookie attached)
    tRPC->>tRPC: createContext(req)
    tRPC->>tRPC: Parse cookie → extract access_token
    tRPC->>SupaAdmin: auth.getUser(token)
    SupaAdmin-->>tRPC: Supabase User object
    tRPC->>PG: user.findUnique(supabaseId)
    alt User exists
        PG-->>tRPC: DB User record
    else First login
        tRPC->>PG: user.create + subscription.create
        PG-->>tRPC: New user record
    end
    tRPC->>tRPC: Attach user to context
```

## 9.3 Digest Delivery Flow

```mermaid
sequenceDiagram
    participant Admin as Admin Dashboard
    participant tRPC as Admin Router
    participant Worker as worker.ts
    participant PG as PostgreSQL
    participant Gemini as Gemini API
    participant Resend as Resend Email

    Admin->>tRPC: triggerManualDigest(userId, frequency)
    tRPC->>Worker: generateUserDigest(userId, frequency)
    Worker->>PG: Fetch user + active topics + keywords
    Worker->>PG: Fetch signals from last 2-8 days
    
    loop For each topic
        Worker->>Worker: Match signals by keywords
        Worker->>Worker: Filter exclusions
    end
    
    Worker->>Gemini: Compile morning briefing
    Gemini-->>Worker: Markdown summary
    Worker->>PG: digest.create(summary)
    Worker->>PG: digestTopic.createMany()
    Worker->>PG: digestSignal.createMany()
    Worker->>Resend: sendEmail(branded HTML)
    Resend-->>Worker: Delivery confirmation
```

## 9.4 Checkout & Payment Flow

```mermaid
sequenceDiagram
    participant User as User Browser
    participant tRPC as Billing Router
    participant Stripe as Stripe API
    participant Webhook as /api/webhooks/stripe
    participant PG as PostgreSQL

    User->>tRPC: createCheckoutSession(planCode=PRO)
    tRPC->>Stripe: checkout.sessions.create()
    Stripe-->>tRPC: { url: checkout_url }
    tRPC-->>User: Redirect to Stripe Checkout

    User->>Stripe: Complete payment
    Stripe->>Webhook: POST (checkout.session.completed)
    Webhook->>PG: Update subscription status
    Webhook-->>Stripe: 200 OK

    User->>User: Redirect back to /dashboard/billing
```

---

# 10. Workflow Documentation

## 10.1 Complete System Workflow

```mermaid
flowchart TD
    subgraph Sources["45+ News Sources"]
        RSS1["OpenAI Blog"]
        RSS2["TechCrunch"]
        RSS3["arXiv AI"]
        RSS4["Reuters Tech"]
        RSSN["...and 41 more"]
    end

    subgraph Ingestion["Ingestion Pipeline"]
        Fetch["HTTP Fetch"]
        Parse["RSS/JSON Parse"]
        Dedup["URL Dedup Check"]
        Embed["Generate Embedding"]
        VecDedup["Vector Similarity Check"]
        Categorize["Auto-Categorize"]
        Summarize["LLM Summarize"]
        Store["Store in PostgreSQL"]
        Index["Index in Qdrant"]
    end

    subgraph UserSetup["User Topic Configuration"]
        Topics["Define Topics"]
        Keywords["Set Include Keywords"]
        Exclude["Set Exclude Keywords"]
        Frequency["Choose Frequency"]
    end

    subgraph DigestEngine["Digest Compilation"]
        Match["Match Signals to Topics"]
        Filter["Apply Keyword Filters"]
        Compile["LLM Compile Briefing"]
        SaveDigest["Save to Database"]
        SendEmail["Email via Resend"]
    end

    subgraph Dashboard["Dashboard Experience"]
        Feed["Live Signal Feed"]
        Search["Semantic Search"]
        Bookmark["Bookmark Signals"]
        Trends["View Trends"]
        Reports["Generate Reports"]
    end

    Sources --> Fetch
    Fetch --> Parse --> Dedup --> Embed --> VecDedup --> Categorize --> Summarize --> Store --> Index

    UserSetup --> Match
    Store --> Match
    Match --> Filter --> Compile --> SaveDigest --> SendEmail

    Store --> Dashboard
    Index --> Search
```

## 10.2 Admin Operations Workflow

```mermaid
flowchart TD
    Admin["Admin Login"] --> Dashboard["Admin Dashboard"]
    Dashboard --> Metrics["View System Metrics"]
    Dashboard --> Sources["Manage Feed Sources"]
    Dashboard --> Ingestion["Trigger Manual Ingestion"]
    Dashboard --> Digests["Compile User Digests"]
    Dashboard --> Logs["View Audit & Email Logs"]
    Dashboard --> Contact["Manage Contact Tickets"]

    Sources --> AddSource["Add New Source"]
    Sources --> DeleteSource["Delete Source"]
    Sources --> ToggleSource["Enable/Disable Source"]
    Sources --> TestSource["Test Ingest Source"]

    Ingestion --> Pipeline["Run Full Pipeline"]
    Pipeline --> Results["View Results in Logs"]
```

---

# 11. Security Audit

## 11.1 Security Score Card

| Category | Score | Details |
|---|---|---|
| **Authentication** | 7/10 | Supabase JWT — industry standard, but cookie parsing is custom |
| **Authorization** | 8/10 | tRPC middleware with clear `isAuthed` / `isAdmin` separation |
| **Input Validation** | 9/10 | Zod schemas on every tRPC procedure |
| **XSS Prevention** | 8/10 | `sanitize-html` strips all HTML from ingested content |
| **CSRF Protection** | 6/10 | SameSite=Lax cookies, but no explicit CSRF tokens |
| **SQL Injection** | 9/10 | Prisma parameterized queries — no raw SQL |
| **Secrets Management** | 5/10 | `.env` files, no vault integration |
| **Rate Limiting** | 3/10 | No rate limiting on any endpoint |
| **Logging** | 6/10 | Console logging only, no structured log pipeline |
| **Overall Security Score** | **6.8/10** | |

## 11.2 Authentication Architecture

- **Provider:** Supabase Auth (email + password)
- **Token Type:** JWT (access_token + refresh_token)
- **Token Storage:** Browser cookie (`sb-dputisltxposlukceoxo-auth-token`)
- **Server Validation:** `supabaseAdmin.auth.getUser(token)` on every request
- **Session Duration:** 7 days (cookie max-age), 1 hour (JWT access token)
- **Auto-Refresh:** Supabase client SDK handles token refresh automatically

## 11.3 Authorization Model

| Role | Access Level | How Assigned |
|---|---|---|
| `USER` | Standard dashboard, own data only | Default on registration |
| `ADMIN` | Full system access, all user data, source management | When `email === 'founder@filtercoffee.ai'` |

> [!CAUTION]
> **Critical Issue:** Admin role assignment is hardcoded to a single email address. There is no admin management UI or database-driven role assignment. If the founder email changes, admin access is lost.

## 11.4 Critical Security Issues

| ID | Severity | Issue | Location |
|---|---|---|---|
| SEC-001 | 🔴 Critical | No rate limiting on public `submitMessage` endpoint — abuse vector for spam | `contact.ts:7` |
| SEC-002 | 🔴 Critical | `NEXTAUTH_SECRET` has a hardcoded fallback value in `env.ts` | `env.ts:26` |
| SEC-003 | 🟠 High | No CSRF token validation on mutations | `trpc.ts` |
| SEC-004 | 🟠 High | Admin email hardcoded — no role management system | `supabase.ts:123` |
| SEC-005 | 🟠 High | No IP-based brute force protection on auth | Supabase client-side |
| SEC-006 | 🟡 Medium | Cookie set without `HttpOnly` flag — accessible to JavaScript | `AuthProvider.tsx:29` |
| SEC-007 | 🟡 Medium | Contact form email not sanitized for HTML injection | `contact.ts:33` |
| SEC-008 | 🟡 Medium | `User-Agent` in ingestion fetch is static — could be blocked | `worker.ts:58` |
| SEC-009 | 🟢 Low | Console.log used for debug auth — should use structured logger | `supabase.ts` |

## 11.5 Security Recommendations

1. **Implement rate limiting** using Vercel Edge Middleware or `@upstash/ratelimit`
2. **Remove hardcoded fallback secrets** from `env.ts`
3. **Add `HttpOnly` flag** to auth cookies (requires server-side cookie management)
4. **Implement RBAC** with database-driven role assignment
5. **Add CSP headers** via `next.config.ts`
6. **Sanitize user input** in contact form emails before HTML embedding
7. **Rotate Supabase service role key** — it has full database access

---

# 12. DevOps & Infrastructure Documentation

## 12.1 Build Process

| Step | Command | Description |
|---|---|---|
| Install | `npm install` | Install 50+ dependencies |
| Prisma Generate | `npx prisma generate` | Generate type-safe database client |
| Build | `npm run build` | Next.js production build |
| Lint | `npm run lint` | ESLint codebase check |
| DB Push | `npm run db:push` | Push Prisma schema to database |
| Seed | `npm run db:seed` | Seed 45+ RSS sources |

## 12.2 Docker Configuration

### Web Application (`Dockerfile`)
- **Base:** `node:20-alpine`
- **Build:** Multi-stage (deps → builder → runner)
- **Output:** Next.js standalone server
- **Port:** 3000
- **User:** Non-root `nextjs:nodejs` (UID 1001)

### Background Worker (`Dockerfile.worker`)
- Runs `src/scripts/worker-run.ts` separately
- Initializes BullMQ queues and starts worker loops

### Local Development Stack (`docker-compose.yml`)
- PostgreSQL 15 (port 5432)
- Redis 7 (port 6379)
- Qdrant (ports 6333, 6334)
- Persistent volumes for all three

## 12.3 CI/CD Pipeline

```mermaid
flowchart LR
    Push["Push to main"] --> Checkout["Checkout Code"]
    Checkout --> NodeSetup["Setup Node 20"]
    NodeSetup --> Install["npm ci"]
    Install --> Lint["ESLint"]
    Lint --> Prisma["Prisma Validate"]
    Prisma --> Build["Next.js Build"]
    Build --> Deploy["Deploy to Production"]
    
    Deploy -.->|Commented Out| Docker["Docker Build"]
    Docker -.-> ECR["Push to AWS ECR"]
    ECR -.-> ECS["Deploy to ECS"]
```

> [!IMPORTANT]
> The production deployment step (AWS ECR/ECS) is **commented out** in `deploy.yml`. The current deployment path is **Vercel** (via `vercel.json`).

## 12.4 Terraform Infrastructure (AWS — Planned)

The `terraform/main.tf` defines a complete AWS deployment:

| Resource | Type | Purpose |
|---|---|---|
| VPC | `aws_vpc` | Isolated network (10.0.0.0/16) |
| Subnets | `aws_subnet` x2 | Multi-AZ (a, b) |
| Internet Gateway | `aws_internet_gateway` | Public internet access |
| ECS Cluster | `aws_ecs_cluster` | Container orchestration |
| ECR Repos | `aws_ecr_repository` x2 | Docker image registry (web + worker) |
| ALB | `aws_lb` | Application load balancer |
| Target Group | `aws_lb_target_group` | Health check on `/api/health` |
| Security Groups | `aws_security_group` x2 | ALB (port 80) + ECS (port 3000) |
| ElastiCache | `aws_elasticache_cluster` | Redis for BullMQ (`cache.t4g.micro`) |
| S3 Bucket | `aws_s3_bucket` | File storage (attachments/backups) |

> [!NOTE]
> This Terraform configuration is **not yet applied**. It serves as the planned production architecture when migrating off Vercel.

## 12.5 Vercel Configuration

```json
{
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "crons": [
    {
      "path": "/api/cron/ingest",
      "schedule": "0 * * * *"
    }
  ]
}
```

- **Region:** Singapore (sin1) — optimized for Indian users
- **Cron:** Hourly ingestion at minute 0

---

# 13. Dependency Analysis

## 13.1 Production Dependencies (34 packages)

| Package | Version | Category | Purpose | Risk |
|---|---|---|---|---|
| `next` | 16.2.7 | Core | Full-stack framework | ✅ Low |
| `react` | 19.2.4 | Core | UI library | ✅ Low |
| `react-dom` | 19.2.4 | Core | DOM rendering | ✅ Low |
| `@prisma/client` | 6.19.3 | Data | PostgreSQL ORM | ✅ Low |
| `@trpc/server` | 11.17.0 | API | Type-safe API server | ✅ Low |
| `@trpc/client` | 11.17.0 | API | Type-safe API client | ✅ Low |
| `@trpc/react-query` | 11.17.0 | API | React hooks for tRPC | ✅ Low |
| `@tanstack/react-query` | 5.101.0 | State | Server state management | ✅ Low |
| `zod` | 4.4.3 | Validation | Runtime schema validation | ✅ Low |
| `@supabase/supabase-js` | 2.108.1 | Auth | Supabase client SDK | ✅ Low |
| `stripe` | 22.2.0 | Payment | Stripe server SDK | ✅ Low |
| `@stripe/stripe-js` | 9.7.0 | Payment | Stripe client SDK | ✅ Low |
| `resend` | 6.12.4 | Email | Transactional email | ✅ Low |
| `bullmq` | 5.78.0 | Queue | Job queue (Redis-backed) | ⚠️ Medium |
| `ioredis` | 5.11.1 | Cache | Redis client | ⚠️ Medium |
| `@qdrant/js-client-rest` | 1.18.0 | Vector | Vector database client | ⚠️ Medium |
| `rss-parser` | 3.13.0 | Ingestion | RSS feed parser | ✅ Low |
| `sanitize-html` | 2.17.5 | Security | XSS prevention | ✅ Low |
| `framer-motion` | 12.40.0 | Animation | Page animations | ✅ Low |
| `gsap` | 3.15.0 | Animation | Scroll animations | ✅ Low |
| `lenis` | 1.3.23 | UX | Smooth scrolling | ✅ Low |
| `three` | 0.184.0 | 3D | WebGL rendering | ⚠️ Medium (bundle) |
| `@react-three/fiber` | 9.6.1 | 3D | React Three.js | ⚠️ Medium (bundle) |
| `@react-three/drei` | 10.7.7 | 3D | Three.js helpers | ⚠️ Medium (bundle) |
| `recharts` | 3.8.1 | Charts | Data visualization | ✅ Low |
| `lucide-react` | 1.17.0 | Icons | Icon library | ✅ Low |
| `zustand` | 5.0.14 | State | Client state management | ✅ Low |
| `clsx` | 2.1.1 | Utility | Class name utility | ✅ Low |
| `tailwind-merge` | 3.6.0 | Utility | Tailwind class merge | ✅ Low |
| `@sentry/nextjs` | 10.56.0 | Monitoring | Error tracking | ✅ Low |
| `@vercel/analytics` | 2.0.1 | Analytics | Web analytics | ✅ Low |
| `@vercel/speed-insights` | 2.0.0 | Performance | Speed monitoring | ✅ Low |
| `posthog-js` | 1.382.0 | Analytics | Product analytics | ✅ Low |
| `@aws-sdk/client-s3` | 3.1064.0 | Storage | S3 file storage | ✅ Low |
| `@clerk/nextjs` | 7.4.3 | Auth | Alternative auth (unused) | ⚠️ Unused |

## 13.2 Dependency Concerns

| Issue | Package | Recommendation |
|---|---|---|
| **Unused dependency** | `@clerk/nextjs` | Remove — Supabase is the active auth provider |
| **Large bundle impact** | `three`, `@react-three/*` | Lazy-load CoffeeCup component with `next/dynamic` |
| **Redis not always available** | `bullmq`, `ioredis` | Already handled — falls back to `setTimeout` |
| **PostHog not configured** | `posthog-js` | Either configure or remove to reduce bundle |

---

# 14. Performance Analysis

## 14.1 Frontend Performance

| Metric | Assessment | Notes |
|---|---|---|
| **Bundle Size** | ⚠️ Moderate-High | Three.js adds ~600KB to client bundle |
| **First Contentful Paint** | ⚠️ May be slow | 3D CoffeeCup component blocks render |
| **Time to Interactive** | ⚠️ Depends on tRPC queries | Multiple queries fire on dashboard mount |
| **Code Splitting** | ✅ Good | Next.js automatic page-level splitting |

## 14.2 Backend Performance

| Area | Assessment | Notes |
|---|---|---|
| **Database Queries** | ⚠️ N+1 risk | Ingestion loops with sequential queries |
| **Embedding Generation** | 🔴 Bottleneck | Sequential Gemini API calls per signal |
| **LLM Summarization** | 🔴 Bottleneck | One API call per signal during ingestion |
| **Vector Search** | ✅ Fast | Qdrant optimized for similarity search |
| **Prisma Connection Pool** | ✅ Default | Singleton pattern prevents connection leaks |

## 14.3 Bottleneck Analysis

```mermaid
flowchart LR
    subgraph Fast["< 100ms"]
        DB["Database Queries"]
        Auth["Token Validation"]
    end
    
    subgraph Medium["100ms - 2s"]
        RSS["RSS Fetch"]
        Vector["Vector Search"]
    end
    
    subgraph Slow["2s - 30s"]
        Embed["Embedding Generation"]
        LLM["LLM Summarization"]
        Digest["Digest Compilation"]
    end

    DB --> Medium
    Medium --> Slow
```

## 14.4 Optimization Recommendations

1. **Batch embeddings** — Send multiple texts in one Gemini API call
2. **Parallel ingestion** — Use `Promise.allSettled()` for independent sources
3. **Lazy-load Three.js** — Use `next/dynamic` with `ssr: false` for CoffeeCup
4. **Add database indexes** — On `Signal.publishedAt`, `Signal.category`, `AuditLog.createdAt`
5. **Implement response caching** — Cache `getTrends` and `getSignals` results for 5 minutes
6. **Use connection pooling** — PgBouncer via Supabase (already configured via port 6543)

---

# 15. Testing Report

## 15.1 Current Test Coverage

| Test Type | Coverage | Status |
|---|---|---|
| Unit Tests | ~5% | ❌ Minimal — only `src/__tests__/` directory exists |
| Integration Tests | 0% | ❌ None |
| E2E Tests | 0% | ❌ None |
| API Tests | 0% | ❌ None |

## 15.2 Test Infrastructure

| Tool | Version | Status |
|---|---|---|
| Jest | 30.4.2 | ✅ Installed and configured |
| ts-jest | 29.4.11 | ✅ Installed |
| @types/jest | 30.0.0 | ✅ Installed |

**Jest Configuration** (`jest.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
```

## 15.3 Critical Test Gaps

| Priority | Test Needed | Why |
|---|---|---|
| 🔴 P0 | Auth middleware (isAuthed, isAdmin) | Core security gate |
| 🔴 P0 | Topic plan limit enforcement | Revenue-critical business logic |
| 🔴 P0 | Signal ingestion pipeline | Core product functionality |
| 🟠 P1 | Digest compilation and matching | User-facing daily output |
| 🟠 P1 | Stripe webhook handler | Payment processing correctness |
| 🟡 P2 | Search query routing | Multi-source search correctness |
| 🟡 P2 | Contact form validation | Input validation edge cases |

## 15.4 Testing Recommendations

1. **Add unit tests** for all tRPC router procedures using mock Prisma client
2. **Add integration tests** for the ingestion pipeline with mock RSS responses
3. **Add E2E tests** using Playwright for critical user flows (sign-up → create topic → receive digest)
4. **Add contract tests** for Stripe webhook payload processing
5. **Target 70% code coverage** before production launch

---

# 16. Technical Debt Report

## 16.1 Technical Debt Inventory

| ID | Severity | Category | Description | Location |
|---|---|---|---|---|
| TD-001 | 🔴 Critical | Mock Data | `seedDefaultData()` auto-seeds 6 hardcoded signals when DB is empty | `signals.ts:259-402` |
| TD-002 | 🔴 Critical | Mock Data | `seedDefaultTrends()` auto-seeds hardcoded career/finance/AI trends | `signals.ts:404-522` |
| TD-003 | 🔴 Critical | Architecture | Plan detection via string matching on `stripePriceId` | `billing.ts:26-32`, `topics.ts:43-48` |
| TD-004 | 🟠 High | Security | Hardcoded admin email for role assignment | `supabase.ts:123` |
| TD-005 | 🟠 High | Reliability | Embedding dimension hack — duplicates 768→1536 by repeating vector | `gemini.ts:75-77` |
| TD-006 | 🟠 High | Unused Code | `@clerk/nextjs` installed but not used | `package.json:18` |
| TD-007 | 🟡 Medium | Architecture | `any` type used extensively in router handlers | Multiple routers |
| TD-008 | 🟡 Medium | Performance | Sequential signal processing in ingestion loop | `worker.ts:111-200` |
| TD-009 | 🟡 Medium | Observability | Console.log/console.error for all logging — no structured logging | Everywhere |
| TD-010 | 🟡 Medium | Testing | Near-zero test coverage | `src/__tests__/` |
| TD-011 | 🟢 Low | UX | Landing page has static/hardcoded signal examples | `page.tsx:346-386` |
| TD-012 | 🟢 Low | Maintenance | Multiple auth hook wrappers (`useSupabaseAuth` → `useAuth`) | `hooks/`, `components/` |

## 16.2 Remediation Priority

```mermaid
gantt
    title Technical Debt Remediation Plan
    dateFormat  YYYY-MM-DD
    section Critical
    Remove auto-seed mock data (TD-001, TD-002)     :crit, 2026-06-16, 3d
    Refactor plan detection to enum mapping (TD-003) :crit, 2026-06-19, 2d
    section High
    Database-driven admin roles (TD-004)             :active, 2026-06-21, 3d
    Fix embedding dimension properly (TD-005)        :2026-06-24, 1d
    Remove unused Clerk dependency (TD-006)          :2026-06-25, 1d
    section Medium
    Replace any types with proper typing (TD-007)    :2026-06-26, 3d
    Add structured logging (TD-009)                  :2026-06-29, 2d
    Parallelize ingestion (TD-008)                   :2026-07-01, 2d
    Add test coverage (TD-010)                       :2026-07-03, 5d
```

---

# 17. Environment Variables Reference

## 17.1 Complete Variable Catalog

### Service Provider Selection

| Variable | Required | Default | Values | Description |
|---|---|---|---|---|
| `AUTH_PROVIDER` | ✅ Prod | `mock` | `supabase`, `clerk`, `mock` | Authentication provider |
| `NEXT_PUBLIC_AUTH_PROVIDER` | ✅ Prod | `mock` | Same as above | Client-side auth provider hint |
| `PAYMENT_PROVIDER` | ✅ Prod | `mock` | `stripe`, `none`, `mock` | Payment provider |
| `EMAIL_PROVIDER` | ✅ Prod | `mock` | `resend`, `mock` | Email delivery provider |
| `AI_PROVIDER` | ✅ Prod | `mock` | `gemini`, `openai`, `anthropic`, `mock` | LLM provider |
| `VECTOR_PROVIDER` | ✅ Prod | `mock` | `qdrant`, `mock` | Vector database provider |
| `CACHE_PROVIDER` | ⬜ Optional | `mock` | `redis`, `mock` | Cache/queue provider |
| `STORAGE_PROVIDER` | ⬜ Optional | `mock` | `s3`, `mock` | File storage provider |

### Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ Always | `file:./dev.db` | PostgreSQL connection (pooled) |
| `DIRECT_URL` | ⬜ Optional | — | Direct PostgreSQL connection (migrations) |

### Supabase

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ When Supabase | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ When Supabase | — | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ When Supabase | — | Supabase admin key (server-side only) |

### AI

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ When Gemini | `mock-gemini-key` | Google Gemini API key |
| `OPENAI_API_KEY` | ✅ When OpenAI | `mock-openai-key` | OpenAI API key |
| `ANTHROPIC_API_KEY` | ✅ When Anthropic | — | Anthropic API key |

### Payments

| Variable | Required | Default | Description |
|---|---|---|---|
| `STRIPE_API_KEY` | ✅ When Stripe | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ When Stripe | — | Stripe webhook signing secret |

### Email

| Variable | Required | Default | Description |
|---|---|---|---|
| `RESEND_API_KEY` | ✅ When Resend | — | Resend API key |
| `ADMIN_EMAIL` | ⬜ Optional | `admin@filtercoffee.ai` | Admin notification email |

### Vector Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `QDRANT_URL` | ✅ When Qdrant | — | Qdrant instance URL |
| `QDRANT_API_KEY` | ⬜ Optional | — | Qdrant API key |

### Cache

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_URL` | ✅ When Redis | — | Redis connection string |

### Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ⬜ Recommended | `http://localhost:3000` | Public application URL |
| `NEXTAUTH_URL` | ⬜ Legacy | `http://localhost:3000` | NextAuth URL (unused) |
| `NEXTAUTH_SECRET` | ⬜ Legacy | fallback | NextAuth secret (unused) |

---

# 18. Third-Party Services Documentation

## 18.1 Service Dependency Map

```mermaid
flowchart LR
    App["FilterCoffee.AI"]

    App --> Supabase["Supabase
    Auth + PostgreSQL"]
    App --> Gemini["Google Gemini
    LLM + Embeddings"]
    App --> Stripe["Stripe
    Subscriptions"]
    App --> Resend["Resend
    Email Delivery"]
    App --> Qdrant["Qdrant
    Vector Search"]
    App --> Vercel["Vercel
    Hosting + Cron"]
    App --> GitHub["GitHub
    Source Control + CI"]
```

## 18.2 Service Details

| Service | Plan | Cost (est.) | SLA | Criticality |
|---|---|---|---|---|
| **Supabase** | Free/Pro | $0-25/mo | 99.9% | 🔴 Critical — auth + database |
| **Google Gemini** | Pay-per-use | ~$5-50/mo | 99.5% | 🟠 High — AI pipeline |
| **Stripe** | Pay-per-transaction | 2.9% + ₹2 | 99.99% | 🟠 High — billing |
| **Resend** | Free tier (100/day) | $0-20/mo | 99.9% | 🟠 High — digest delivery |
| **Qdrant** | Cloud free tier | $0-49/mo | 99.9% | 🟡 Medium — semantic search |
| **Vercel** | Hobby/Pro | $0-20/mo | 99.99% | 🔴 Critical — hosting |
| **GitHub** | Free | $0 | 99.95% | 🟡 Medium — source control |

## 18.3 Degradation Behavior

Every service has a **graceful degradation** path:

| Service Down | Fallback | User Impact |
|---|---|---|
| Gemini API | MockAiService (returns static summaries) | Summaries are generic |
| Qdrant | MockVectorService (in-memory cosine) | Search still works, less accurate |
| Stripe | MockPaymentService (instant upgrade) | Dev only — no real billing |
| Resend | MockEmailService (console log) | Emails not delivered |
| Redis | setTimeout scheduler | Jobs still run, no persistence |

---

# 19. AI System Documentation

## 19.1 AI Architecture

```mermaid
flowchart TD
    subgraph Input["Input Sources"]
        RSS["RSS Feeds"]
        API["API Feeds"]
        User["User Search Query"]
    end

    subgraph Embedding["Embedding Pipeline"]
        TextPrep["Text Preparation (title + content)"]
        GeminiEmbed["Gemini text-embedding-004"]
        VectorStore["Qdrant Vector Store (1536 dims)"]
    end

    subgraph Generation["Text Generation Pipeline"]
        SysPrompt["System Prompt Engineering"]
        GeminiFlash["Gemini 1.5 Flash"]
        JSONParse["JSON Output Parser"]
    end

    subgraph Output["Outputs"]
        StructuredSignal["Structured Signal JSON"]
        DigestMD["Morning Digest (Markdown)"]
        SearchResults["Semantic Search Results"]
    end

    RSS --> TextPrep
    API --> TextPrep
    TextPrep --> GeminiEmbed
    GeminiEmbed --> VectorStore
    VectorStore --> SearchResults
    User --> GeminiEmbed

    TextPrep --> SysPrompt
    SysPrompt --> GeminiFlash
    GeminiFlash --> JSONParse
    JSONParse --> StructuredSignal
    JSONParse --> DigestMD
```

## 19.2 Models Used

| Model | Provider | Purpose | Dimensions | Context |
|---|---|---|---|---|
| `gemini-1.5-flash` | Google | Text generation / summarization | — | ~1M tokens |
| `text-embedding-004` | Google | Vector embedding generation | 768 (padded to 1536) | — |

## 19.3 Prompt Architecture

### Signal Summarization Prompt

The system uses a **structured JSON extraction** prompt:

```
System: You are a premium AI news intelligence summarizer for FilterCoffee.ai.
Your goal is to parse raw news signals and output a JSON object with EXACTLY these fields:
- "body": Clear description (1-2 sentences)
- "tldr": Direct summary (1 sentence)
- "whyItMatters": Industry importance analysis (1-2 sentences)
- "careerImpact": Hiring/skills impact (1 sentence)
- "businessImpact": Corporate strategic effects (1 sentence)
- "confidenceScore": Integer 10-100
- "credibilityScore": Integer 10-100

Output ONLY raw JSON. No markdown.
```

### Digest Compilation Prompt

```
System: You are a premium business intelligence compiler at FilterCoffee.ai.
Structure your digest with:
1. ### What Changed — 3-4 bullet points, fact-driven
2. ### Why This Matters — 2-3 bullet points, strategic analysis
3. ### Sources — Clickable markdown links

No emojis. Professional, elegant tone.
```

## 19.4 Vector Database Schema

| Property | Value |
|---|---|
| **Collection Name** | `signals` |
| **Vector Size** | 1536 dimensions |
| **Distance Metric** | Cosine similarity |
| **Dedup Threshold** | 0.88 (during ingestion) |
| **Search Threshold** | 0.1 (during user search — broad) |

## 19.5 AI Cost Estimation

| Operation | Volume (est./day) | Cost per 1K | Daily Cost |
|---|---|---|---|
| Embedding generation | ~100 signals | ~$0.0001 | ~$0.01 |
| Text summarization | ~100 signals | ~$0.075 | ~$7.50 |
| Digest compilation | ~50 users | ~$0.15 | ~$7.50 |
| **Total estimated** | | | **~$15/day** |

---

# 20. Risks and Limitations

## 20.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API rate limiting during bulk ingestion | High | Medium | Implement exponential backoff and batch processing |
| Database connection exhaustion on Supabase free tier | Medium | High | Upgrade to Supabase Pro, implement connection pooling |
| Qdrant cloud outage affecting search | Low | Medium | MockVectorService fallback already implemented |
| Stripe webhook delivery failure | Low | High | Implement idempotent retry handling |
| RSS source format changes breaking parser | Medium | Low | Source health monitoring already tracks failures |

## 20.2 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Low conversion from free to paid | High | High | Improve premium gating, add more Pro/Power features |
| RSS sources blocking scraping | Medium | Medium | Rotate User-Agent, add rate limiting per source |
| Competitor launches similar product | Medium | Medium | Focus on personalization and email habit formation |
| AI costs exceeding revenue at scale | Medium | High | Implement usage-based pricing, cache LLM responses |

## 20.3 Operational Limitations

| Limitation | Description | Workaround |
|---|---|---|
| No multi-tenant isolation | All users share same database instance | Acceptable at current scale |
| No backup/restore process | Supabase daily backups only | Implement pg_dump scheduled exports |
| No staging environment | Changes deploy directly to production | Add Vercel preview deployments |
| No feature flags | All features are always on | Integrate LaunchDarkly or Vercel Feature Flags |
| Hourly ingestion only | Cron runs every 60 minutes | Increase frequency or switch to real-time webhooks |

---

# 21. Future Roadmap

## 21.1 30-Day Roadmap (Launch Preparation)

| Priority | Task | Category |
|---|---|---|
| 🔴 P0 | Remove all mock/seed data auto-population | Data Integrity |
| 🔴 P0 | Activate Stripe live mode with real price IDs | Payments |
| 🔴 P0 | Configure Resend with verified domain | Email |
| 🔴 P0 | Add rate limiting to public endpoints | Security |
| 🔴 P0 | Write unit tests for auth middleware and plan enforcement | Testing |
| 🟠 P1 | Add structured logging (Pino or Winston) | Observability |
| 🟠 P1 | Configure Sentry error monitoring | Monitoring |
| 🟠 P1 | Set up staging environment on Vercel | DevOps |
| 🟡 P2 | Lazy-load Three.js CoffeeCup component | Performance |
| 🟡 P2 | Remove unused `@clerk/nextjs` dependency | Cleanup |

## 21.2 90-Day Roadmap (Product-Market Fit)

| Priority | Task | Category |
|---|---|---|
| 🔴 P0 | Implement Qdrant Cloud for production vector search | Infrastructure |
| 🔴 P0 | Add webhook handler for Stripe subscription lifecycle | Payments |
| 🟠 P1 | Build user onboarding wizard (guided topic creation) | UX |
| 🟠 P1 | Add email digest scheduling (user-configurable delivery time) | Feature |
| 🟠 P1 | Implement Redis-backed BullMQ in production | Infrastructure |
| 🟡 P2 | Add social auth (Google, GitHub OAuth via Supabase) | Auth |
| 🟡 P2 | Build public API for signal access | API |
| 🟡 P2 | Add A/B testing framework for landing page conversion | Growth |

## 21.3 6-Month Roadmap (Scale)

| Priority | Task | Category |
|---|---|---|
| 🔴 P0 | Migrate to AWS ECS using Terraform configs | Infrastructure |
| 🔴 P0 | Implement RBAC with database-driven permissions | Security |
| 🟠 P1 | Build team/organization accounts | Feature |
| 🟠 P1 | Add Slack/Discord integration for digest delivery | Feature |
| 🟠 P1 | Implement real-time signal streaming (WebSockets) | Feature |
| 🟡 P2 | Build mobile app (React Native or PWA) | Platform |
| 🟡 P2 | Add custom report builder with export | Feature |
| 🟡 P2 | Implement multi-language support (i18n) | Localization |

## 21.4 12-Month Roadmap (Enterprise)

| Priority | Task | Category |
|---|---|---|
| 🔴 P0 | SOC 2 Type II compliance | Security |
| 🔴 P0 | Enterprise SSO (SAML, OIDC) | Auth |
| 🟠 P1 | Custom AI model fine-tuning per organization | AI |
| 🟠 P1 | White-label solution for B2B resale | Product |
| 🟡 P2 | Multi-region deployment (US, EU, APAC) | Infrastructure |
| 🟡 P2 | Build marketplace for custom source connectors | Platform |

---

# 22. Developer Onboarding Guide

## 22.1 Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | >= 20 | Runtime |
| npm | >= 10 | Package manager |
| Git | Latest | Version control |
| Docker Desktop | Latest | Local database stack |
| VS Code | Latest | Recommended IDE |

## 22.2 Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/tripletroubleoffz/FilterCoffeeAI-MC.git
cd FilterCoffeeAI-MC

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Start local database stack
docker-compose up -d

# 5. Generate Prisma client
npx prisma generate

# 6. Push schema to local database
npx prisma db push

# 7. Seed RSS sources
npm run db:seed

# 8. Start development server
npm run dev
```

## 22.3 Environment Configuration for Development

Edit `.env` with these minimum values for local development:

```env
# These use mock providers — no external API keys needed
AUTH_PROVIDER=supabase
NEXT_PUBLIC_AUTH_PROVIDER=supabase
PAYMENT_PROVIDER=mock
EMAIL_PROVIDER=mock
AI_PROVIDER=mock
VECTOR_PROVIDER=mock
CACHE_PROVIDER=mock

# Local PostgreSQL (from docker-compose)
DATABASE_URL=postgresql://postgres:password@localhost:5432/filtercoffee

# Supabase (get from your Supabase project dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 22.4 Key Development Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run worker` | Start background worker |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed RSS sources |
| `npm run db:clean` | Clean mock signal data |
| `npx prisma studio` | Open database GUI |

## 22.5 Architecture Quick Reference

| Question | Answer |
|---|---|
| Where are API routes? | `src/server/routers/*.ts` (tRPC) |
| Where is business logic? | `src/lib/worker.ts` (core pipeline) |
| Where are page components? | `src/app/*/page.tsx` (Next.js App Router) |
| How to add a new API? | Add procedure to existing router or create new router in `src/server/routers/` |
| How to add a new page? | Create `src/app/[route]/page.tsx` |
| How to add a new service? | Create directory in `src/lib/services/`, follow interface + proxy pattern |
| Where is auth enforced? | `src/server/trpc.ts` — `isAuthed` and `isAdmin` middleware |
| How are plans enforced? | `src/lib/constants.ts` + `topics.ts:createTopic` |

## 22.6 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "You must be logged in" error | Cookie not sent or token expired | Clear cookies, re-login, check Supabase keys |
| Prisma generate fails | Schema syntax error | Run `npx prisma validate` |
| Docker containers won't start | Port conflict | Check ports 5432, 6379, 6333 |
| Signals page is empty | No data seeded | Run `npm run db:seed` then trigger ingestion |
| AI summarization returns generic text | Mock AI provider active | Set `AI_PROVIDER=gemini` and add `GEMINI_API_KEY` |

---

# 23. Project Handover Documentation

## 23.1 Critical Knowledge Transfer

### For a New CTO

1. **Architecture is sound** — The provider pattern enables swapping any service without touching business logic
2. **Revenue engine is topic limits** — Free=1, Pro=5, Power=15 topics enforce plan upgrades
3. **Core pipeline is `worker.ts`** — 378 lines containing the entire ingestion and digest compilation logic
4. **Mock system is a feature** — Every service has a mock fallback, enabling zero-cost local development
5. **Database is the source of truth** — Qdrant is supplementary; the system works without it (keyword search fallback)

### For a New Engineering Team

1. All API logic is in **7 files** under `src/server/routers/`
2. All service integrations are in **7 directories** under `src/lib/services/`
3. The **Proxy + Strategy pattern** is used everywhere — understand `index.ts` in any service to understand all services
4. **tRPC middleware** handles auth — never check auth inside procedures, the middleware does it
5. **Prisma schema** is the definitive data model — `prisma/schema.prisma` has 16 models with clear relationships

### For Investors / Acquirers

1. **Monthly costs at 100 users:** ~$50 (Supabase Pro $25, Gemini $15, Vercel $0-20)
2. **Monthly costs at 10,000 users:** ~$500-1,000 (database scaling, AI costs)
3. **No vendor lock-in** — every service can be swapped (Supabase→Clerk, Gemini→OpenAI, Vercel→AWS)
4. **IP is in the pipeline** — ingestion, deduplication, summarization, and personalization logic
5. **Revenue per paying user:** ₹499-999/month (~$6-12/month)

### For Technical Auditors

1. **No raw SQL** — all queries via Prisma ORM (SQL injection protected)
2. **Input validation on 100% of endpoints** — Zod schemas on every tRPC procedure
3. **HTML sanitization** — `sanitize-html` strips all tags from ingested content
4. **Auth token validation** — Supabase admin SDK verifies JWTs server-side on every request
5. **Audit trail** — 11 action types logged to `AuditLog` table with user attribution

## 23.2 File Importance Ranking

| Rank | File | Why |
|---|---|---|
| 1 | `src/lib/worker.ts` | Core business engine — ingestion + digest pipeline |
| 2 | `src/server/trpc.ts` | Auth middleware — security gate for all APIs |
| 3 | `prisma/schema.prisma` | Database schema — source of truth for data model |
| 4 | `src/server/routers/signals.ts` | Signal CRUD + semantic search — largest router |
| 5 | `src/lib/services/auth/supabase.ts` | Auth token parsing — cookie/JWT handling |
| 6 | `src/lib/env.ts` | Environment validation — production safety net |
| 7 | `src/app/page.tsx` | Landing page — first impression, conversion page |
| 8 | `src/app/dashboard/layout.tsx` | Dashboard shell — navigation, subscription status |
| 9 | `src/lib/services/ai/gemini.ts` | Gemini integration — LLM + embedding calls |
| 10 | `src/lib/queue.ts` | Job queue — BullMQ with graceful fallback |

## 23.3 Deployment Checklist (Go-Live)

- [ ] Set all `*_PROVIDER` env vars to production values (not `mock`)
- [ ] Configure Stripe with real price IDs (`price_pro_monthly`, `price_power_monthly`)
- [ ] Verify Resend domain and update sender address
- [ ] Deploy Qdrant Cloud instance and set `QDRANT_URL`
- [ ] Remove or guard all `seedDefault*` auto-seed functions
- [ ] Run `npx prisma db push` against production database
- [ ] Seed production sources via `npm run db:seed`
- [ ] Configure Sentry DSN for error monitoring
- [ ] Set up Vercel preview deployments for staging
- [ ] Add rate limiting middleware
- [ ] Test full flow: Sign up → Create topic → Trigger ingestion → Receive digest email
- [ ] Configure custom domain and SSL
- [ ] Set up database backup schedule

---

> **End of Master Codebase Report**  
> *FilterCoffee.AI — Brewed Intelligence for the Modern AI Era*  
> *Document generated on June 15, 2026*
