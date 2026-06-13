'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { BookOpen, RefreshCw, Bookmark, Clock, Award, AlertCircle, X, Search, FileText } from 'lucide-react';
import BrewingLoader from '@/components/BrewingLoader';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  publishedDate: string;
  citations: number;
  tldr: string;
  whyItMatters: string;
  category: 'REASONING' | 'MULTIMODAL' | 'BIOINFORMATICS' | 'AGENTIC';
}

export default function ResearchLabPage() {
  const { data: signals, isLoading, refetch, isRefetching } = trpc.signals.getSignals.useQuery({ category: 'General' });
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'REASONING' | 'MULTIMODAL' | 'BIOINFORMATICS' | 'AGENTIC'>('ALL');

  const papers: ResearchPaper[] = [
    {
      id: 'paper-1',
      title: 'AlphaFold 3: Structure Predictions of RNA/DNA Interactions',
      authors: 'John Jumper, Demis Hassabis et al. (Google DeepMind)',
      publishedDate: 'May 2026',
      citations: 240,
      tldr: 'Model modeling interactions of all life molecules including proteins, chemical compounds, DNA, and RNA, enabling complete simulation of candidate compounds before physical trial validation.',
      whyItMatters: 'Reduces pre-clinical therapeutic validation windows from years to days, allowing pharmaceutical companies to validate compound bindings in silico.',
      category: 'BIOINFORMATICS'
    },
    {
      id: 'paper-2',
      title: 'Graph RAG: Graph-based Retrieval-Augmented Generation for Long Document Contexts',
      authors: 'Microsoft Research Team',
      publishedDate: 'Mar 2026',
      citations: 185,
      tldr: 'Extracting semantic relationship entity graphs from raw document chunks to preserve global properties in long token window inputs.',
      whyItMatters: 'Resolves structural hallucination problems when querying massive enterprise compliance libraries or legacy code repositories.',
      category: 'REASONING'
    },
    {
      id: 'paper-3',
      title: 'Declarative Multi-Agent State Machine Hierarchies',
      authors: 'OpenAI Developer Group',
      publishedDate: 'Jan 2026',
      citations: 110,
      tldr: 'Defining multi-agent coordination frameworks natively in API compilation profiles to coordinate reasoning sub-tasks recursively.',
      whyItMatters: 'Eliminates complex imperative orchestration wrappers (like LangChain) and improves sub-task execution latency by 35%.',
      category: 'AGENTIC'
    }
  ];

  const filteredPapers = papers.filter(p => {
    if (filterCategory === 'ALL') return true;
    return p.category === filterCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-coffee-accent animate-pulse" />
              Research Lab
            </h1>
            <p className="text-xs text-coffee-text-muted">
              Explore ArXiv breakthrough papers, algorithm indexes, and academic citations impacting industry AI pipelines.
            </p>
          </div>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Lab</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-coffee-border/20">
          {(['ALL', 'REASONING', 'MULTIMODAL', 'BIOINFORMATICS', 'AGENTIC'] as const).map((cat) => {
            const label = cat === 'ALL' ? 'All Publications' : cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-coffee-accent text-[#090504]'
                    : 'text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Papers list */}
        <div className="space-y-4">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              onClick={() => setSelectedPaper(paper)}
              className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/85 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between relative group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/20">
                      {paper.category}
                    </span>
                    <span className="text-[9px] text-coffee-text-muted font-mono">{paper.publishedDate}</span>
                  </div>
                  <h3 className="text-sm font-display font-extrabold text-coffee-cream group-hover:text-white transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-[10px] text-coffee-text-muted font-mono">{paper.authors}</p>
                </div>
                <div className="text-right text-[10px] font-mono shrink-0">
                  <span className="block text-[8px] text-coffee-text-muted uppercase">Citations</span>
                  <span className="text-coffee-cream font-bold">{paper.citations} references</span>
                </div>
              </div>

              {/* Action trigger */}
              <div className="text-right pt-3 border-t border-coffee-border/10 mt-3">
                <span className="text-[10px] font-bold text-coffee-accent group-hover:underline">
                  Analyze Abstract & Implications →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Research detail Modal */}
        {selectedPaper && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg bg-[#0f0a08] border border-coffee-border/80 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="h-[3px] w-full bg-coffee-accent" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPaper(null)}
                className="absolute top-4 right-4 p-2 text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 space-y-6 text-xs leading-relaxed">
                {/* Header */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded bg-[#070403] border border-coffee-accent/30 flex items-center justify-center text-coffee-accent font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-mono text-coffee-accent uppercase tracking-widest block">
                      ArXiv {selectedPaper.category} Paper
                    </span>
                    <h2 className="text-base font-display font-extrabold text-coffee-cream leading-snug">{selectedPaper.title}</h2>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[8px] font-mono text-coffee-accent uppercase tracking-wider">Abstract TL;DR</span>
                  <p className="text-coffee-cream/95 bg-[#070403] p-4 rounded border border-coffee-border/40">
                    {selectedPaper.tldr}
                  </p>
                </div>

                <div className="space-y-1.5 bg-coffee-dark/20 p-4 rounded-lg border border-coffee-border/20">
                  <span className="font-bold text-coffee-cream flex items-center gap-1.5 text-[11px]">
                    <Award className="w-4 h-4 text-coffee-accent" />
                    Strategic Impact & Discovery Implications
                  </span>
                  <p className="text-coffee-text-muted leading-relaxed pt-1">
                    {selectedPaper.whyItMatters}
                  </p>
                </div>

                {/* Telemetry info */}
                <div className="grid grid-cols-2 gap-4 bg-[#070403] p-3 rounded-lg border border-coffee-border/30 font-mono text-[10px] text-coffee-text-muted">
                  <div>Authors: <span className="text-coffee-cream font-bold truncate block">{selectedPaper.authors}</span></div>
                  <div className="text-right">Citation Count: <span className="text-emerald-400 font-bold">{selectedPaper.citations} logs</span></div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setSelectedPaper(null)}
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
