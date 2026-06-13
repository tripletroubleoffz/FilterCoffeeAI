'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { BookOpen, RefreshCw, Sparkles, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface TechNode {
  id: string;
  name: string;
  stage: 'Innovators' | 'Early Adopters' | 'Early Majority' | 'Late Majority' | 'Laggards';
  x: number; // percentage on curve (0 - 100)
  y: number; // height on S-curve (0 - 100)
  description: string;
  adoptionRate: string;
  salaryPremium: string;
  growthMoM: string;
  strategicAdvice: string;
}

export default function MonthlyBlendPage() {
  const [selectedTech, setSelectedTech] = useState<TechNode | null>(null);

  const techNodes: TechNode[] = [
    {
      id: 'gpt-5',
      name: 'GPT-5 Multi-Agent YAML',
      stage: 'Innovators',
      x: 12,
      y: 10,
      description: 'Declarative multi-agent state machines defined directly in model orchestration profiles, bypassing standard imperative client wrappers.',
      adoptionRate: '3.4% of AI teams',
      salaryPremium: '+48%',
      growthMoM: '+124%',
      strategicAdvice: 'Train core engineering staff in declarative orchestrations; deprecate basic sequential prompt models.'
    },
    {
      id: 'agentic-ui',
      name: 'Agentic UI (Lovable, Bolt)',
      stage: 'Early Adopters',
      x: 32,
      y: 35,
      description: 'Real-time generation of custom interface components compiled on-the-fly by models based on user workflow requirements.',
      adoptionRate: '14.8% of startups',
      salaryPremium: '+35%',
      growthMoM: '+62%',
      strategicAdvice: 'Adopt generative UI components for personalized enterprise control panels; reduces static frontend boilerplate code by 80%.'
    },
    {
      id: 'rag-graph',
      name: 'Graph RAG Ingestion',
      stage: 'Early Majority',
      x: 55,
      y: 72,
      description: 'Extracting knowledge graphs from document blocks to map semantic relationships, preventing context loss in long window prompts.',
      adoptionRate: '38.2% of enterprises',
      salaryPremium: '+22%',
      growthMoM: '+28%',
      strategicAdvice: 'Integrate relational database entity mapping with vector sharding to resolve enterprise RAG hallucination bottlenecks.'
    },
    {
      id: 'pgvector',
      name: 'Relational Vector DBs (pgvector)',
      stage: 'Early Majority',
      x: 68,
      y: 84,
      description: 'Storing high-dimensional embeddings directly in primary transactional systems rather than standalone vector shards.',
      adoptionRate: '46.1% of deployments',
      salaryPremium: '+18%',
      growthMoM: '+15%',
      strategicAdvice: 'Consolidate vector indexing into existing Postgres systems using pgvector to reduce data pipeline latency.'
    },
    {
      id: 'standard-chatbots',
      name: 'Sequential Q&A Chatbots',
      stage: 'Late Majority',
      x: 88,
      y: 95,
      description: 'Simple single-turn prompt-response systems used for standard FAQ retrievals and basic customer interactions.',
      adoptionRate: '88.5% of companies',
      salaryPremium: '0% (Baseline)',
      growthMoM: '-8%',
      strategicAdvice: 'Deprecate sequential chat interfaces; user engagement is transitioning to proactive multi-agent support.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-coffee-accent" />
            Monthly Blend (Adoption Curves)
          </h1>
          <p className="text-xs text-coffee-text-muted">
            Track technological maturity, developer adoption, and base salary premiums across active AI paradigms.
          </p>
        </div>

        {/* Adoption curve visual map */}
        <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4">
          <h3 className="text-xs font-mono uppercase text-coffee-accent tracking-widest flex items-center gap-1.5 border-b border-coffee-border/20 pb-2">
            <TrendingUp className="w-4 h-4" /> AI Technology Adoption S-Curve
          </h3>

          <div className="relative w-full h-64 md:h-80 bg-[#070403] border border-coffee-border/30 rounded-xl overflow-hidden px-4 md:px-8 py-6 flex flex-col justify-between select-none">
            {/* SVG Adoption S-Curve line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <path
                d="M 50 280 C 250 280, 250 20, 500 20 C 750 20, 750 20, 950 20"
                fill="none"
                stroke="rgba(44, 31, 27, 0.6)"
                strokeWidth="4"
              />
              <path
                d="M 50 280 C 250 280, 250 20, 500 20 C 750 20, 750 20, 950 20"
                fill="none"
                stroke="#c28854"
                strokeWidth="2.5"
                strokeDasharray="8 4"
                className="opacity-70"
              />
            </svg>

            {/* Clickable interactive technology points plotted on S-curve */}
            {techNodes.map((tech) => {
              // Convert coordinate system percentages
              const leftOffset = `${tech.x}%`;
              const bottomOffset = `${tech.y}%`;
              const isSelected = selectedTech?.id === tech.id;
              
              return (
                <button
                  key={tech.id}
                  onClick={() => setSelectedTech(tech)}
                  style={{ left: leftOffset, bottom: bottomOffset }}
                  className={`absolute transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-300 z-10`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#070403] transition-all ${
                    isSelected 
                      ? 'bg-coffee-cream border-coffee-accent scale-150 shadow-[0_0_12px_#c28854]' 
                      : 'bg-coffee-accent group-hover:scale-125'
                  }`} />
                  <span className={`text-[8.5px] font-mono font-bold mt-1.5 px-2 py-0.5 rounded border transition-colors whitespace-nowrap bg-[#0f0a08] ${
                    isSelected 
                      ? 'text-coffee-accent border-coffee-accent' 
                      : 'text-coffee-cream border-coffee-border/60 group-hover:border-coffee-accent'
                  }`}>
                    {tech.name}
                  </span>
                </button>
              );
            })}

            {/* Stage regions markers on bottom axis */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-6 text-[8px] font-mono uppercase text-coffee-text-muted tracking-widest border-t border-coffee-border/20 pt-2">
              <span>Innovators (0-10%)</span>
              <span>Early Adopters (10-33%)</span>
              <span>Early Majority (33-66%)</span>
              <span>Late Majority (66-88%)</span>
              <span>Laggards (88-100%)</span>
            </div>
          </div>
        </div>

        {/* Detailed active panel block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            {selectedTech ? (
              <div className="glass-panel p-6 rounded-xl border border-coffee-accent/40 bg-gradient-to-b from-[#120a08] to-[#070403] space-y-5">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-coffee-accent bg-[#070403] border border-coffee-accent/20 px-2 py-0.5 rounded">
                      {selectedTech.stage} Stage
                    </span>
                    <h3 className="text-base font-display font-extrabold text-coffee-cream pt-1">
                      {selectedTech.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-mono uppercase text-coffee-text-muted">Salary Premium</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-400 flex items-center gap-0.5 justify-end">
                      <DollarSign className="w-4 h-4" /> {selectedTech.salaryPremium}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[8.5px] font-mono text-coffee-accent uppercase tracking-wider">Maturity Description</span>
                  <p className="text-xs text-coffee-cream leading-relaxed bg-[#070403] p-4 rounded-lg border border-coffee-border/40">
                    {selectedTech.description}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 text-xs font-mono py-2 bg-coffee-dark/40 rounded-lg p-3 border border-coffee-border/20">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-coffee-text-muted uppercase">Market Penetration</span>
                    <p className="text-coffee-cream font-bold">{selectedTech.adoptionRate}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-coffee-text-muted uppercase">MoM Growth Rate</span>
                    <p className="text-emerald-400 font-bold">{selectedTech.growthMoM}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-coffee-text-muted uppercase">Adoption Pulse</span>
                    <p className="text-coffee-cream font-bold flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-coffee-accent animate-pulse" /> Accelerated
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-coffee-border/20">
                  <span className="block text-[8.5px] font-mono text-coffee-accent uppercase tracking-wider">Executive Advice</span>
                  <p className="text-xs text-coffee-text-muted leading-relaxed italic">
                    "{selectedTech.strategicAdvice}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-16 text-center rounded-xl border border-coffee-border/40 bg-[#0f0a08]/30 space-y-4">
                <TrendingUp className="w-8 h-8 text-coffee-accent/40 mx-auto animate-pulse" />
                <h3 className="text-sm font-bold font-display text-coffee-cream">Select a Technology Node</h3>
                <p className="text-xs text-coffee-text-muted max-w-sm mx-auto leading-relaxed">
                  Click on any technology indicator plotted on the S-Curve above to load market adoption metrics, salary indexes, and strategic deployment roadmaps.
                </p>
              </div>
            )}
          </div>

          {/* Quick Blend Stats */}
          <div className="lg:col-span-4 glass-panel p-5 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/70 space-y-4">
            <h3 className="text-xs font-mono uppercase text-coffee-accent tracking-widest flex items-center gap-1 border-b border-coffee-border/20 pb-2">
              <Sparkles className="w-3.5 h-3.5" /> Blend Insights
            </h3>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-[#070403] rounded border border-coffee-border/40 space-y-1">
                <span className="text-coffee-accent font-bold">Accelerating Phase</span>
                <p className="text-[11px] text-coffee-text-muted">Agentic interfaces are moving rapidly from innovators into early adopter segments.</p>
              </div>
              <div className="p-3 bg-[#070403] rounded border border-coffee-border/40 space-y-1">
                <span className="text-coffee-accent font-bold">Consolidation Phase</span>
                <p className="text-[11px] text-coffee-text-muted">Standalone vector stores are facing saturation as relational database extensions take precedence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
