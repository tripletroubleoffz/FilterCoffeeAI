'use client';

import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { MailOpen, Calendar, ArrowRight, Loader2, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function MorningBriefingsPage() {
  const { data: digests, isLoading, refetch } = trpc.signals.getBriefings.useQuery();
  const [selectedDigestId, setSelectedDigestId] = useState<string | null>(null);

  // Selected digest
  const selectedDigest = digests?.find((d) => d.id === selectedDigestId) || digests?.[0];

  // Helper to format briefing content into modern elements
  const formatBriefingHtml = (markdown: string) => {
    return markdown
      .replace(/### (.*)/g, '<h4 style="font-size: 15px; font-weight: 700; color: #c28854; margin-top: 25px; margin-bottom: 12px; border-left: 2px solid #c28854; padding-left: 8px;">$1</h4>')
      .replace(/- \*\*(.*?)\*\*(.*)/g, '<li style="margin-bottom: 8px; font-size: 13.5px; line-height: 1.6;"><strong style="color: #ecdcd3;">$1</strong>$2</li>')
      .replace(/- (.*)/g, '<li style="margin-bottom: 8px; font-size: 13.5px; line-height: 1.6;">$1</li>')
      .replace(/\n\n/g, '<br/>');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-coffee-cream">Brewing Room</h1>
        <p className="text-xs text-coffee-text-muted">Your customized briefings, brewed daily according to your topic keywords.</p>
      </div>


      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
          <p className="text-xs text-coffee-text-muted mt-2">Pouring your coffee...</p>
        </div>
      ) : !digests || digests.length === 0 ? (
        <div className="flex-1 glass-panel p-12 rounded-xl flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 mt-8">
          <div className="w-16 h-16 rounded-full bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-accent/20">
            <MailOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-display font-bold text-coffee-cream">Your Cup is Empty</h3>
            <p className="text-xs text-coffee-text-muted max-w-sm">
              We haven't brewed a digest for you yet. First, configure your Topic Feeds so we know what topics to track.
            </p>
          </div>
          <Link
            href="/dashboard/topics"
            className="px-5 py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-[0_4px_12px_rgba(194,136,84,0.25)]"
          >
            Configure Topics <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          {/* Briefings List */}
          <div className="lg:col-span-4 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
            <div className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider px-1">Briefing Archives</div>
            {digests.map((digest) => {
              const isSelected = selectedDigest?.id === digest.id;
              return (
                <button
                  key={digest.id}
                  onClick={() => setSelectedDigestId(digest.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-coffee-card border-coffee-accent shadow-md shadow-coffee-accent/5'
                      : 'bg-[#0b0705]/50 border-coffee-border/40 hover:bg-coffee-card/50 hover:border-coffee-border/70'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`text-xs font-bold font-display ${isSelected ? 'text-coffee-accent' : 'text-coffee-cream'}`}>
                      {digest.title}
                    </span>
                    <span className="text-[9px] font-mono text-coffee-text-muted bg-[#070403] px-1.5 py-0.5 rounded border border-coffee-border/20">
                      {digest.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-coffee-text-muted">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(digest.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Briefing Viewer */}
          <div className="lg:col-span-8">
            {selectedDigest && (
              <div className="glass-panel rounded-xl p-8 md:p-10 border border-coffee-border/80 relative overflow-hidden bg-gradient-to-b from-coffee-card/85 to-[#0b0705]">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-coffee-accent" />
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-coffee-border/30 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-border/50">
                      <BookOpen className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-base md:text-lg font-display font-extrabold text-coffee-cream">
                        {selectedDigest.title}
                      </h2>
                      <p className="text-[10px] text-coffee-text-muted font-mono uppercase tracking-wider">
                        Brews Session: {selectedDigest.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-coffee-text-muted font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(selectedDigest.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div 
                  className="space-y-6 text-[#ecdcd3] leading-relaxed text-xs md:text-sm prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatBriefingHtml(selectedDigest.summary) }}
                />

                {/* Print/Email Log details */}
                <div className="mt-8 border-t border-coffee-border/30 pt-4 flex justify-between items-center text-[10px] text-coffee-text-muted">
                  <span>Compiled by Signal Engine v1.0</span>
                  <span>Delivered via Email client</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
