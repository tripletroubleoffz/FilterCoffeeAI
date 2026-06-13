'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { Activity, Sparkles, TrendingUp, DollarSign, Users, Award, X, BookOpen, ArrowRight } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  growth: string;
  demand: string;
  salary: string;
  hiringCompanies: string[];
  resources: string[];
  description: string;
}

export default function SkillRadarPage() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const skills: Skill[] = [
    {
      id: 'agentic-ai',
      name: 'Agentic AI Orchestration',
      growth: '+124% YoY',
      demand: 'Critical (Peak recruitment)',
      salary: '$185,000 Median Base',
      hiringCompanies: ['OpenAI', 'Anthropic', 'Cognition AI'],
      resources: [
        'LangGraph State Machine Documentation',
        'Declarative YAML Orchestration schemas',
        'Auto-tuning agent reinforcement loops'
      ],
      description: 'Design and deployment of stateful, autonomous multi-agent hierarchies capable of planning and executing software-layer integrations.'
    },
    {
      id: 'rag-engineering',
      name: 'Advanced Graph RAG',
      growth: '+78% YoY',
      demand: 'High (Enterprise integrations)',
      salary: '$165,000 Median Base',
      hiringCompanies: ['Microsoft', 'Perplexity AI', 'Cohere'],
      resources: [
        'Knowledge Graph Entity Extraction schemas',
        'Hybrid Sparse-Dense Vector retrievals',
        'Context preservation sharding protocols'
      ],
      description: 'Mapping semantic relationships across enterprise libraries into graph stores to resolve accuracy bottlenecks in long context models.'
    },
    {
      id: 'vector-dbs',
      name: 'Vector DB Sharding & Tuning',
      growth: '+62% YoY',
      demand: 'High (Telemetry scaling)',
      salary: '$170,000 Median Base',
      hiringCompanies: ['Qdrant', 'Pinecone', 'Supabase'],
      resources: [
        'HNSW Index tuning parameters',
        'pgvector cluster partitioning layouts',
        'Semantic cache optimization frameworks'
      ],
      description: 'Administering, partitioning, and sharding dedicated embedding databases for low-latency similarity queries over billions of items.'
    },
    {
      id: 'llmops',
      name: 'LLMOps & Gateway Management',
      growth: '+45% YoY',
      demand: 'Steady (Enterprise ops)',
      salary: '$155,000 Median Base',
      hiringCompanies: ['Vercel', 'LangChain', 'Portkey'],
      resources: [
        'Semantic cache hit optimization',
        'API Gateway rate limit fallback routing',
        'Telemetry auditing & cost tracking patterns'
      ],
      description: 'Managing system gateways, cost tracking pipelines, rate limiting policies, and latency monitoring across multiple model providers.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
            <Activity className="w-6 h-6 text-coffee-accent animate-pulse" />
            Skill Radar
          </h1>
          <p className="text-xs text-coffee-text-muted">
            Interactive skill explorer map. Monitor talent supply trends, salary bounds, and learning paths.
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => setSelectedSkill(skill)}
              className="glass-panel p-6 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/90 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all duration-300 group relative"
            >
              <div className="h-[2px] w-full bg-gradient-to-r from-coffee-accent/20 via-coffee-accent to-coffee-accent/20 absolute top-0 left-0 right-0" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/20 font-bold uppercase">
                    Growth: {skill.growth}
                  </span>
                  <span className="text-emerald-400 font-bold">{skill.demand}</span>
                </div>

                <h3 className="text-sm font-display font-extrabold text-coffee-cream group-hover:text-white transition-colors">
                  {skill.name}
                </h3>

                <p className="text-xs text-coffee-text-muted line-clamp-2">
                  {skill.description}
                </p>
              </div>

              {/* Action trigger */}
              <div className="flex justify-between items-center pt-3 border-t border-coffee-border/10 mt-4 text-[10px] font-mono">
                <span className="text-coffee-text-muted group-hover:text-coffee-accent transition-all flex items-center gap-0.5">
                  Reveal learning roadmap <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-coffee-cream font-bold">{skill.salary}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Skill details Modal */}
        {selectedSkill && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg bg-[#0f0a08] border border-coffee-border/80 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="h-[3px] w-full bg-coffee-accent" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedSkill(null)}
                className="absolute top-4 right-4 p-2 text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 space-y-6 text-xs leading-relaxed">
                {/* Header */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded bg-[#070403] border border-coffee-accent/30 flex items-center justify-center text-coffee-accent font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-mono text-coffee-accent uppercase tracking-widest block">
                      AI Skill Profile
                    </span>
                    <h2 className="text-base font-display font-extrabold text-coffee-cream leading-snug">{selectedSkill.name}</h2>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[8px] font-mono text-coffee-accent uppercase tracking-wider">Skill Description</span>
                  <p className="text-coffee-cream/95 bg-[#070403] p-4 rounded border border-coffee-border/40">
                    {selectedSkill.description}
                  </p>
                </div>

                {/* Roadmaps / Resources */}
                <div className="space-y-2 bg-coffee-dark/20 p-4 rounded-lg border border-coffee-border/20">
                  <span className="font-bold text-coffee-cream flex items-center gap-1.5 text-[11px] pb-1 border-b border-coffee-border/30">
                    <BookOpen className="w-4 h-4 text-coffee-accent" />
                    Learning Resources & Roadmap
                  </span>
                  <ul className="space-y-2 pt-2 text-coffee-text-muted list-disc pl-4">
                    {selectedSkill.resources.map((res, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {res}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Telemetry info */}
                <div className="grid grid-cols-2 gap-4 bg-[#070403] p-3 rounded-lg border border-coffee-border/30 font-mono text-[10px] text-coffee-text-muted">
                  <div>Salary Benchmark: <span className="text-emerald-400 font-bold block">{selectedSkill.salary}</span></div>
                  <div className="text-right">Hiring Companies: <span className="text-coffee-cream font-bold block">{selectedSkill.hiringCompanies.join(', ')}</span></div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setSelectedSkill(null)}
                    className="px-5 py-2.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded-xl text-xs font-bold transition-all"
                  >
                    Dismiss Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
