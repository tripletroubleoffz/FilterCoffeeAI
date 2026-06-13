'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import BrewingLoader from '@/components/BrewingLoader';
import { MailOpen, Calendar, ArrowRight, BookOpen, Clock, RefreshCw, Sparkles, Award } from 'lucide-react';

export default function DailyBrewPage() {
  const { data: briefings, isLoading, refetch, isRefetching } = trpc.signals.getBriefings.useQuery();
  const [selectedBriefingId, setSelectedBriefingId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const triggerDigestMutation = trpc.admin.triggerManualDigest.useMutation({
    onSuccess: () => {
      alert('Briefing successfully compiled and sent!');
      refetch();
      utils.signals.getBriefings.invalidate();
    },
    onError: (err) => {
      alert(`Briefing compilation failed: ${err.message}`);
    },
  });

  const handleTriggerDailyBrew = () => {
    // Default mock user id from database seeds
    const defaultMockUserId = 'user_mock_123';
    triggerDigestMutation.mutate({ userId: defaultMockUserId, frequency: 'DAILY' });
  };

  const selectedBriefing = briefings?.find((d) => d.id === selectedBriefingId) || briefings?.[0];

  const formatBriefingHtml = (markdown: string) => {
    return markdown
      .replace(/### (.*)/g, '<h4 style="font-size: 15px; font-weight: 700; color: #c28854; margin-top: 25px; margin-bottom: 12px; border-left: 2px solid #c28854; padding-left: 8px;">$1</h4>')
      .replace(/- \*\*(.*?)\*\*(.*)/g, '<li style="margin-bottom: 8px; font-size: 13px; line-height: 1.6;"><strong style="color: #ecdcd3;">$1</strong>$2</li>')
      .replace(/- (.*)/g, '<li style="margin-bottom: 8px; font-size: 13px; line-height: 1.6;">$1</li>')
      .replace(/\n\n/g, '<br/>');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
              <MailOpen className="w-6 h-6 text-coffee-accent animate-pulse" />
              Daily Brew
            </h1>
            <p className="text-xs text-coffee-text-muted">
              Your personalized AI morning briefs. Freshly distilled and custom-brewed every morning.
            </p>
          </div>
          <button
            onClick={handleTriggerDailyBrew}
            disabled={triggerDigestMutation.isPending || isRefetching}
            className="px-4 py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-background rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(194,136,84,0.2)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${triggerDigestMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Brew Fresh Briefing</span>
          </button>
        </div>

        {/* Loading */}
        {isLoading || triggerDigestMutation.isPending ? (
          <div className="glass-panel p-20 rounded-xl flex items-center justify-center">
            <BrewingLoader message="Extracting and blending news sources..." />
          </div>
        ) : !briefings || briefings.length === 0 ? (
          <div className="glass-panel p-16 rounded-xl text-center space-y-6 max-w-md mx-auto mt-12">
            <div className="w-14 h-14 rounded-full bg-coffee-border/30 border border-coffee-accent/20 flex items-center justify-center text-coffee-accent mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-coffee-cream">Daily Cup is Empty</h3>
              <p className="text-xs text-coffee-text-muted leading-relaxed">
                Click "Brew Fresh Briefing" above to compile your first personalized morning intelligence summary.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar list */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider px-1">Brewing Archives</span>
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {briefings.map((brief) => {
                  const isSelected = selectedBriefing?.id === brief.id;
                  return (
                    <button
                      key={brief.id}
                      onClick={() => setSelectedBriefingId(brief.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-coffee-card border-coffee-accent shadow-md shadow-coffee-accent/5'
                          : 'bg-[#0f0a08]/50 border-coffee-border/40 hover:bg-coffee-card/50 hover:border-coffee-border/70'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className={`text-xs font-bold font-display ${isSelected ? 'text-coffee-accent' : 'text-coffee-cream'}`}>
                          {brief.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-coffee-text-muted font-mono">
                        <Clock className="w-3 h-3 text-coffee-accent" />
                        <span>{new Date(brief.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Viewer */}
            <div className="lg:col-span-8">
              {selectedBriefing && (
                <div className="glass-panel rounded-xl p-8 border border-coffee-border/80 relative overflow-hidden bg-gradient-to-b from-coffee-card/80 to-[#0c0806]">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-coffee-accent" />
                  
                  {/* Title Header */}
                  <div className="flex justify-between items-center border-b border-coffee-border/20 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded bg-[#070403] border border-coffee-border/40 flex items-center justify-center text-coffee-accent">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-display font-extrabold text-coffee-cream">
                          {selectedBriefing.title}
                        </h2>
                        <span className="text-[9px] font-mono text-coffee-text-muted">
                          Brews ID: {selectedBriefing.id}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-coffee-text-muted font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-coffee-accent" />
                      {new Date(selectedBriefing.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Summary html */}
                  <div 
                    className="space-y-6 text-coffee-cream leading-relaxed text-xs md:text-[13px]"
                    dangerouslySetInnerHTML={{ __html: formatBriefingHtml(selectedBriefing.summary) }}
                  />

                  {/* Footer metadata */}
                  <div className="mt-8 border-t border-coffee-border/20 pt-4 flex justify-between items-center text-[9px] font-mono text-coffee-text-muted">
                    <span className="flex items-center gap-0.5"><Award className="w-3 h-3 text-coffee-accent" /> FilterCoffee.ai compiler v1.1</span>
                    <span>Delivered via System Mailer</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
