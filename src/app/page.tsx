'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ShieldCheck, Flame, Cpu, TrendingUp, Briefcase, Calendar, Zap, LayoutDashboard } from 'lucide-react';
import { useAuth, UserButton } from '@clerk/nextjs';
import CoffeeCup from '@/components/CoffeeCup';
import SmoothScroll from '@/components/SmoothScroll';

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();

  const isMockClerk = process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'mock' ||
                      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
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
          <Link href="#pricing" className="hover:text-coffee-accent transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          {isLoaded && isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-semibold bg-coffee-dark hover:bg-coffee-border/30 text-f4eae4 border border-coffee-border/50 rounded-md transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <div className="bg-coffee-border/30 rounded-full p-0.5 border border-coffee-border/50">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-8 h-8 rounded-full',
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="px-4 py-2 text-xs font-semibold bg-coffee-accent hover:bg-coffee-accent-hover text-[#090504] rounded-md transition-all flex items-center gap-1.5 shadow-[0_4px_14px_rgba(194,136,84,0.3)]"
            >
              Start Brewing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
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
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.08] tracking-tight text-coffee-cream"
            >
              FilterCoffee<span className="text-coffee-accent">.ai</span> <br/>
              <span className="bg-gradient-to-r from-coffee-accent via-coffee-accent-hover to-[#ecc19a] bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl block mt-4">
                AI Intelligence Center for Professionals
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg font-bold text-coffee-accent uppercase tracking-wider"
            >
              Brewed Intelligence for the Modern AI Era
            </motion.p>

            <motion.p 
              variants={itemVariants} 
              className="text-base sm:text-lg text-coffee-text-muted max-w-xl leading-relaxed"
            >
              AI, Finance, Career and Market Signals curated into one morning briefing. Blending Stripe aesthetics with Perplexity-style summaries and Bloomberg-style market indicators.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
              {isLoaded && isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-sm font-semibold rounded-md text-center transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(194,136,84,0.35)]"
                >
                  Enter Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-6 py-3.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-sm font-semibold rounded-md text-center transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(194,136,84,0.35)]"
                >
                  Start Brewing <ArrowRight className="w-4 h-4" />
                </Link>
              )}
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

      {/* Section 8: AI Pulse Terminal (Live Hub) */}
      <section className="py-24 px-6 md:px-12 bg-[#0a0604] border-y border-coffee-border/20">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coffee-card border border-coffee-border/50 text-coffee-accent text-[10px] font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Fresh Roast Dashboard
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-coffee-cream">
              Live AI Intelligence Café
            </h2>
            <p className="text-coffee-text-muted text-xs md:text-sm">
              An aggregate view of Live Feeds, Model Releases, Venture Capital, and Tech Markets. Updated in real time.
            </p>
          </div>

          {/* Interactive Bloomberg-style Terminal Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT STREAM: Live Brew Feed & Model Wars */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Freshly Brewed Today */}
              <div className="glass-panel rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 overflow-hidden shadow-xl">
                <div className="border-b border-coffee-border/30 bg-coffee-dark/50 px-6 py-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-coffee-cream uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-coffee-accent animate-pulse" />
                    Freshly Brewed Today (Signals Stream)
                  </span>
                  <span className="text-[10px] font-mono text-coffee-text-muted">Interval: 1 min</span>
                </div>
                <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  
                  {/* Signal 1 */}
                  <div className="flex gap-4 items-start border-b border-coffee-border/20 pb-4">
                    <span className="text-[10px] font-mono font-bold text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/10 mt-0.5 shrink-0">
                      AI
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-coffee-cream">OpenAI Launches GPT-5 Preview with Native Multi-Agent Orchestration</h4>
                      <p className="text-[11px] text-coffee-text-muted leading-relaxed">
                        Features native agent coordination allowing developers to define complex hierarchies directly in API calls. 
                        <strong> Impact:</strong> Shifts UI frameworks toward agentic state systems.
                      </p>
                    </div>
                  </div>

                  {/* Signal 2 */}
                  <div className="flex gap-4 items-start border-b border-coffee-border/20 pb-4">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10 mt-0.5 shrink-0">
                      FINANCE
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-coffee-cream">Physical Intelligence Closes $400M Seed Round for Robot Control Software</h4>
                      <p className="text-[11px] text-coffee-text-muted leading-relaxed">
                        Bezos Expeditions and OpenAI back universal control models for physical movement.
                        <strong> Valuation:</strong> $2.4B post-money.
                      </p>
                    </div>
                  </div>

                  {/* Signal 3 */}
                  <div className="flex gap-4 items-start">
                    <span className="text-[10px] font-mono font-bold text-coffee-text-muted bg-[#070403] px-2 py-0.5 rounded border border-coffee-border/40 mt-0.5 shrink-0">
                      RESEARCH
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-coffee-cream">DeepMind Unveils AlphaFold 3: Modeling Protein-DNA Interactions</h4>
                      <p className="text-[11px] text-coffee-text-muted leading-relaxed">
                        Predicts interactions of life's molecules (DNA, RNA, chemical compounds) in silico.
                        <strong> Research:</strong> Speeds drug validation times by 80%.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Model Wars */}
              <div className="glass-panel rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 overflow-hidden shadow-xl">
                <div className="border-b border-coffee-border/30 bg-coffee-dark/50 px-6 py-4">
                  <span className="text-xs font-bold text-coffee-cream uppercase tracking-wide">Model Wars (Benchmark Matrix)</span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-coffee-border/30 text-coffee-text-muted font-mono uppercase text-[9px]">
                        <th className="pb-3">Model</th>
                        <th className="pb-3">MMLU</th>
                        <th className="pb-3">Context Window</th>
                        <th className="pb-3">Strategic Feature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-border/10 font-mono text-coffee-cream">
                      <tr>
                        <td className="py-3.5 font-bold text-white">GPT-5 Preview</td>
                        <td className="py-3.5 text-emerald-400">91.2%</td>
                        <td className="py-3.5">256k tokens</td>
                        <td className="py-3.5 text-coffee-text-muted font-sans">Native YAML Multi-Agent routing</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 font-bold text-white">Claude 3.5 Opus</td>
                        <td className="py-3.5 text-emerald-400">89.8%</td>
                        <td className="py-3.5">500k tokens</td>
                        <td className="py-3.5 text-coffee-text-muted font-sans">Graph context routing reduces hallucinations</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 font-bold text-white">Gemini 1.5 Pro</td>
                        <td className="py-3.5 text-emerald-400">86.4%</td>
                        <td className="py-3.5">2.0M tokens</td>
                        <td className="py-3.5 text-coffee-text-muted font-sans">Real-time multi-modal streaming feed inputs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR: Markets, Careers, & Radar */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* AI Market Pulse */}
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4 shadow-xl">
                <span className="text-xs font-bold text-coffee-cream uppercase tracking-wide block border-b border-coffee-border/20 pb-2">
                  AI Market Pulse
                </span>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-coffee-cream font-bold">NVIDIA (NVDA)</span>
                    <span className="text-emerald-400 font-extrabold">+4.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-coffee-cream font-bold">Microsoft (MSFT)</span>
                    <span className="text-emerald-400 font-extrabold">+1.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-coffee-cream font-bold">NASDAQ 100</span>
                    <span className="text-emerald-400 font-extrabold">+1.8%</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-coffee-border/20 pt-2 text-[10px] text-coffee-text-muted">
                    <span>Fed Interest Rate</span>
                    <span>5.25% (Held)</span>
                  </div>
                </div>
              </div>

              {/* Career Radar */}
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4 shadow-xl">
                <span className="text-xs font-bold text-coffee-cream uppercase tracking-wide block border-b border-coffee-border/20 pb-2">
                  Career Radar (Skills Cloud)
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-coffee-dark border border-coffee-border/60 rounded text-[10px] font-bold text-white">
                    Rust <span className="text-emerald-400 font-mono">+28%</span>
                  </span>
                  <span className="px-2.5 py-1 bg-coffee-dark border border-coffee-border/60 rounded text-[10px] font-bold text-white">
                    AI Agents <span className="text-emerald-400 font-mono">+42%</span>
                  </span>
                  <span className="px-2.5 py-1 bg-coffee-dark border border-coffee-border/60 rounded text-[10px] font-bold text-white">
                    Vector DBs <span className="text-emerald-400 font-mono">+35%</span>
                  </span>
                  <span className="px-2.5 py-1 bg-coffee-dark border border-coffee-border/60 rounded text-[10px] font-bold text-white">
                    Next.js <span className="text-emerald-400 font-mono">+18%</span>
                  </span>
                </div>
              </div>

              {/* Startup & Funding Radar */}
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4 shadow-xl">
                <span className="text-xs font-bold text-coffee-cream uppercase tracking-wide block border-b border-coffee-border/20 pb-2">
                  Startup & Funding Radar
                </span>
                <div className="space-y-3 text-[11px] text-coffee-cream">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-coffee-accent uppercase">Acquisition</span>
                    <p className="font-bold leading-snug">OpenAI acquires Rockset to scale real-time search sharding databases.</p>
                  </div>
                  <div className="space-y-1 border-t border-coffee-border/10 pt-2">
                    <span className="text-[9px] font-mono text-coffee-accent uppercase">Funding</span>
                    <p className="font-bold leading-snug">Qdrant raises $45M Series B funding led by Benchmark Capital.</p>
                  </div>
                </div>
              </div>

            </div>

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
            <Link href="/privacy-policy" className="hover:text-coffee-cream transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-coffee-cream transition-colors">Terms of Service</Link>
            <a href="mailto:admin@filtercoffee.ai" className="hover:text-coffee-cream transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </SmoothScroll>
  );
}
