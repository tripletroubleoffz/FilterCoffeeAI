'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { 
  Search, 
  Filter, 
  Calendar, 
  Mail, 
  FileText, 
  CheckCircle2, 
  User, 
  Globe, 
  Monitor, 
  ExternalLink, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  MessageSquare,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Check,
  Loader2
} from 'lucide-react';
import { PurchaseIntentStatus } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPurchaseAttemptsPage() {
  const utils = trpc.useUtils();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseIntentStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected intent for detailed view / edit
  const [selectedIntentId, setSelectedIntentId] = useState<string | null>(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [managerStatus, setManagerStatus] = useState<PurchaseIntentStatus>('PENDING');

  // Queries
  const { 
    data: analytics, 
    isLoading: isAnalyticsLoading, 
    refetch: refetchAnalytics 
  } = trpc.billing.getAdminAnalytics.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { 
    data: intentsData, 
    isLoading: isIntentsLoading, 
    refetch: refetchIntents 
  } = trpc.billing.listPurchaseIntents.useQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page: currentPage,
    limit: itemsPerPage,
  }, {
    refetchOnWindowFocus: false,
  });

  // Mutations
  const updateIntentMutation = trpc.billing.updatePurchaseIntent.useMutation({
    onSuccess: () => {
      utils.billing.listPurchaseIntents.invalidate();
      utils.billing.getAdminAnalytics.invalidate();
      refetchIntents();
      refetchAnalytics();
    },
  });

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Cast items to a simplified structure to resolve TypeScript deep instantiation compiler error
  const intentsList = (intentsData?.items as {
    id: string;
    userId: string | null;
    email: string;
    currentPlan: string;
    requestedPlan: string | null;
    requestedCredits: number | null;
    intentType: string;
    billingFrequency: string | null;
    sourcePage: string | null;
    userAgent: string | null;
    deviceType: string | null;
    country: string | null;
    referrer: string | null;
    status: PurchaseIntentStatus;
    notes: string | null;
    metadata: any;
    createdAt: Date | string;
    updatedAt: Date | string;
    user: { name: string | null; email: string } | null;
  }[] | undefined) || [];

  // Find selected intent details
  const selectedIntent = intentsList.find(item => item.id === selectedIntentId);

  // Sync edit form state when selected intent changes
  useEffect(() => {
    if (selectedIntent) {
      setManagerNotes(selectedIntent.notes || '');
      setManagerStatus(selectedIntent.status);
    } else {
      setManagerNotes('');
    }
  }, [selectedIntentId, selectedIntent]);

  const handleUpdateIntent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntentId) return;

    updateIntentMutation.mutate({
      id: selectedIntentId,
      status: managerStatus,
      notes: managerNotes,
    });
  };

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchIntents();
  };

  // Status badge styling helper
  const getStatusBadge = (status: PurchaseIntentStatus) => {
    const styles: Record<PurchaseIntentStatus, string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      REVIEWED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      CONTACTED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };

    return (
      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-coffee-cream">Demand & Purchase Intents</h1>
          <p className="text-xs text-coffee-text-muted">Analyze early signups, trace custom interest metrics, and record manager notes.</p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="p-2 bg-[#130d0b] border border-coffee-border hover:bg-coffee-border/20 text-coffee-cream rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isIntentsLoading || isAnalyticsLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Analytics widgets */}
      {isAnalyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-xl border border-coffee-border/20 h-28 animate-pulse bg-coffee-dark/20" />
          ))}
        </div>
      ) : (
        analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Intents */}
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0e0907]/60 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-coffee-text-muted tracking-wider">Total Attempts</span>
                  <div className="text-3xl font-display font-extrabold text-coffee-cream">{analytics.totalAttempts}</div>
                </div>
                <div className="p-3 bg-coffee-accent/15 border border-coffee-accent/25 rounded-lg text-coffee-accent">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Pending Review */}
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0e0907]/60 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-coffee-text-muted tracking-wider">Pending Action</span>
                  <div className="text-3xl font-display font-extrabold text-yellow-500">{analytics.pendingCount}</div>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/25 rounded-lg text-yellow-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Conversion approved */}
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0e0907]/60 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-coffee-text-muted tracking-wider">Approved Queue</span>
                  <div className="text-3xl font-display font-extrabold text-emerald-500">{analytics.approvedCount}</div>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Most Popular Plan */}
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0e0907]/60 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-coffee-text-muted tracking-wider">Top Tier Requested</span>
                  <div className="text-lg font-display font-bold text-coffee-accent">
                    {analytics.popularPlans[0]?.plan || 'None'} 
                    <span className="text-xs font-normal text-coffee-text-muted block">
                      ({analytics.popularPlans[0]?.count || 0} requests)
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-coffee-accent/15 border border-coffee-accent/25 rounded-lg text-coffee-accent">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Growth rate metadata */}
            <div className="glass-panel p-4 rounded-xl border border-coffee-border/20 bg-[#0b0705]/20 text-xs text-coffee-text-muted flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-coffee-accent animate-pulse" />
                <span>Demand Breakdown by Plan:</span>
                <span className="font-semibold text-coffee-cream ml-1">
                  {analytics.popularPlans.map(p => `${p.plan}: ${p.count}`).join(' | ')}
                </span>
              </div>
              <div>
                <span>Latest growth point registered on: {analytics.intentGrowth[analytics.intentGrowth.length - 1]?.date || 'None'}</span>
              </div>
            </div>
          </div>
        )
      )}

      {/* Main split work bench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Search, filters and intent list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-coffee-border/30 bg-[#090605]/50 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-coffee-text-muted" />
              <input
                type="text"
                placeholder="Search email, plans or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#130d0b] border border-coffee-border/40 rounded-lg pl-9 pr-4 py-2 text-xs text-coffee-cream outline-none focus:border-coffee-accent transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <Filter className="w-3.5 h-3.5 text-coffee-text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#130d0b] border border-coffee-border/40 rounded-lg px-3 py-1.5 text-xs text-coffee-cream outline-none focus:border-coffee-accent cursor-pointer transition-colors"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="CONTACTED">Contacted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* List/Table of Intents */}
          <div className="glass-panel rounded-xl border border-coffee-border/30 bg-[#0e0907]/40 overflow-hidden">
            {isIntentsLoading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-6 h-6 text-coffee-accent animate-spin" />
              </div>
            ) : intentsList.length === 0 ? (
              <div className="py-20 text-center text-xs text-coffee-text-muted space-y-2">
                <p>No purchase intents match your filter or search query.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                  className="text-coffee-accent hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-coffee-border/15">
                {intentsList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIntentId(item.id)}
                    className={`p-4 transition-all cursor-pointer flex justify-between items-start gap-4 ${
                      selectedIntentId === item.id 
                        ? 'bg-coffee-accent/5 border-l-2 border-coffee-accent' 
                        : 'hover:bg-coffee-border/10 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs text-coffee-cream truncate font-display">
                          {item.email}
                        </strong>
                        <span className="text-[9px] uppercase font-mono text-coffee-text-muted">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] text-coffee-text-muted">
                        <span>Plan: <strong className="text-coffee-cream">{item.requestedPlan || 'FREE'}</strong></span>
                        <span>Billing: <strong className="text-coffee-cream">{item.billingFrequency || 'MONTHLY'}</strong></span>
                        <span>Type: <strong className="text-coffee-cream">{item.intentType}</strong></span>
                      </div>

                      {item.notes && (
                        <p className="text-[10px] text-coffee-text-muted line-clamp-1 italic bg-[#130d0b]/40 px-2 py-0.5 rounded border border-coffee-border/5 inline-block max-w-full">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {getStatusBadge(item.status)}
                      {item.country && (
                        <span className="text-[9px] font-mono text-coffee-text-muted uppercase flex items-center gap-1">
                          <Globe className="w-3 h-3 text-coffee-border" />
                          <span>{item.country}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {intentsData && intentsData.totalPages > 1 && (
              <div className="p-4 bg-coffee-dark/40 border-t border-coffee-border/15 flex justify-between items-center">
                <span className="text-[10px] text-coffee-text-muted">
                  Page {intentsData.page} of {intentsData.totalPages} ({intentsData.total} items)
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 bg-[#130d0b] border border-coffee-border/60 hover:bg-coffee-border/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-coffee-cream"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(intentsData.totalPages, p + 1))}
                    disabled={currentPage === intentsData.totalPages}
                    className="p-1.5 bg-[#130d0b] border border-coffee-border/60 hover:bg-coffee-border/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-coffee-cream"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive notes editor and status changer */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedIntent ? (
              <motion.div
                key={selectedIntent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-panel p-6 rounded-xl border border-coffee-accent/40 bg-[#0e0907]/90 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-coffee-border/20 pb-4">
                  <h3 className="font-display font-extrabold text-sm text-coffee-cream">Review Workspace</h3>
                  <button
                    onClick={() => setSelectedIntentId(null)}
                    className="text-[10px] text-coffee-text-muted hover:text-coffee-cream"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Summary Details */}
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-coffee-text-muted block">User & Email</span>
                      <div className="text-xs font-bold text-coffee-cream flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-coffee-accent" />
                        <span>{selectedIntent.user?.name || 'Guest User'}</span>
                      </div>
                      <span className="text-[10px] text-coffee-text-muted block pl-5 truncate">
                        {selectedIntent.email}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-coffee-border/10 pt-2.5">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-coffee-text-muted block">Requested Plan</span>
                        <span className="text-xs font-bold text-coffee-accent">
                          {selectedIntent.requestedPlan || 'FREE'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-mono text-coffee-text-muted block">Interval / Term</span>
                        <span className="text-xs font-bold text-coffee-cream">
                          {selectedIntent.billingFrequency || 'MONTHLY'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="border-t border-coffee-border/10 pt-2.5 space-y-1.5 text-[10px] text-coffee-text-muted">
                      <div className="flex items-start gap-1.5 truncate">
                        <Globe className="w-3.5 h-3.5 text-coffee-border shrink-0" />
                        <span>Referrer: {selectedIntent.referrer || 'Direct Search'}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-coffee-border shrink-0" />
                        <span className="truncate">UA: {selectedIntent.userAgent || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form to log updates */}
                  <form onSubmit={handleUpdateIntent} className="space-y-4 border-t border-coffee-border/20 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-coffee-text-muted block">Update Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['PENDING', 'REVIEWED', 'CONTACTED', 'APPROVED', 'REJECTED'] as PurchaseIntentStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setManagerStatus(st)}
                            className={`py-1 px-1 rounded text-[9px] font-extrabold uppercase transition-all border ${
                              managerStatus === st
                                ? 'bg-coffee-accent border-coffee-accent text-background shadow'
                                : 'bg-[#130d0b]/40 border-coffee-border/40 text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/10'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-coffee-text-muted block">Internal Manager Notes</label>
                      <textarea
                        value={managerNotes}
                        onChange={(e) => setManagerNotes(e.target.value)}
                        placeholder="Log email conversation, custom pricing quotes, or notes here..."
                        rows={4}
                        className="w-full bg-[#130d0b] border border-coffee-border/40 rounded p-2 text-xs text-coffee-cream outline-none focus:border-coffee-accent placeholder:text-coffee-text-muted resize-none transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updateIntentMutation.isPending}
                      className="w-full py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {updateIntentMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Review Log</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/20 bg-[#0e0907]/30 text-center py-20 text-xs text-coffee-text-muted flex flex-col items-center justify-center gap-2">
                <FileText className="w-8 h-8 text-coffee-border/50 animate-pulse" />
                <p>Select a signup record from the list to view metadata, edit comments, or change execution status.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
