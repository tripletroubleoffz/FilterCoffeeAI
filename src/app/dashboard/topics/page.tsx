'use client';

import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { FolderHeart, Loader2, Plus, Trash2, ToggleLeft, ToggleRight, Info, AlertTriangle } from 'lucide-react';

export default function TopicFeedsPage() {
  const { data: topics, isLoading, refetch } = trpc.topics.getTopics.useQuery();
  const subStatusQuery = trpc.billing.getSubscriptionStatus.useQuery();

  // Form states
  const [topicName, setTopicName] = useState('');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [includeText, setIncludeText] = useState('');
  const [excludeText, setExcludeText] = useState('');
  const [formError, setFormError] = useState('');

  const createTopicMutation = trpc.topics.createTopic.useMutation({
    onSuccess: () => {
      // Clear form & refresh
      setTopicName('');
      setIncludeText('');
      setExcludeText('');
      setFormError('');
      refetch();
      subStatusQuery.refetch();
    },
    onError: (err) => {
      setFormError(err.message || 'Failed to create topic.');
    },
  });

  const deleteTopicMutation = trpc.topics.deleteTopic.useMutation({
    onSuccess: () => {
      refetch();
      subStatusQuery.refetch();
    },
  });

  const toggleTopicMutation = trpc.topics.toggleTopicActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Limits enforcement
  const maxTopics = subStatusQuery.data?.maxTopics || 1;
  const currentTopicCount = topics?.length || 0;
  const limitsExceeded = currentTopicCount >= maxTopics;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      setFormError('Topic name is required.');
      return;
    }

    if (limitsExceeded) {
      setFormError(`Topic limit reached. Please upgrade your subscription on the Billing page to add more feeds.`);
      return;
    }

    const includeKeywords = includeText
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const excludeKeywords = excludeText
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    createTopicMutation.mutate({
      name: topicName.trim(),
      frequency,
      includeKeywords,
      excludeKeywords,
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto h-full flex flex-col">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-coffee-cream">Topic Feeds</h1>
        <p className="text-xs text-coffee-text-muted font-sans">
          Manage the exact keywords and subjects you want our filters to capture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Feed Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-coffee-border/60 bg-[#0c0806]/50">
          <h2 className="text-sm font-display font-bold text-coffee-cream border-b border-coffee-border/20 pb-3 mb-4">
            Brew New Topic
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Limit Warning */}
            {limitsExceeded && (
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 text-amber-200 rounded flex gap-2 items-start leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Feed Limit Reached</strong>
                  <p className="text-[10px] text-amber-300 mt-1">
                    Your current {subStatusQuery.data?.plan} plan allows up to {maxTopics} active topic feed(s). Upgrade to add more.
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-200 rounded">
                {formError}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-coffee-cream">Topic Name</label>
              <input
                type="text"
                placeholder="e.g. Next.js 15, AI Agents"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                disabled={limitsExceeded}
                className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors disabled:opacity-50"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <label className="font-semibold text-coffee-cream">Delivery Frequency</label>
              <div className="flex gap-2">
                {(['DAILY', 'WEEKLY'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    disabled={limitsExceeded}
                    className={`flex-1 p-2 rounded border font-semibold text-[10px] transition-colors disabled:opacity-50 ${
                      frequency === freq
                        ? 'bg-coffee-accent/15 border-coffee-accent text-coffee-accent'
                        : 'bg-[#070403] border-coffee-border/60 text-coffee-text-muted hover:border-coffee-border'
                    }`}
                  >
                    {freq === 'DAILY' ? 'Daily Briefing' : 'Weekly Briefing'}
                  </button>
                ))}
              </div>
            </div>

            {/* Includes */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-coffee-cream">Include Keywords</label>
                <span className="text-[9px] text-coffee-text-muted">Comma-separated</span>
              </div>
              <input
                type="text"
                placeholder="e.g. vercel, react, rsc"
                value={includeText}
                onChange={(e) => setIncludeText(e.target.value)}
                disabled={limitsExceeded}
                className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors disabled:opacity-50"
              />
              <p className="text-[10px] text-coffee-text-muted">
                Match signals containing any of these keywords (if empty, matches Topic Name).
              </p>
            </div>

            {/* Excludes */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-coffee-cream">Exclude Keywords</label>
                <span className="text-[9px] text-coffee-text-muted">Comma-separated</span>
              </div>
              <input
                type="text"
                placeholder="e.g. angular, legacy"
                value={excludeText}
                onChange={(e) => setExcludeText(e.target.value)}
                disabled={limitsExceeded}
                className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors disabled:opacity-50"
              />
              <p className="text-[10px] text-coffee-text-muted">
                Deduct signals that mention these keywords to block press release noise.
              </p>
            </div>

            <button
              type="submit"
              disabled={createTopicMutation.isPending || limitsExceeded}
              className="w-full py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background font-semibold rounded flex items-center justify-center gap-1.5 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(194,136,84,0.25)]"
            >
              {createTopicMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Create Topic Feed</span>
            </button>
          </form>
        </div>

        {/* Existing Topics List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider">
              Active Feeds ({currentTopicCount} / {maxTopics})
            </span>
            <span className="text-[10px] text-coffee-text-muted flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Excludes are applied pre-embedding sharding.
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-coffee-accent animate-spin" />
            </div>
          ) : !topics || topics.length === 0 ? (
            <div className="glass-panel p-10 rounded-xl text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-accent/20 mx-auto">
                <FolderHeart className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-coffee-cream">No Topics Configured</h3>
                <p className="text-[10px] text-coffee-text-muted max-w-xs mx-auto">
                  Create your first topic on the left to start collecting custom morning signals.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic) => {
                const includes = topic.keywords.filter(k => !k.isExclude).map(k => k.keyword);
                const excludes = topic.keywords.filter(k => k.isExclude).map(k => k.keyword);

                return (
                  <div
                    key={topic.id}
                    className="glass-panel p-5 rounded-lg border border-coffee-border/40 bg-[#0b0705]/40 flex justify-between items-center gap-6"
                  >
                    <div className="space-y-3 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xs md:text-sm font-extrabold text-coffee-cream">
                          {topic.name}
                        </h3>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#070403] text-coffee-text-muted border border-coffee-border/20 uppercase">
                          {topic.frequency}
                        </span>
                      </div>
                      
                      {/* Keyword tags */}
                      <div className="flex flex-wrap gap-2 text-[9px]">
                        {includes.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-coffee-text-muted">Includes:</span>
                            {includes.map(inc => (
                              <span key={inc} className="bg-coffee-border/30 text-coffee-cream px-1.5 py-0.5 rounded border border-coffee-border/40 font-mono">
                                {inc}
                              </span>
                            ))}
                          </div>
                        )}
                        {excludes.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-coffee-text-muted">Excludes:</span>
                            {excludes.map(exc => (
                              <span key={exc} className="bg-red-950/20 text-red-300 px-1.5 py-0.5 rounded border border-red-900/30 font-mono">
                                {exc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Toggle status */}
                      <button
                        onClick={() => toggleTopicMutation.mutate({ id: topic.id })}
                        title="Toggle status"
                        className="text-coffee-text-muted hover:text-coffee-accent transition-colors"
                      >
                        {topic.isActive ? (
                          <ToggleRight className="w-7 h-7 text-coffee-accent" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-coffee-text-muted" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteTopicMutation.mutate({ id: topic.id })}
                        disabled={deleteTopicMutation.isPending}
                        className="p-2 rounded bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                        title="Delete Feed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
