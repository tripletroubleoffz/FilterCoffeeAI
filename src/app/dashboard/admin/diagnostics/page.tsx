'use client';

import React from 'react';
import DashboardLayout from '../../layout';
import { trpc } from '@/utils/trpc';
import { Activity, RefreshCw, AlertCircle, CheckCircle, Database } from 'lucide-react';

export default function AdminDiagnosticsPage() {
  const { data: sources, isLoading, refetch } = trpc.admin.getSources.useQuery();
  
  // We don't have a trpc route for just viewing logs/diagnostics, but we can display source health.
  
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-display font-bold text-coffee-cream flex items-center gap-2">
              <Activity className="w-6 h-6 text-coffee-accent" />
              Feed Diagnostics
            </h1>
            <p className="text-sm text-coffee-text-muted">Monitor the real-time health and parsing status of RSS/API ingestions.</p>
          </div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-coffee-border/30">
            <div className="text-xs text-coffee-text-muted font-bold uppercase tracking-wider mb-2">Total Feeds</div>
            <div className="text-3xl font-display font-extrabold text-coffee-cream">{sources?.length || 0}</div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-coffee-border/30">
            <div className="text-xs text-coffee-text-muted font-bold uppercase tracking-wider mb-2">Healthy Feeds</div>
            <div className="text-3xl font-display font-extrabold text-emerald-400">
              {sources?.filter(s => s.healthStatus === 'HEALTHY').length || 0}
            </div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-coffee-border/30">
            <div className="text-xs text-coffee-text-muted font-bold uppercase tracking-wider mb-2">Failing Feeds</div>
            <div className="text-3xl font-display font-extrabold text-red-400">
              {sources?.filter(s => s.healthStatus !== 'HEALTHY').length || 0}
            </div>
          </div>
        </div>

        {/* Source Health Table */}
        <div className="glass-panel rounded-xl border border-coffee-border/30 overflow-hidden">
          <div className="border-b border-coffee-border/30 bg-coffee-dark/50 px-6 py-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-coffee-accent" />
            <h2 className="text-sm font-bold text-coffee-cream uppercase tracking-wide">Ingestion Endpoints</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-coffee-border/20 bg-[#070403]/50 text-coffee-text-muted font-mono">
                  <th className="px-6 py-3">Source Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Format</th>
                  <th className="px-6 py-3">Last Fetched</th>
                  <th className="px-6 py-3">Last Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-border/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-coffee-text-muted">Loading diagnostics...</td>
                  </tr>
                ) : sources?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-coffee-text-muted">No sources configured.</td>
                  </tr>
                ) : (
                  sources?.map((source) => (
                    <tr key={source.id} className="hover:bg-coffee-border/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-coffee-cream">{source.name}</td>
                      <td className="px-6 py-4">
                        {source.healthStatus === 'HEALTHY' ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded w-fit">
                            <CheckCircle className="w-3 h-3" /> Healthy
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 font-bold bg-red-950/30 px-2 py-0.5 rounded w-fit">
                            <AlertCircle className="w-3 h-3" /> {source.healthStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-[#070403] border border-coffee-border/30 px-2 py-0.5 rounded text-coffee-accent font-mono">
                          {source.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-coffee-text-muted">{source.format}</td>
                      <td className="px-6 py-4 text-coffee-text-muted">
                        {source.lastFetched ? new Date(source.lastFetched).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        {source.lastError ? (
                          <div className="max-w-xs text-red-400 font-mono text-[10px] truncate bg-red-950/20 px-2 py-1 rounded border border-red-900/30" title={source.lastError}>
                            {source.lastError}
                          </div>
                        ) : (
                          <span className="text-coffee-text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
