'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { Search, Loader2, Radio, Calendar, Filter, Sparkles, SlidersHorizontal, ExternalLink } from 'lucide-react';

export default function SignalExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'AI' | 'Finance' | 'Career' | 'General'>('ALL');
  const [minScore, setMinScore] = useState<number>(7.0);

  // Call the search endpoint
  const { data: searchResults, isLoading } = trpc.signals.search.useQuery(
    { 
      query: searchQuery || 'AI', // fallback to load initial data
      category: 'SIGNALS' 
    }
  );

  const getImportanceColor = (score: number) => {
    if (score >= 9.5) return 'text-red-400 border-red-500/30 bg-red-950/20';
    if (score >= 9.0) return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
    return 'text-coffee-accent border-coffee-accent/30 bg-coffee-card';
  };

  const signals = searchResults?.signals || [];
  const filteredSignals = signals.filter(s => {
    const matchesCategory = activeCategory === 'ALL' || s.category === activeCategory;
    const matchesScore = (s.score || 8.0) >= minScore;
    return matchesCategory && matchesScore;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
            <Radio className="w-6 h-6 text-coffee-accent animate-pulse" />
            Signal Explorer
          </h1>
          <p className="text-xs text-coffee-text-muted">
            Advanced multi-filter database explorer sync\'d with Qdrant vector sharding indexes.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-panel p-5 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search semantic keywords (e.g. OpenAI, compiler, sharding, seed round)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#070403] border border-coffee-border/60 focus:border-coffee-accent rounded-lg text-xs text-coffee-cream placeholder-coffee-text-muted outline-none transition-colors"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-coffee-text-muted" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs">
            {/* Category tabs */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-coffee-text-muted uppercase tracking-widest block">Filter Category</span>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {(['ALL', 'AI', 'Finance', 'Career', 'General'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded text-[10px] font-semibold tracking-wide transition-all ${
                      activeCategory === cat
                        ? 'bg-coffee-accent text-[#090504]'
                        : 'text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Score slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-mono text-coffee-text-muted uppercase tracking-widest">
                <span>Minimum Pulse Score</span>
                <span className="text-coffee-accent font-bold">{minScore.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full h-1 bg-coffee-border rounded-lg appearance-none cursor-pointer accent-coffee-accent"
              />
            </div>
          </div>
        </div>

        {/* Signals grid */}
        {isLoading ? (
          <div className="glass-panel p-20 rounded-xl flex justify-center">
            <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center space-y-4 max-w-md mx-auto mt-6">
            <Filter className="w-8 h-8 text-coffee-accent mx-auto" />
            <h3 className="text-sm font-bold text-coffee-cream">No Matching Signals</h3>
            <p className="text-xs text-coffee-text-muted">No signals found matching that keyword, category, or min pulse threshold.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSignals.map((sig: any) => (
              <div
                key={sig.id}
                className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/85 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div className="h-[2px] w-full bg-gradient-to-r from-coffee-accent/10 via-coffee-accent to-coffee-accent/10 absolute top-0 left-0 right-0" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/20 font-bold uppercase">
                        {sig.category}
                      </span>
                      {sig.source?.name && <span className="text-coffee-text-muted">{sig.source.name}</span>}
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getImportanceColor(sig.score || 8.0)}`}>
                      PULSE: {(sig.score || 8.0).toFixed(1)}
                    </span>
                  </div>

                  <h3 className="text-sm font-display font-extrabold text-coffee-cream group-hover:text-white transition-colors">
                    {sig.title}
                  </h3>

                  <p className="text-xs text-coffee-text-muted leading-relaxed line-clamp-3">
                    {sig.content.startsWith('{') ? JSON.parse(sig.content).tldr : sig.content}
                  </p>
                </div>

                {/* Footer link */}
                {sig.url && (
                  <div className="pt-3 border-t border-coffee-border/10 mt-3 flex justify-between items-center text-[10px]">
                    <span className="text-coffee-text-muted font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(sig.publishedAt).toLocaleDateString()}
                    </span>
                    <a
                      href={sig.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coffee-accent hover:underline flex items-center gap-1 font-mono uppercase"
                    >
                      View Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
