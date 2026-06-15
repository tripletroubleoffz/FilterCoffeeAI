'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { Clock, RefreshCw, AlertCircle, Calendar, ArrowRight, Award, Layers } from 'lucide-react';
import BrewingLoader from '@/components/BrewingLoader';

export default function WeeklyRoastPage() {
  const { data: signals, isLoading, refetch, isRefetching } = trpc.signals.getSignals.useQuery({ limit: 15 });
  const [selectedSignal, setSelectedSignal] = useState<any>(null);

  // Filter signals to the past 7 days (or high relevance score)
  const weeklySignals = signals?.filter(s => s.score && s.score >= 8.5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
              <Clock className="w-6 h-6 text-coffee-accent" />
              Weekly Roast
            </h1>
            <p className="text-xs text-coffee-text-muted">
              Weekly macro timelines tracking major AI company consolidations, paradigm shifts, and venture investments.
            </p>
          </div>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Timeline</span>
          </button>
        </div>

        {/* Loader */}
        {isLoading ? (
          <div className="glass-panel p-20 rounded-xl">
            <BrewingLoader message="Distilling weekly intelligence trends..." />
          </div>
        ) : weeklySignals.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center space-y-4 max-w-md mx-auto mt-12">
            <AlertCircle className="w-8 h-8 text-coffee-accent mx-auto" />
            <h3 className="text-sm font-bold text-coffee-cream">No High-Priority Shifts</h3>
            <p className="text-xs text-coffee-text-muted">No weekly timeline indicators flagged above critical relevance parameters currently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Timeline Tree */}
            <div className="lg:col-span-7 space-y-8 relative before:absolute before:top-4 before:bottom-4 before:left-4 before:w-[2px] before:bg-gradient-to-b before:from-coffee-accent/40 before:to-coffee-border/10 pr-2">
              {weeklySignals.map((sig, index) => (
                <div 
                  key={sig.id}
                  onClick={() => setSelectedSignal(sig)}
                  className={`relative pl-12 group cursor-pointer transition-all duration-300 ${
                    selectedSignal?.id === sig.id ? 'translate-x-1.5' : ''
                  }`}
                >
                  {/* Timeline bullet dot */}
                  <div className={`absolute left-2.5 top-2 w-3.5 h-3.5 rounded-full border-2 border-[#070403] transition-all duration-300 ${
                    selectedSignal?.id === sig.id 
                      ? 'bg-coffee-accent border-coffee-accent scale-125' 
                      : 'bg-coffee-border group-hover:bg-coffee-accent/60 group-hover:border-coffee-accent'
                  }`} />

                  {/* Card panel */}
                  <div className={`glass-panel p-5 rounded-xl border transition-all duration-300 ${
                    selectedSignal?.id === sig.id
                      ? 'border-coffee-accent bg-coffee-card shadow-lg shadow-coffee-accent/5'
                      : 'border-coffee-border/40 hover:border-coffee-border/70 bg-[#0f0a08]/80'
                  }`}>
                    <div className="flex justify-between items-center text-[9px] font-mono text-coffee-text-muted">
                      <span>SHIFT #{weeklySignals.length - index}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-coffee-accent" />
                        {new Date(sig.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-display font-extrabold text-coffee-cream mt-2 group-hover:text-white transition-colors">
                      {sig.title}
                    </h3>

                    <p className="text-[11px] text-coffee-text-muted leading-relaxed line-clamp-2 mt-1.5">
                      {sig.content.startsWith('{') ? JSON.parse(sig.content).tldr : sig.content}
                    </p>

                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-coffee-border/20 text-[10px] font-mono">
                      <span className="text-coffee-accent font-bold uppercase">{sig.category}</span>
                      <span className="text-coffee-text-muted group-hover:text-coffee-accent transition-colors flex items-center gap-0.5">
                        Examine Shift <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Analysis Detail Sidebar */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              {selectedSignal ? (
                <div className="glass-panel rounded-xl p-6 border border-coffee-accent/50 bg-gradient-to-b from-[#110a08]/90 to-[#070403] space-y-5 relative">
                  <div className="h-[2px] w-full bg-coffee-accent absolute top-0 left-0 right-0" />
                  
                  {/* Category & published */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-coffee-text-muted pt-2">
                    <span className="text-coffee-accent font-bold uppercase bg-[#070403] border border-coffee-accent/20 px-2 py-0.5 rounded">
                      {selectedSignal.category}
                    </span>
                    <span>{new Date(selectedSignal.publishedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  </div>

                  <h2 className="text-base font-display font-extrabold text-coffee-cream leading-snug">
                    {selectedSignal.title}
                  </h2>

                  {/* Summary content */}
                  {(() => {
                    let parsed: any = {};
                    try {
                      parsed = JSON.parse(selectedSignal.content);
                    } catch (e) {
                      parsed = {
                        tldr: selectedSignal.content,
                        whyItMatters: 'General industry update.',
                        careerImpact: 'Operational skill update.',
                        confidenceScore: 90
                      };
                    }
                    return (
                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <span className="block text-[8px] font-mono text-coffee-accent uppercase tracking-wider">Executive Abstract</span>
                          <p className="text-coffee-cream bg-[#070403] p-3 rounded border border-coffee-border/40 leading-relaxed">
                            {parsed.tldr}
                          </p>
                        </div>

                        <div className="space-y-1 bg-coffee-dark/20 p-3 rounded-lg border border-coffee-border/20">
                          <span className="font-bold text-coffee-cream flex items-center gap-1.5 text-[10.5px]">
                            <Award className="w-4 h-4 text-coffee-accent" />
                            Strategic Importance
                          </span>
                          <p className="text-coffee-text-muted leading-relaxed pt-1">
                            {parsed.whyItMatters}
                          </p>
                        </div>

                        <div className="space-y-1 bg-coffee-dark/20 p-3 rounded-lg border border-coffee-border/20">
                          <span className="font-bold text-coffee-cream flex items-center gap-1.5 text-[10.5px]">
                            <Layers className="w-4 h-4 text-coffee-accent" />
                            Talent & Career Roast
                          </span>
                          <p className="text-coffee-text-muted leading-relaxed pt-1">
                            {parsed.careerImpact}
                          </p>
                        </div>

                        <div className="flex gap-4 pt-2 border-t border-coffee-border/20 text-[10px] font-mono text-coffee-text-muted">
                          <div>Relavence Index: <span className="text-coffee-cream font-bold">{(selectedSignal.score || 8.5).toFixed(1)}</span></div>
                          {parsed.confidenceScore && (
                            <div>Confidence: <span className="text-emerald-500 font-bold">{parsed.confidenceScore}%</span></div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              ) : (
                <div className="glass-panel rounded-xl p-10 text-center border border-coffee-border/40 bg-[#0f0a08]/30 space-y-4 text-xs">
                  <Clock className="w-8 h-8 text-coffee-accent/40 mx-auto animate-pulse" />
                  <h3 className="text-coffee-cream font-semibold font-display">Select a Shift</h3>
                  <p className="text-coffee-text-muted leading-relaxed">
                    Select any timeline node on the left to reveal in-depth executive abstracts, strategic implications, and talent analyses.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
