'use client';

import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Radio, Loader2, Bookmark, BookmarkCheck, ExternalLink, Calendar, Filter } from 'lucide-react';

export default function SignalFeedPage() {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'AI' | 'Finance' | 'Career'>('ALL');
  
  const signalsQuery = trpc.signals.getSignals.useQuery({
    category: activeCategory === 'ALL' ? undefined : activeCategory,
    limit: 30,
  });

  const bookmarksQuery = trpc.signals.getBookmarks.useQuery();
  const toggleBookmarkMutation = trpc.signals.toggleBookmark.useMutation({
    onSuccess: () => {
      bookmarksQuery.refetch();
    },
  });

  const isBookmarked = (url: string) => {
    return bookmarksQuery.data?.some(b => b.url === url) || false;
  };

  const categories = ['ALL', 'AI', 'Finance', 'Career'] as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-coffee-cream">Signal Feed</h1>
          <p className="text-xs text-coffee-text-muted">Real-time parsed business intelligence signals from collection pipelines.</p>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-1.5 p-1 bg-coffee-dark rounded-lg border border-coffee-border/40 w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded text-[11px] font-semibold tracking-wide transition-all ${
                activeCategory === cat
                  ? 'bg-coffee-accent text-[#090504]'
                  : 'text-coffee-text-muted hover:text-coffee-cream'
              }`}
            >
              {cat === 'ALL' ? 'All Signals' : cat}
            </button>
          ))}
        </div>
      </div>

      {signalsQuery.isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
          <p className="text-xs text-coffee-text-muted mt-2">Filtering signal feeds...</p>
        </div>
      ) : !signalsQuery.data || signalsQuery.data.length === 0 ? (
        <div className="flex-1 glass-panel p-12 rounded-xl flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 mt-8">
          <div className="w-12 h-12 rounded-full bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-accent/20">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-coffee-cream">No Signals Found</h3>
            <p className="text-xs text-coffee-text-muted">
              We couldn't find any signals in this category. Make sure your ingestion pipelines are configured and running in the Admin Console.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-start">
          {signalsQuery.data.map((signal) => {
            const bookmarked = isBookmarked(signal.url || '');
            return (
              <div 
                key={signal.id} 
                className="glass-panel p-6 rounded-xl flex flex-col justify-between h-fit gap-4 border border-coffee-border/50 bg-[#0e0907]/60 glass-panel-hover"
              >
                <div className="space-y-3">
                  {/* Card Header metadata */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        signal.category === 'AI' 
                          ? 'bg-purple-950/50 text-purple-200 border border-purple-800/30' 
                          : signal.category === 'Finance'
                          ? 'bg-emerald-950/50 text-emerald-200 border border-emerald-800/30'
                          : 'bg-amber-950/50 text-amber-200 border border-amber-800/30'
                      }`}>
                        {signal.category}
                      </span>
                      <span className="text-[10px] text-coffee-text-muted font-mono">
                        {signal.source?.name || 'External Stream'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => toggleBookmarkMutation.mutate({ title: signal.title, url: signal.url || '' })}
                      className="text-coffee-text-muted hover:text-coffee-accent transition-colors"
                      title={bookmarked ? 'Remove Bookmark' : 'Save Signal'}
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="w-4.5 h-4.5 text-coffee-accent" />
                      ) : (
                        <Bookmark className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-display font-extrabold text-coffee-cream leading-snug">
                    {signal.title}
                  </h3>

                  {/* Body summary */}
                  <p className="text-[12px] text-coffee-text-muted leading-relaxed">
                    {signal.content}
                  </p>
                </div>

                {/* Footer URL / Time */}
                <div className="border-t border-coffee-border/20 pt-4 flex justify-between items-center text-[10px] text-coffee-text-muted">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(signal.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {signal.url && (
                    <a
                      href={signal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-coffee-accent hover:underline"
                    >
                      <span>View Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
