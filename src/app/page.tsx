'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ShieldCheck, Flame, Cpu, TrendingUp, Briefcase, Calendar, Zap } from 'lucide-react';
import CoffeeCup from '@/components/CoffeeCup';
import SmoothScroll from '@/components/SmoothScroll';

export default function LandingPage() {
  const isMockClerk = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('mock');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <SmoothScroll>
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-coffee-border/30 h-16 flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-6 h-6 text-coffee-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <path d="M6 2v3" />
            <path d="M10 2v3" />
            <path d="M14 2v3" />
          </svg>
          <span className="font-display font-extrabold text-lg tracking-wider text-f4eae4">
            FILTERCOFFEE<span className="text-coffee-accent">.AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-coffee-text-muted">
          <Link href="#features" className="hover:text-coffee-accent transition-colors">Features</Link>
          <Link href="#pillars" className="hover:text-coffee-accent transition-colors">Intelligence</Link>
          <Link href="#sample" className="hover:text-coffee-accent transition-colors">Sample Briefing</Link>
          <Link href="#pricing" className="hover:text-coffee-accent transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="text-sm font-medium hover:text-coffee-accent transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-xs font-semibold bg-coffee-accent hover:bg-coffee-accent-hover text-[#090504] rounded-md transition-all flex items-center gap-1.5 shadow-[0_4px_14px_rgba(194,136,84,0.3)]"
          >
            Start Brewing <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d120d] via-background to-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          <motion.div 
            className="lg:col-span-7 space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coffee-card border border-coffee-border/50 text-coffee-accent text-xs font-semibold tracking-wide">
              <Zap className="w-3.5 h-3.5" /> Phase 1 Live - B2C Personal Intelligence Feed
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.08] tracking-tight text-coffee-cream"
            >
              Brewed Intelligence <br/>
              <span className="bg-gradient-to-r from-coffee-accent via-coffee-accent-hover to-[#ecc19a] bg-clip-text text-transparent">
                for Professionals.
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants} 
              className="text-base sm:text-lg text-coffee-text-muted max-w-xl leading-relaxed"
            >
              AI, Finance, Career and Market Signals curated into one morning briefing. Blending Stripe aesthetics with Perplexity-style summaries and Bloomberg-style market indicators.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-sm font-semibold rounded-md text-center transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(194,136,84,0.35)]"
              >
                Start Brewing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#sample"
                className="px-6 py-3.5 glass-panel hover:bg-coffee-border/30 text-coffee-cream text-sm font-semibold rounded-md text-center transition-all flex items-center justify-center gap-2"
              >
                View Sample Briefing
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-full max-w-[450px] aspect-square relative bg-gradient-to-b from-coffee-card/30 to-transparent rounded-full border border-coffee-border/20 p-8">
              <CoffeeCup />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2, 3, 4: What Changed */}
      <section id="features" className="py-24 px-6 md:px-12 border-t border-coffee-border/20 bg-coffee-dark/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-coffee-cream">Timeframes of Intelligence</h2>
            <p className="text-coffee-text-muted text-sm md:text-base">We summarize noise at three distinct zoom levels so you always see both the trees and the forest.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Weekly */}
            <div className="glass-panel glass-panel-hover p-8 rounded-xl space-y-6">
              <div className="w-10 h-10 rounded-lg bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-border/50">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-display font-bold text-coffee-cream">What Changed This Week</h3>
              <p className="text-coffee-text-muted text-sm leading-relaxed">
                A daily aggregation of technical launches, model releases, and corporate investments. Perfect for tactical updates and immediate professional adjustments.
              </p>
              <ul className="space-y-3 pt-2 text-xs text-coffee-cream/80">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-coffee-accent mt-0.5 shrink-0" />
                  <span>Deduplicated feed of RSS & blog articles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-coffee-accent mt-0.5 shrink-0" />
                  <span>Custom inclusion and exclusion tags</span>
                </li>
              </ul>
            </div>

            {/* Monthly */}
            <div className="glass-panel glass-panel-hover p-8 rounded-xl space-y-6">
              <div className="w-10 h-10 rounded-lg bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-border/50">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-display font-bold text-coffee-cream">What Changed This Month</h3>
              <p className="text-coffee-text-muted text-sm leading-relaxed">
                Clustered thematic summaries showing macro shifts, consolidated funding rounds, interest rate changes, and technology adoption momentum.
              </p>
              <ul className="space-y-3 pt-2 text-xs text-coffee-cream/80">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-coffee-accent mt-0.5 shrink-0" />
                  <span>Thematic clusters matching your job profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-coffee-accent mt-0.5 shrink-0" />
                  <span>Macroeconomic impact reports</span>
                </li>
              </ul>
            </div>

            {/* Yearly */}
            <div className="glass-panel glass-panel-hover p-8 rounded-xl space-y-6">
              <div className="w-10 h-10 rounded-lg bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-border/50">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-display font-bold text-coffee-cream">What Changed This Year</h3>
              <p className="text-coffee-text-muted text-sm leading-relaxed">
                Comprehensive strategic reviews pointing out declining skillsets, emerging technology roles, and corporate performance indices.
              </p>
              <ul className="space-y-3 pt-2 text-xs text-coffee-cream/80">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-coffee-accent mt-0.5 shrink-0" />
                  <span>Salary benchmarks and hiring rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-coffee-accent mt-0.5 shrink-0" />
                  <span>Long-term strategic roadmap analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5, 6, 7: Core Intelligence Pillars */}
      <section id="pillars" className="py-24 px-6 md:px-12 border-t border-coffee-border/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-coffee-cream">Core Pillars of Platform Signal Feed</h2>
            <p className="text-coffee-text-muted text-sm md:text-base">We digest hundreds of inputs daily to feed the three fundamental pillars that impact your career growth.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Pillar */}
            <div className="glass-panel p-8 rounded-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-border/50">
                  <Cpu className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-lg font-display font-bold text-coffee-cream">AI Intelligence</h3>
              </div>
              <p className="text-coffee-text-muted text-xs leading-relaxed">
                Deduplicated reports on OpenAI API releases, Anthropic models, deep learning research breakthroughs, hugging face metrics, and framework integrations.
              </p>
              <div className="p-4 bg-background/50 border border-coffee-border/30 rounded-lg text-xs space-y-2">
                <div className="text-coffee-accent font-semibold uppercase tracking-wider text-[10px]">Recent Signal Summary</div>
                <div className="text-coffee-cream font-medium">GPT-5 Preview released. Focus is on declarative YAML agent state orchestration APIs.</div>
              </div>
            </div>

            {/* Finance Pillar */}
            <div className="glass-panel p-8 rounded-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-border/50">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-lg font-display font-bold text-coffee-cream">Finance Intelligence</h3>
              </div>
              <p className="text-coffee-text-muted text-xs leading-relaxed">
                Real-time parsing of Federal Reserve interest rate announcements, tech acquisitions, Series A/B startup funding rounds, and software multiples.
              </p>
              <div className="p-4 bg-background/50 border border-coffee-border/30 rounded-lg text-xs space-y-2">
                <div className="text-coffee-accent font-semibold uppercase tracking-wider text-[10px]">Recent Signal Summary</div>
                <div className="text-coffee-cream font-medium">Qdrant closes $45M Series B funding round to scale real-time vector database partitioning.</div>
              </div>
            </div>

            {/* Career Pillar */}
            <div className="glass-panel p-8 rounded-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-border/50">
                  <Briefcase className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-lg font-display font-bold text-coffee-cream">Career Intelligence</h3>
              </div>
              <p className="text-coffee-text-muted text-xs leading-relaxed">
                Identification of growing programming languages, salary trends, job openings metrics, declining stacks, and emerging professional descriptions.
              </p>
              <div className="p-4 bg-background/50 border border-coffee-border/30 rounded-lg text-xs space-y-2">
                <div className="text-coffee-accent font-semibold uppercase tracking-wider text-[10px]">Recent Signal Summary</div>
                <div className="text-coffee-cream font-medium">Rust demand grows 28% YoY as companies migrate cloud microservices to optimize runtime costs.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Trending Skills Cloud */}
      <section className="py-20 px-6 md:px-12 bg-coffee-dark/20 border-y border-coffee-border/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-coffee-cream">Trending Skill & Platform Signals</h2>
          <p className="text-coffee-text-muted text-sm max-w-xl mx-auto">
            Our ingestion pipelines run vector-clustering algorithms on job descriptions and commits to discover rising skills.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            <span className="px-4 py-2 rounded-lg bg-coffee-card border border-coffee-border/50 text-xs font-semibold text-coffee-cream flex items-center gap-1.5">
              Rust <span className="text-[#4e8f69] font-bold">+28.4%</span>
            </span>
            <span className="px-4 py-2 rounded-lg bg-coffee-card border border-coffee-border/50 text-xs font-semibold text-coffee-cream flex items-center gap-1.5">
              AI Orchestration <span className="text-[#4e8f69] font-bold">+42.6%</span>
            </span>
            <span className="px-4 py-2 rounded-lg bg-coffee-card border border-coffee-border/50 text-xs font-semibold text-coffee-cream flex items-center gap-1.5">
              Next.js 15 <span className="text-[#4e8f69] font-bold">+18.1%</span>
            </span>
            <span className="px-4 py-2 rounded-lg bg-coffee-card border border-coffee-border/50 text-xs font-semibold text-coffee-cream flex items-center gap-1.5">
              Vector Sharding <span className="text-[#4e8f69] font-bold">+35.0%</span>
            </span>
            <span className="px-4 py-2 rounded-lg bg-coffee-card border border-coffee-border/50 text-xs font-semibold text-coffee-cream flex items-center gap-1.5">
              Tailwind CSS v4 <span className="text-[#4e8f69] font-bold">+65.0%</span>
            </span>
            <span className="px-4 py-2 rounded-lg bg-coffee-card border border-coffee-border/50 text-xs font-semibold text-[#a5968f] flex items-center gap-1.5">
              Basic Bootstrap <span className="text-[#c25953] font-bold">-18.2%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Section 9: How It Works */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-coffee-cream">How FilterCoffee Brews</h2>
            <p className="text-coffee-text-muted text-sm">Quiet processing that translates daily noise into clarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-coffee-border/30 border border-coffee-accent/30 flex items-center justify-center text-coffee-accent font-display font-bold mx-auto md:mx-0">
                1
              </div>
              <h3 className="text-lg font-display font-bold text-coffee-cream">Define Your Topics</h3>
              <p className="text-coffee-text-muted text-xs leading-relaxed">
                Provide keywords you care about (e.g. "Next.js", "Startups"). Define exclusions to block generic press releases.
              </p>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-coffee-border/30 border border-coffee-accent/30 flex items-center justify-center text-coffee-accent font-display font-bold mx-auto md:mx-0">
                2
              </div>
              <h3 className="text-lg font-display font-bold text-coffee-cream">AI Ingests & Deduplicates</h3>
              <p className="text-coffee-text-muted text-xs leading-relaxed">
                Our workers fetch RSS, API news, and github changes. Qdrant vector models strip duplicates and cluster relevance.
              </p>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-coffee-border/30 border border-coffee-accent/30 flex items-center justify-center text-coffee-accent font-display font-bold mx-auto md:mx-0">
                3
              </div>
              <h3 className="text-lg font-display font-bold text-coffee-cream">Morning Delivery</h3>
              <p className="text-coffee-text-muted text-xs leading-relaxed">
                Every morning, wake up to a single concise email digest listing precisely what changed and why it matters. No distraction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Sample Briefing */}
      <section id="sample" className="py-24 px-6 md:px-12 bg-coffee-dark/30 border-t border-coffee-border/20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-display font-extrabold text-coffee-cream">The Morning Ritual Briefing</h2>
            <p className="text-coffee-text-muted text-sm">Designed for high-information density, low-anxiety. Read in less than 5 minutes.</p>
          </div>

          <div className="glass-panel p-8 md:p-12 rounded-2xl shadow-2xl border border-coffee-border/60 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-coffee-accent" />
            <div className="flex justify-between items-center border-b border-coffee-border/30 pb-6 mb-6">
              <div>
                <h4 className="font-display font-extrabold text-base tracking-wider text-coffee-cream">FILTERCOFFEE.AI</h4>
                <p className="text-[10px] text-coffee-text-muted font-mono uppercase">Briefing // Daily Digest</p>
              </div>
              <div className="text-right text-xs text-coffee-text-muted font-mono">
                Date: Jun 8, 2026
              </div>
            </div>

            <div className="space-y-8 text-sm md:text-base">
              <div className="space-y-3">
                <h5 className="font-display font-bold text-coffee-accent text-sm md:text-base border-l-2 border-coffee-accent pl-3">
                  What Changed
                </h5>
                <ul className="list-disc list-inside pl-1 space-y-2 text-coffee-cream/90 leading-relaxed text-xs md:text-sm">
                  <li>
                    <strong>OpenAI releases GPT-5 Preview:</strong> Standardizes native agent orchestration APIs, enabling direct multi-agent pipeline routing.
                  </li>
                  <li>
                    <strong>Federal Reserve rates decision:</strong> Rates held steady at 5.25% as CPI numbers hover above long term target rates.
                  </li>
                  <li>
                    <strong>Hiring surge in Systems Programming:</strong> Remote infrastructure openings requiring Rust grow by 28% quarter-on-quarter.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h5 className="font-display font-bold text-coffee-accent text-sm md:text-base border-l-2 border-coffee-accent pl-3">
                  Why It Matters
                </h5>
                <ul className="list-disc list-inside pl-1 space-y-2 text-coffee-cream/90 leading-relaxed text-xs md:text-sm">
                  <li>
                    <strong>Agent-Native Architecture:</strong> Software teams must transition from writing imperative pipelines to orchestrating stateful agent interfaces.
                  </li>
                  <li>
                    <strong>Cloud Margin Optimization:</strong> High hosting costs are driving migrations from resource-intensive runtimes (Node) to memory-safe compiled options (Rust).
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h5 className="font-display font-bold text-coffee-accent text-sm md:text-base border-l-2 border-coffee-accent pl-3">
                  Sources
                </h5>
                <div className="flex flex-wrap gap-4 text-xs font-mono pl-1">
                  <a href="#" className="text-coffee-accent hover:underline">openai.com/blog</a>
                  <a href="#" className="text-coffee-accent hover:underline">federalreserve.gov</a>
                  <a href="#" className="text-coffee-accent hover:underline">github.com/trends</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11: Pricing */}
      <section id="pricing" className="py-24 px-6 md:px-12 border-t border-coffee-border/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-coffee-cream">Subscription Plans</h2>
            <p className="text-coffee-text-muted text-sm">Select the volume of signals matches your daily business intelligence ingestion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="glass-panel p-8 rounded-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-coffee-text-muted uppercase tracking-wider">Free</div>
                <div className="font-display text-4xl font-extrabold text-coffee-cream">₹0</div>
                <div className="text-xs text-coffee-text-muted">For basic tracking.</div>
                <div className="border-t border-coffee-border/20 pt-6 space-y-3 text-xs text-coffee-cream/80">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>1 Active Topic feed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Weekly Summary Digest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Email & Dashboard access</span>
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="w-full py-2.5 bg-coffee-border/40 hover:bg-coffee-border/60 text-coffee-cream text-center text-xs font-semibold rounded transition-colors block mt-6"
              >
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="glass-panel p-8 rounded-xl border border-coffee-accent/40 space-y-6 flex flex-col justify-between relative shadow-[0_10px_35px_-5px_rgba(194,136,84,0.15)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-coffee-accent text-[#090504] font-display font-extrabold text-[10px] uppercase rounded-full tracking-wider shadow">
                Recommended
              </div>
              <div className="space-y-4">
                <div className="text-xs font-bold text-coffee-accent uppercase tracking-wider">Pro</div>
                <div className="font-display text-4xl font-extrabold text-coffee-cream">₹499<span className="text-xs text-coffee-text-muted">/month</span></div>
                <div className="text-xs text-coffee-text-muted">For builders and operators.</div>
                <div className="border-t border-coffee-border/20 pt-6 space-y-3 text-xs text-coffee-cream/80">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>5 Active Topic feeds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Daily Morning Summary Digest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Exclusion keyword filters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Bookmarks & Saved Reports</span>
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="w-full py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-center text-xs font-semibold rounded transition-colors block mt-6 shadow-[0_4px_14px_rgba(194,136,84,0.25)]"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Power */}
            <div className="glass-panel p-8 rounded-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-coffee-text-muted uppercase tracking-wider">Power</div>
                <div className="font-display text-4xl font-extrabold text-coffee-cream">₹999<span className="text-xs text-coffee-text-muted">/month</span></div>
                <div className="text-xs text-coffee-text-muted">For founders and executives.</div>
                <div className="border-t border-coffee-border/20 pt-6 space-y-3 text-xs text-coffee-cream/80">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>15 Active Topic feeds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Daily + Weekly Digests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Priority background ingestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Complete History Export</span>
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="w-full py-2.5 bg-coffee-border/40 hover:bg-coffee-border/60 text-coffee-cream text-center text-xs font-semibold rounded transition-colors block mt-6"
              >
                Start Power
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-coffee-dark border-t border-coffee-border/20 py-12 px-6 md:px-12 text-xs text-coffee-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-coffee-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            </svg>
            <span className="font-display font-extrabold text-sm tracking-wider text-f4eae4">
              FILTERCOFFEE.AI
            </span>
          </div>
          <p>© 2026 FilterCoffee.ai. Built for high-signal operators. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-coffee-cream transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-coffee-cream transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </SmoothScroll>
  );
}
