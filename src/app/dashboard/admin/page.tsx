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
  FileSpreadsheet,
  MessageSquare,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Check,
  Clock,
  User,
  BookOpen,
  Play,
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function AdminConsolePage() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<'operations' | 'contacts' | 'logs'>('operations');

  // Operational queries
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = trpc.admin.getMetrics.useQuery();
  const { data: sources, isLoading: loadingSources, refetch: refetchSources } = trpc.admin.getSources.useQuery();
  const { data: auditLogs, isLoading: loadingAudits, refetch: refetchAudits } = trpc.admin.getAuditLogs.useQuery();
  const { data: emailLogs, isLoading: loadingEmails, refetch: refetchEmails } = trpc.admin.getEmailLogs.useQuery();

  // Contact queries
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState<string>('ALL');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const { data: contactMessages, isLoading: loadingContacts, refetch: refetchContacts } = trpc.contact.getMessages.useQuery(
    { search: contactSearch, status: contactStatusFilter },
    { enabled: activeTab === 'contacts' }
  );

  // Form states for new source
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<'AI' | 'Finance' | 'Career' | 'General'>('AI');
  const [sourceFormat, setSourceFormat] = useState<'RSS' | 'API' | 'CUSTOM'>('RSS');
  const [sourceCategory, setSourceCategory] = useState<string>('General');
  const [sourcePollingInterval, setSourcePollingInterval] = useState<number>(60);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Mutations
  const createSourceMutation = trpc.admin.createSource.useMutation({
    onSuccess: () => {
      setSourceName('');
      setSourceUrl('');
      setSourceFormat('RSS');
      setSourceCategory('General');
      setSourcePollingInterval(60);
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

  const toggleSourceActiveMutation = trpc.admin.toggleSourceActive.useMutation({
    onSuccess: () => {
      refetchSources();
      refetchAudits();
    },
    onError: (err) => {
      alert(`Failed to toggle active status: ${err.message}`);
    }
  });

  const testIngestSourceMutation = trpc.admin.testIngestSource.useMutation({
    onSuccess: (data) => {
      if (data.success && 'healthStatus' in data) {
        alert(`Ingestion test successful! Status: ${data.healthStatus}`);
      } else if (!data.success && 'error' in data) {
        alert(`Ingestion test failed: ${data.error}`);
      } else {
        alert('Ingestion test completed.');
      }
      refetchSources();
      refetchMetrics();
      refetchAudits();
      utils.signals.getSignals.invalidate();
    },
    onError: (err) => {
      alert(`Error launching test: ${err.message}`);
    }
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

  const updateContactStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      refetchContacts();
      refetchMetrics();
      refetchAudits();
    },
    onError: (err) => {
      alert(`Failed to update status: ${err.message}`);
    }
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
      format: sourceFormat,
      category: sourceCategory,
      pollingInterval: sourcePollingInterval,
    });
  };

  const handleTriggerIngestion = () => {
    triggerIngestionMutation.mutate();
  };

  const handleTriggerDigest = () => {
    const defaultMockUserId = 'user_mock_123'; // Trigger digest for our admin account
    triggerDigestMutation.mutate({ userId: defaultMockUserId, frequency: 'DAILY' });
  };

  const handleUpdateContactStatus = (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    updateContactStatusMutation.mutate({ id, status });
  };

  const selectedMessage = contactMessages?.find(m => m.id === selectedMessageId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-coffee-border/30 text-coffee-text-muted';
    }
  };

  const loading = loadingMetrics || loadingSources || loadingAudits || loadingEmails;

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-red-300 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 animate-pulse" /> Admin Console
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

      {/* Tabs */}
      <div className="border-b border-coffee-border/20 flex gap-6 text-xs shrink-0">
        <button
          onClick={() => setActiveTab('operations')}
          className={`pb-3 font-semibold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'operations' 
              ? 'border-coffee-accent text-coffee-cream' 
              : 'border-transparent text-coffee-text-muted hover:text-coffee-cream'
          }`}
        >
          Operational Controls
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 font-semibold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'contacts' 
              ? 'border-coffee-accent text-coffee-cream' 
              : 'border-transparent text-coffee-text-muted hover:text-coffee-cream'
          }`}
        >
          Contact Messages
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 font-semibold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'logs' 
              ? 'border-coffee-accent text-coffee-cream' 
              : 'border-transparent text-coffee-text-muted hover:text-coffee-cream'
          }`}
        >
          System Logs
        </button>
      </div>

      {/* Metrics Grid (Shown on all tabs for quick lookup) */}
      {!loadingMetrics && metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs shrink-0">
          <div className="glass-panel p-4 rounded-lg bg-[#0c0806]/30 border border-coffee-border/20">
            <span className="text-[9px] uppercase font-mono text-coffee-text-muted">Total Profiles</span>
            <div className="text-lg font-display font-extrabold text-coffee-cream mt-0.5">{metrics.stats.totalUsers}</div>
          </div>
          <div className="glass-panel p-4 rounded-lg bg-[#0c0806]/30 border border-coffee-border/20">
            <span className="text-[9px] uppercase font-mono text-coffee-text-muted">Active Pro/Power</span>
            <div className="text-lg font-display font-extrabold text-coffee-cream mt-0.5">{metrics.stats.activeSubscribers}</div>
          </div>
          <div className="glass-panel p-4 rounded-lg bg-[#0c0806]/30 border border-coffee-border/20">
            <span className="text-[9px] uppercase font-mono text-coffee-text-muted">Indexed Signals</span>
            <div className="text-lg font-display font-extrabold text-coffee-cream mt-0.5">{metrics.stats.totalSignals}</div>
          </div>
          <div className="glass-panel p-4 rounded-lg bg-[#0c0806]/30 border border-coffee-border/20">
            <span className="text-[9px] uppercase font-mono text-coffee-text-muted">Outbound Mails</span>
            <div className="text-lg font-display font-extrabold text-coffee-cream mt-0.5">{metrics.stats.totalEmails}</div>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 text-xs">
        {activeTab === 'operations' && (
          loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-coffee-accent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
              {/* Feed Manager Form */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-coffee-border/60 bg-[#0c0806]/60">
                <h3 className="text-sm font-display font-bold text-coffee-cream border-b border-coffee-border/20 pb-3 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-coffee-accent" /> Configure New Feed Source
                </h3>

                <form onSubmit={handleCreateSource} className="space-y-4">
                  {formError && <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-200 rounded">{formError}</div>}
                  {formSuccess && <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 rounded">{formSuccess}</div>}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-coffee-cream text-xs">Source Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Hacker News RSS"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-coffee-cream text-xs">Source URL / Endpoint</label>
                    <input
                      type="url"
                      placeholder="e.g. https://news.ycombinator.com/rss"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-coffee-cream text-xs">Source Format</label>
                      <select
                        value={sourceFormat}
                        onChange={(e) => setSourceFormat(e.target.value as any)}
                        className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors text-sm"
                      >
                        <option value="RSS">RSS Feed</option>
                        <option value="API">Public API</option>
                        <option value="CUSTOM">Custom Scraper</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-coffee-cream text-xs">System Pillar</label>
                      <select
                        value={sourceType}
                        onChange={(e) => setSourceType(e.target.value as any)}
                        className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors text-sm"
                      >
                        <option value="AI">AI Intelligence</option>
                        <option value="Finance">Finance Intelligence</option>
                        <option value="Career">Career Intelligence</option>
                        <option value="General">General / Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-coffee-cream text-xs">Source Category</label>
                      <select
                        value={sourceCategory}
                        onChange={(e) => setSourceCategory(e.target.value)}
                        className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors text-sm"
                      >
                        <option value="AI">AI</option>
                        <option value="Startups">Startups</option>
                        <option value="Research">Research</option>
                        <option value="Programming">Programming</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Security">Security</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Technology">Technology</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-coffee-cream text-xs">Poll (minutes)</label>
                      <input
                        type="number"
                        min={5}
                        max={1440}
                        value={sourcePollingInterval}
                        onChange={(e) => setSourcePollingInterval(Number(e.target.value))}
                        className="w-full bg-[#070403] border border-coffee-border/60 rounded p-2.5 text-f4eae4 focus:outline-none focus:border-coffee-accent transition-colors text-sm"
                      />
                    </div>
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
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider">Ingestion Registry</span>
                  <span className="text-[10px] font-mono text-coffee-accent">{sources?.length || 0} Registered Sources</span>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {sources?.map((src) => {
                    const isHealthy = src.healthStatus === 'HEALTHY' || !src.healthStatus;
                    const isDegraded = src.healthStatus === 'DEGRADED';
                    const isFailing = src.healthStatus === 'FAILING';

                    return (
                      <div
                        key={src.id}
                        className={`glass-panel p-4 rounded-lg bg-[#0c0806]/40 flex flex-col gap-3 border ${
                          src.isActive ? 'border-coffee-border/30' : 'border-zinc-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-coffee-cream truncate">{src.name}</span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#070403] text-coffee-accent border border-coffee-border/20">
                                {src.format || 'RSS'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#070403] text-coffee-text-muted border border-coffee-border/20">
                                {src.category || 'General'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#070403] text-coffee-text-muted border border-coffee-border/20">
                                {src.type}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#070403] text-coffee-text-muted border border-coffee-border/20 flex items-center gap-0.5">
                                <Clock className="w-2 h-2" /> {src.pollingInterval || 60}m
                              </span>
                            </div>
                            <p className="text-[10px] text-coffee-text-muted truncate font-mono">{src.url}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Ingestion status indicator */}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#070403] border border-coffee-border/20 font-sans">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isHealthy ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              <span className="text-[8px] font-mono font-bold uppercase text-coffee-cream">
                                {src.healthStatus || 'HEALTHY'}
                              </span>
                            </div>

                            {/* Active Toggle Switch */}
                            <button
                              onClick={() => toggleSourceActiveMutation.mutate({ id: src.id, isActive: !src.isActive })}
                              className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase border transition-colors ${
                                src.isActive
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-950/40'
                                  : 'bg-zinc-900/40 text-zinc-500 border-zinc-800 hover:bg-zinc-800'
                              }`}
                            >
                              {src.isActive ? 'Active' : 'Disabled'}
                            </button>
                          </div>
                        </div>

                        {src.lastError && (
                          <div className="text-[9.5px] p-2 rounded bg-red-950/10 border border-red-900/20 text-red-300 font-mono flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                            <span className="break-all">{src.lastError}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-coffee-border/10 text-[9px] text-coffee-text-muted">
                          <div>
                            Fetched signals: <strong className="text-coffee-cream">{src._count?.signals || 0}</strong> | Last: {src.lastFetched ? new Date(src.lastFetched).toLocaleString() : 'Never'}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => testIngestSourceMutation.mutate({ id: src.id })}
                              disabled={testIngestSourceMutation.isPending}
                              className="p-1.5 rounded bg-[#130d0b] text-coffee-accent border border-coffee-border/20 hover:bg-coffee-border/30 transition-colors flex items-center gap-1 disabled:opacity-40"
                              title="Test run ingestion for this source"
                            >
                              {testIngestSourceMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                              <span className="text-[8px] font-bold">TEST RUN</span>
                            </button>

                            <button
                              onClick={() => deleteSourceMutation.mutate({ id: src.id })}
                              className="p-1.5 rounded bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-950/40 hover:text-red-300 transition-colors shrink-0"
                              title="Delete Source"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
            {/* Filter and List Sidebar */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Search & Filters */}
              <div className="glass-panel p-4 rounded-xl border border-coffee-border/45 bg-[#0c0806]/60 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-coffee-text-muted" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search by name, email, keyword..."
                    className="w-full pl-9 pr-3 py-2 bg-[#070403] border border-coffee-border/40 rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-coffee-text-muted tracking-wider flex items-center gap-1">
                    <Filter className="w-3 h-3 text-coffee-accent" /> Filter By Status
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setContactStatusFilter(status)}
                        className={`py-1 rounded text-[9px] font-bold tracking-wide border transition-all ${
                          contactStatusFilter === status
                            ? 'bg-coffee-accent text-[#090504] border-coffee-accent shadow-md shadow-coffee-accent/10'
                            : 'bg-[#080504] border-coffee-border/30 text-coffee-text-muted hover:text-coffee-cream'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Items List */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {loadingContacts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 text-coffee-accent animate-spin" />
                  </div>
                ) : !contactMessages || contactMessages.length === 0 ? (
                  <div className="p-8 text-center text-coffee-text-muted border border-dashed border-coffee-border/30 rounded-lg">
                    No contact messages found.
                  </div>
                ) : (
                  contactMessages.map((msg) => {
                    const isSelected = selectedMessageId === msg.id;
                    return (
                      <button
                        key={msg.id}
                        onClick={() => setSelectedMessageId(msg.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-coffee-card border-coffee-accent shadow-md'
                            : 'bg-[#0c0806]/40 border-coffee-border/30 hover:bg-[#0c0806]/80 hover:border-coffee-border/60'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full gap-2">
                          <span className={`font-bold ${isSelected ? 'text-coffee-accent' : 'text-coffee-cream'} truncate`}>
                            {msg.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold shrink-0 ${getStatusColor(msg.status)}`}>
                            {msg.status}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-coffee-cream truncate font-semibold">
                          {msg.subject || 'No Subject'}
                        </p>
                        
                        <p className="text-[10px] text-coffee-text-muted truncate line-clamp-1">
                          {msg.message}
                        </p>

                        <div className="flex justify-between items-center text-[9px] text-coffee-text-muted font-mono mt-1 pt-1 border-t border-coffee-border/10">
                          <span>{msg.email}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-coffee-accent" />
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

            </div>

            {/* Detailed Viewer Panel */}
            <div className="lg:col-span-7">
              {selectedMessage ? (
                <div className="glass-panel border border-coffee-border/50 bg-[#0c0806]/80 rounded-xl p-6 relative overflow-hidden space-y-6">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-coffee-accent" />

                  {/* Header metadata */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 border-b border-coffee-border/20 pb-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-display font-extrabold text-coffee-cream truncate">
                          {selectedMessage.name}
                        </h2>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${getStatusColor(selectedMessage.status)}`}>
                          {selectedMessage.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-coffee-text-muted font-mono truncate">{selectedMessage.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-coffee-text-muted font-mono shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-coffee-accent" />
                      <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="bg-[#070403] border border-coffee-border/30 rounded-lg p-3 flex flex-wrap gap-2.5 items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-coffee-text-muted">Change Inquiry Status</span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateContactStatus(selectedMessage.id, 'OPEN')}
                        disabled={updateContactStatusMutation.isPending || selectedMessage.status === 'OPEN'}
                        className="px-2.5 py-1 rounded text-[9px] font-bold border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Mark Open
                      </button>
                      <button
                        onClick={() => handleUpdateContactStatus(selectedMessage.id, 'IN_PROGRESS')}
                        disabled={updateContactStatusMutation.isPending || selectedMessage.status === 'IN_PROGRESS'}
                        className="px-2.5 py-1 rounded text-[9px] font-bold border border-amber-500/30 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateContactStatus(selectedMessage.id, 'RESOLVED')}
                        disabled={updateContactStatusMutation.isPending || selectedMessage.status === 'RESOLVED'}
                        className="px-2.5 py-1 rounded text-[9px] font-bold border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Resolved
                      </button>
                    </div>
                  </div>

                  {/* Subject and Message Details */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase text-coffee-text-muted">Subject</span>
                      <p className="text-xs font-bold text-coffee-cream">{selectedMessage.subject || 'No Subject Specified'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase text-coffee-text-muted">Inquiry Content</span>
                      <div className="p-4 bg-[#080504] border border-coffee-border/30 rounded-lg text-coffee-cream leading-relaxed whitespace-pre-wrap select-text">
                        {selectedMessage.message}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-64 border border-dashed border-coffee-border/30 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-[#0c0806]/10">
                  <MessageSquare className="w-8 h-8 text-coffee-text-muted/40 mb-2" />
                  <p className="text-xs font-bold text-coffee-cream">No Message Selected</p>
                  <p className="text-[10px] text-coffee-text-muted mt-1 max-w-xs">
                    Choose a contact request from the list to view its contents, submit logs, and manage status lifecycles.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'logs' && (
          loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-coffee-accent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              {/* Audit Logs */}
              <div className="glass-panel p-6 rounded-xl space-y-4 border border-coffee-border/40 bg-[#0c0806]/40">
                <h3 className="text-xs font-mono uppercase text-coffee-text-muted tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4" /> Security Audit Logs (Recent 50)
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
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
              <div className="glass-panel p-6 rounded-xl space-y-4 border border-coffee-border/40 bg-[#0c0806]/40">
                <h3 className="text-xs font-mono uppercase text-coffee-text-muted tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Outbound Email Log (Recent 50)
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
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
          )
        )}
      </div>
    </div>
  );
}
