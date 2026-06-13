'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { Search, Loader2, Cpu, Coffee, Briefcase, CreditCard, Radio, TrendingUp, HelpCircle } from 'lucide-react';

type SearchCategory = 'ALL' | 'SIGNALS' | 'COMPANIES' | 'MODELS' | 'CAREER' | 'FUNDING' | 'MARKET';

export default function CoffeeSearchPage() {
  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchCategory>('ALL');

  // Fetch search results
  const { data: results, isLoading, isError } = trpc.signals.search.useQuery(
    { query: submittedQuery, category: activeTab },
    { enabled: submittedQuery.length > 0 }
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchInput.trim());
  };

  const getImportanceColor = (score: number) => {
    if (score >= 9.5) return 'text-red-400 border-red-500/30 bg-red-950/20';
    if (score >= 9.0) return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
    return 'text-coffee-accent border-coffee-accent/30 bg-coffee-card';
  };

  const tabs: { label: string; value: SearchCategory }[] = [
    { label: 'All Blend', value: 'ALL' },
    { label: 'Brew Signals', value: 'SIGNALS' },
    { label: 'AI Models', value: 'MODELS' },
    { label: 'Companies', value: 'COMPANIES' },
    { label: 'Career Roast', value: 'CAREER' },
    { label: 'Funding Radar', value: 'FUNDING' },
    { label: 'Market Pulse', value: 'MARKET' },
  ];

  const hasResults = results && (
    (results.signals?.length || 0) +
    (results.models?.length || 0) +
    (results.companies?.length || 0) +
    (results.career?.length || 0) +
    (results.funding?.length || 0) +
    (results.market?.length || 0)
  ) > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
            <Search className="w-6 h-6 text-coffee-accent" />
            Coffee Search
          </h1>
          <p className="text-xs text-coffee-text-muted">
            Intelligent semantic search indexing model architectures, hiring trends, venture funding, and market movements.
          </p>
        </div>

        {/* Search input Form */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search OpenAI, context windows, Rust, Series A valuations, GPU clusters..."
            className="w-full pl-12 pr-24 py-3.5 bg-[#0f0a08]/90 border border-coffee-border/40 hover:border-coffee-accent/60 focus:border-coffee-accent focus:ring-1 focus:ring-coffee-accent rounded-xl text-xs text-coffee-cream placeholder-coffee-text-muted outline-none transition-all duration-300 shadow-lg"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-coffee-text-muted" />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-bold rounded-lg transition-colors shadow-md shadow-coffee-accent/10"
          >
            Brew Query
          </button>
        </form>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-coffee-border/20 pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                // Re-trigger if query is already present
                if (submittedQuery) {
                  setSubmittedQuery(submittedQuery);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? 'bg-coffee-accent text-[#090504]'
                  : 'text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading / Results Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
            <p className="text-xs text-coffee-text-muted">Distilling semantic matches...</p>
          </div>
        ) : submittedQuery === '' ? (
          <div className="glass-panel p-16 rounded-xl text-center space-y-4 max-w-md mx-auto mt-6">
            <Coffee className="w-10 h-10 text-coffee-accent mx-auto animate-pulse" />
            <h3 className="text-sm font-bold text-coffee-cream font-display">Brew Your First Search</h3>
            <p className="text-xs text-coffee-text-muted leading-relaxed">
              Enter a query above to execute semantic matches against our live vector indexes.
            </p>
          </div>
        ) : !hasResults ? (
          <div className="glass-panel p-12 rounded-xl text-center space-y-4 max-w-md mx-auto mt-6">
            <HelpCircle className="w-10 h-10 text-coffee-accent mx-auto" />
            <h3 className="text-sm font-bold text-coffee-cream">No Semantic Matches</h3>
            <p className="text-xs text-coffee-text-muted leading-relaxed">
              We couldn't find any results for "{submittedQuery}" in {tabs.find(t => t.value === activeTab)?.label}. Try revising your query keywords.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Signals Result List */}
            {results.signals && results.signals.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-coffee-accent font-mono border-b border-coffee-border/20 pb-1.5 flex items-center gap-2">
                  <Radio className="w-4 h-4" /> Brew Signals ({results.signals.length})
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {results.signals.map((sig: any) => (
                    <div
                      key={sig.id}
                      className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/85 space-y-3 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-coffee-accent bg-[#070403] px-1.5 py-0.2 rounded border border-coffee-accent/20">
                              {sig.category}
                            </span>
                            {sig.similarity !== undefined && (
                              <span className="text-[9px] font-mono font-semibold text-emerald-400">
                                Match: {(sig.similarity * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-display font-extrabold text-coffee-cream mt-1.5">
                            {sig.title}
                          </h4>
                        </div>
                        <div className={`px-2 py-0.5 rounded border text-[9px] font-bold font-mono ${getImportanceColor(sig.score || 8.0)}`}>
                          PULSE: {(sig.score || 8.0).toFixed(1)}
                        </div>
                      </div>
                      <p className="text-xs text-coffee-text-muted leading-relaxed">{sig.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Models Result List */}
            {results.models && results.models.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-coffee-accent font-mono border-b border-coffee-border/20 pb-1.5 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> AI Models ({results.models.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.models.map((model: any) => {
                    let specs: any = {};
                    try {
                      specs = JSON.parse(model.description);
                    } catch (e) {
                      specs.capabilities = model.description;
                    }
                    return (
                      <div
                        key={model.id}
                        className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/85 space-y-3 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono font-bold text-coffee-accent bg-[#070403] px-1.5 py-0.2 rounded border border-coffee-accent/20">
                            {model.company}
                          </span>
                          <span className="text-[9px] font-mono text-coffee-text-muted">{specs.releaseDate}</span>
                        </div>
                        <h4 className="text-sm font-display font-extrabold text-coffee-cream">{model.title}</h4>
                        <div className="text-[10px] font-mono grid grid-cols-2 gap-2 bg-[#070403]/60 p-2.5 rounded border border-coffee-border/30">
                          <div>Context: <span className="text-coffee-cream font-bold">{specs.contextWindow}</span></div>
                          <div>MMLU: <span className="text-coffee-cream font-bold">{specs.mmlu}</span></div>
                        </div>
                        <p className="text-xs text-coffee-text-muted line-clamp-2">{specs.capabilities}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Companies Result List */}
            {results.companies && results.companies.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-coffee-accent font-mono border-b border-coffee-border/20 pb-1.5 flex items-center gap-2">
                  <Coffee className="w-4 h-4" /> Companies ({results.companies.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.companies.map((comp: any) => {
                    let specs: any = {};
                    try {
                      specs = JSON.parse(comp.description);
                    } catch (e) {
                      specs.funding = comp.description;
                    }
                    return (
                      <div
                        key={comp.id}
                        className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/85 space-y-3 transition-all duration-300"
                      >
                        <span className="text-[9px] font-mono font-bold text-coffee-accent bg-[#070403] px-1.5 py-0.2 rounded border border-coffee-accent/20">
                          {comp.company}
                        </span>
                        <h4 className="text-sm font-display font-extrabold text-coffee-cream">{comp.title}</h4>
                        <div className="text-[10px] space-y-1 bg-[#070403]/60 p-2.5 rounded border border-coffee-border/30 text-coffee-text-muted">
                          <div><strong className="text-coffee-cream">Funding:</strong> {specs.funding}</div>
                          {specs.strategicMoves && <div><strong className="text-coffee-cream">Strategic:</strong> {specs.strategicMoves}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Career Result List */}
            {results.career && results.career.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-coffee-accent font-mono border-b border-coffee-border/20 pb-1.5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Career Roast ({results.career.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.career.map((car: any) => (
                    <div
                      key={car.id}
                      className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/85 space-y-2 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-coffee-accent bg-[#070403] px-1.5 py-0.2 rounded border border-coffee-accent/20">
                          {car.type}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">+{car.change}% growth</span>
                      </div>
                      <h4 className="text-sm font-display font-extrabold text-coffee-cream">{car.name}</h4>
                      <p className="text-xs text-coffee-text-muted">{car.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Funding Result List */}
            {results.funding && results.funding.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-coffee-accent font-mono border-b border-coffee-border/20 pb-1.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Funding Radar ({results.funding.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.funding.map((fund: any) => (
                    <div
                      key={fund.id}
                      className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/85 space-y-2 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-display font-extrabold text-coffee-cream">{fund.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-400">+{fund.change}%</span>
                      </div>
                      <p className="text-xs text-coffee-cream/80 bg-[#070403]/60 p-2.5 rounded border border-coffee-border/20">{fund.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Result List */}
            {results.market && results.market.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-coffee-accent font-mono border-b border-coffee-border/20 pb-1.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Market Pulse ({results.market.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.market.map((mark: any) => (
                    <div
                      key={mark.id}
                      className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/85 space-y-2 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-coffee-cream font-mono">{mark.name}</span>
                        <span className={`text-[10px] font-bold ${mark.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {mark.change >= 0 ? '+' : ''}{mark.change}%
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-coffee-cream font-mono">
                        {mark.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <p className="text-[10px] text-coffee-text-muted leading-relaxed">{mark.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
