'use client';

import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { 
  ShieldAlert, 
  Loader2, 
  Database, 
  TrendingUp, 
  Mail, 
  Globe, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Coffee,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminConsolePage() {
  const utils = trpc.useUtils();

  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = trpc.admin.getMetrics.useQuery();
  const { data: sources, isLoading: loadingSources, refetch: refetchSources } = trpc.admin.getSources.useQuery();
  const { data: auditLogs, isLoading: loadingAudits, refetch: refetchAudits } = trpc.admin.getAuditLogs.useQuery();
  const { data: emailLogs, isLoading: loadingEmails, refetch: refetchEmails } = trpc.admin.getEmailLogs.useQuery();

  // Form states for new source
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<'AI' | 'Finance' | 'Career' | 'General'>('AI');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Mutations
  const createSourceMutation = trpc.admin.createSource.useMutation({
    onSuccess: () => {
      setSourceName('');
      setSourceUrl('');
      setFormError('');
      setFormSuccess('Feed source added successfully.');
      refetchSources();
      refetchMetrics();
      refetchAudits();
    },
    onError: (err) => {
      setFormSuccess('');
      setFormError(err.message || 'Failed to add source.');
    },
  });

  const deleteSourceMutation = trpc.admin.deleteSource.useMutation({
    onSuccess: () => {
      refetchSources();
      refetchMetrics();
      refetchAudits();
    },
  });

  const triggerIngestionMutation = trpc.admin.triggerManualIngestion.useMutation({
    onSuccess: () => {
      alert('Ingestion pipeline triggered in the background. Refreshing in 3 seconds...');
      setTimeout(() => {
        refetchSources();
        refetchMetrics();
        refetchAudits();
        utils.signals.getSignals.invalidate();
      }, 3000);
    },
  });

  const triggerDigestMutation = trpc.admin.triggerManualDigest.useMutation({
    onSuccess: () => {
      alert('Digest successfully compiled and sent!');
      refetchMetrics();
      refetchEmails();
      refetchAudits();
      utils.signals.getBriefings.invalidate();
    },
    onError: (err) => {
      alert(`Briefing compilation failed: ${err.message}`);
    },
  });

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName || !sourceUrl) {
      setFormError('Name and URL are required.');
      return;
    }
    createSourceMutation.mutate({
      name: sourceName,
      url: sourceUrl,
      type: sourceType,
    });
  };

  const handleTriggerIngestion = () => {
    triggerIngestionMutation.mutate();
  };

  const handleTriggerDigest = () => {
    const defaultMockUserId = 'user_mock_123'; // Trigger digest for our admin account
    triggerDigestMutation.mutate({ userId: defaultMockUserId, frequency: 'DAILY' });
  };

  const loading = loadingMetrics || loadingSources || loadingAudits || loadingEmails;

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-red-300 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" /> Admin Console
          </h1>
          <p className="text-xs text-coffee-text-muted">Direct operational controls and platform telemetry dashboards.</p>
        </div>
        
        {/* Quick Triggers */}
        <div className="flex gap-3">
          <button
            onClick={handleTriggerIngestion}
            disabled={triggerIngestionMutation.isPending}
            className="px-4 py-2 border border-coffee-border/60 hover:bg-coffee-border/20 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${triggerIngestionMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Ingest Feeds</span>
          </button>

          <button
            onClick={handleTriggerDigest}
            disabled={triggerDigestMutation.isPending}
            className="px-4 py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-background rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Coffee className={`w-3.5 h-3.5 ${triggerDigestMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Brew Daily Briefing</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
        </div>
      ) : (
        <div className="space-y-8 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-panel p-5 rounded-lg">
              <span className="text-[10px] uppercase font-mono text-coffee-text-muted">Total Profiles</span>
              <div className="text-xl font-display font-extrabold text-coffee-cream mt-1">{metrics?.stats.totalUsers}</div>
            </div>
            <div className="glass-panel p-5 rounded-lg">
              <span className="text-[10px] uppercase font-mono text-coffee-text-muted">Active Pro/Power</span>
              <div className="text-xl font-display font-extrabold text-coffee-cream mt-1">{metrics?.stats.activeSubscribers}</div>
            </div>
            <div className="glass-panel p-5 rounded-lg">
              <span className="text-[10px] uppercase font-mono text-coffee-text-muted">Indexed Signals</span>
              <div className="text-xl font-display font-extrabold text-coffee-cream mt-1">{metrics?.stats.totalSignals}</div>
            </div>
            <div className="glass-panel p-5 rounded-lg">
              <span className="text-[10px] uppercase font-mono text-coffee-text-muted">Outbound Mails</span>
              <div className="text-xl font-display font-extrabold text-coffee-cream mt-1">{metrics?.stats.totalEmails}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Feed Manager Form */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-coffee-border/60">
              <h3 className="text-sm font-display font-bold text-coffee-cream border-b border-coffee-border/20 pb-3 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-coffee-accent" /> Configure New Feed Source
              </h3>

              <form onSubmit={handleCreateSource} className="space-y-4">
                {formError && <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-200 rounded">{formError}</div>}
                {formSuccess && <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 rounded">{formSuccess}</div>}

                <div className="space-y-1.5">
                  <label className="font-semibold text-coffee-cream">Source Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Hacker News RSS"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-coffee-cream">RSS Feed URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://news.ycombinator.com/rss"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-coffee-cream">Ingestion Category</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as any)}
                    className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors"
                  >
                    <option value="AI">AI Intelligence</option>
                    <option value="Finance">Finance Intelligence</option>
                    <option value="Career">Career Intelligence</option>
                    <option value="General">General / Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={createSourceMutation.isPending}
                  className="w-full py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background font-semibold rounded flex items-center justify-center gap-1.5 transition-all mt-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ingestion Source</span>
                </button>
              </form>
            </div>

            {/* Ingestion Sources List */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider px-1">Ingestion Registry</span>
              <div className="space-y-3">
                {sources?.map((src) => (
                  <div
                    key={src.id}
                    className="glass-panel p-4 rounded-lg bg-[#0c0806]/40 flex justify-between items-center gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-coffee-cream truncate">{src.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#070403] text-coffee-text-muted border border-coffee-border/20">
                          {src.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-coffee-text-muted truncate font-mono">{src.url}</p>
                      <div className="text-[9px] text-coffee-text-muted">
                        Fetched signals: <strong className="text-coffee-cream">{src._count?.signals || 0}</strong> | Last fetch: {src.lastFetched ? new Date(src.lastFetched).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteSourceMutation.mutate({ id: src.id })}
                      className="p-2 rounded bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-950/40 hover:text-red-300 transition-colors shrink-0"
                      title="Delete Source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logs Tab Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Audit Logs */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h3 className="text-xs font-mono uppercase text-coffee-text-muted tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4" /> Security Audit Logs (Recent 50)
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {auditLogs?.map((log) => (
                  <div key={log.id} className="p-3 bg-[#080504] border border-coffee-border/30 rounded text-[10px] space-y-1">
                    <div className="flex justify-between font-mono text-coffee-text-muted text-[9px]">
                      <span>{log.user?.email || 'SYSTEM'} // {log.action}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-coffee-cream">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Logs */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h3 className="text-xs font-mono uppercase text-coffee-text-muted tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4" /> Outbound Email Log (Recent 50)
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {emailLogs?.map((log) => (
                  <div key={log.id} className="p-3 bg-[#080504] border border-coffee-border/30 rounded text-[10px] flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-coffee-cream truncate">{log.email}</div>
                      <div className="text-coffee-text-muted truncate mt-0.5">{log.subject}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                      log.status === 'SENT' ? 'bg-emerald-950/40 text-emerald-300' : 'bg-red-950/40 text-red-300'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
