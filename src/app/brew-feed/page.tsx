'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { Bookmark, BookmarkCheck, Clock, Radio, Award, AlertCircle, RefreshCw, Search, Mic } from 'lucide-react';

import HubHeader from '@/components/HubHeader';

export default function BrewFeedPage() {
  const [category, setCategory] = useState<'AI' | 'Finance' | 'Career' | 'General' | undefined>(undefined);
  const { data: signals, isLoading, refetch, isRefetching } = trpc.signals.getSignals.useQuery({ category });
  const bookmarkMutation = trpc.signals.toggleBookmark.useMutation();
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Record<string, boolean>>({});

  const handleToggleBookmark = async (title: string, url: string) => {
    try {
      const result = await bookmarkMutation.mutateAsync({ title, url });
      setBookmarkedUrls(prev => ({
        ...prev,
        [url]: result.bookmarked
      }));
    } catch (e) {
      console.error('Failed to toggle bookmark:', e);
    }
  };

  const getImportanceColor = (score: number) => {
    if (score >= 9.5) return 'text-red-400 border-red-500/30 bg-red-950/20';
    if (score >= 9.0) return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
    return 'text-coffee-accent border-coffee-accent/30 bg-coffee-card';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <HubHeader 
          title="Intelligence Hub" 
          subtitle="Real-time parsed and summarized intelligence stream for AI professionals."
          icon={Search}
          tabs={[
            { name: 'Feed', href: '/brew-feed', icon: Radio },
            { name: 'Search', href: '/coffee-search', icon: Search },
            { name: 'Voice', href: '/dashboard/voice-agent', icon: Mic },
          ]}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-coffee-cream">Live Signals Stream</span>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Categories Tab */}
        <div className="flex gap-2 border-b border-coffee-border/30 pb-3">
          {(['ALL', 'AI', 'Finance', 'Career', 'General'] as const).map((cat) => {
            const isSelected = cat === 'ALL' ? category === undefined : category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'ALL' ? undefined : cat)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-coffee-accent text-[#090504]' 
                    : 'text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Stream */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-coffee-accent animate-spin" />
            <p className="text-xs text-coffee-text-muted">Filtering news inputs...</p>
          </div>
        ) : !signals || signals.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center space-y-4 max-w-md mx-auto mt-12">
            <AlertCircle className="w-8 h-8 text-coffee-accent mx-auto" />
            <h3 className="text-sm font-bold text-coffee-cream">No Active Signals</h3>
            <p className="text-xs text-coffee-text-muted">Check back later or try clearing your search filter tags.</p>
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:top-4 before:bottom-4 before:left-4 before:w-[1px] before:bg-coffee-border/50">
            {signals.map((signal) => {
              // Parse structured JSON metadata if present
              let parsedContent: any = null;
              try {
                parsedContent = JSON.parse(signal.content);
              } catch (e) {
                // Not JSON, handle as plain text
                parsedContent = {
                  body: signal.content,
                  tldr: signal.content,
                  whyItMatters: 'General intelligence update.',
                  careerImpact: 'No direct skillset impact analyzed.',
                  businessImpact: 'Operational optimizations.',
                  confidenceScore: 80,
                  credibilityScore: 85
                };
              }

              const isSaved = bookmarkedUrls[signal.url || ''] !== undefined 
                ? bookmarkedUrls[signal.url || ''] 
                : false;

              return (
                <div key={signal.id} className="relative pl-12 group">
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-coffee-border border-2 border-[#070403] group-hover:border-coffee-accent group-hover:bg-coffee-accent transition-all duration-300" />
                  
                  {/* Card container */}
                  <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 hover:border-coffee-border/80 bg-[#0f0a08]/80 space-y-4 shadow-lg transition-all duration-300">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/20">
                          {signal.category}
                        </span>
                        <h3 className="text-base font-display font-extrabold text-coffee-cream group-hover:text-white transition-colors mt-2">
                          {signal.title}
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] text-coffee-text-muted font-mono pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(signal.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {signal.source && (
                            <span>Source: {signal.source.name}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Importance Score badge */}
                        <div className={`px-2 py-1 rounded border text-[10px] font-bold font-mono ${getImportanceColor(signal.score || 8.0)}`}>
                          PULSE: {(signal.score || 8.0).toFixed(1)}
                        </div>
                        {/* Bookmark / Save Bean */}
                        <button
                          onClick={() => handleToggleBookmark(signal.title, signal.url || '')}
                          title={isSaved ? "Saved Bean" : "Save Bean"}
                          className={`p-2 rounded-lg border transition-colors ${
                            isSaved
                              ? 'bg-coffee-accent/10 border-coffee-accent text-coffee-accent'
                              : 'bg-coffee-dark border-coffee-border/60 text-coffee-text-muted hover:border-coffee-accent hover:text-coffee-cream'
                          }`}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* TL;DR section */}
                    <div className="p-4 bg-[#070403] border border-coffee-border/40 rounded-lg text-xs leading-relaxed text-coffee-cream">
                      <p className="font-semibold text-coffee-accent mb-1 uppercase tracking-wider text-[9px] font-mono">TL;DR</p>
                      <p>{parsedContent.tldr}</p>
                    </div>

                    {/* Editorial Layout Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
                      <div className="space-y-1 bg-coffee-dark/30 p-3.5 rounded-lg border border-coffee-border/20">
                        <h4 className="font-bold text-coffee-cream border-b border-coffee-border/40 pb-1 flex items-center gap-1.5 text-[10.5px]">
                          <Award className="w-3.5 h-3.5 text-coffee-accent" />
                          Why It Matters
                        </h4>
                        <p className="text-coffee-text-muted leading-relaxed pt-1.5">
                          {parsedContent.whyItMatters}
                        </p>
                      </div>

                      <div className="space-y-1 bg-coffee-dark/30 p-3.5 rounded-lg border border-coffee-border/20">
                        <h4 className="font-bold text-coffee-cream border-b border-coffee-border/40 pb-1 flex items-center gap-1.5 text-[10.5px]">
                          <Award className="w-3.5 h-3.5 text-coffee-accent" />
                          Career Impact
                        </h4>
                        <p className="text-coffee-text-muted leading-relaxed pt-1.5">
                          {parsedContent.careerImpact}
                        </p>
                      </div>
                    </div>

                    {/* Credibility Indicator */}
                    <div className="flex gap-6 pt-3 text-[10px] font-mono border-t border-coffee-border/20 text-coffee-text-muted">
                      <div>
                        Confidence Score:{' '}
                        <span className="text-emerald-500 font-bold">{parsedContent.confidenceScore}%</span>
                      </div>
                      <div>
                        Source Credibility:{' '}
                        <span className="text-emerald-500 font-bold">{parsedContent.credibilityScore}%</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
