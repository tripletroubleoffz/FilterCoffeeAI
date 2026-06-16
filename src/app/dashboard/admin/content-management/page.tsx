'use client';

import React from 'react';
import { trpc } from '@/utils/trpc';
import { RefreshCw, AlertTriangle, Database, Activity } from 'lucide-react';

export default function ContentManagementPage() {
  const { data: analytics, isLoading: analyticsLoading } = trpc.content.getAnalytics.useQuery();
  const { data: sources, isLoading: sourcesLoading } = trpc.content.getSources.useQuery();
  const { data: jobs, isLoading: jobsLoading } = trpc.content.getIngestionJobs.useQuery();
  
  const triggerIngestion = trpc.content.triggerIngestion.useMutation();

  const handleManualRefresh = (category: string) => {
    triggerIngestion.mutate({ category });
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-coffee-text-primary">Content Intelligence Engine</h1>
        <button 
          onClick={() => handleManualRefresh('AI')}
          disabled={triggerIngestion.isPending}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${triggerIngestion.isPending ? 'animate-spin' : ''}`} />
          Force Sync AI Sources
        </button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-coffee-dark/50 border-coffee-border rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Database className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-coffee-text-muted">Ingested Today</p>
              <h3 className="text-2xl font-bold">{analytics?.[0]?.articlesIngested || 0}</h3>
            </div>
          </div>
        </div>
        <div className="p-6 bg-coffee-dark/50 border-coffee-border rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-coffee-text-muted">Clusters Created</p>
              <h3 className="text-2xl font-bold">{analytics?.[0]?.clustersCreated || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sources Health */}
        <div className="p-6 bg-coffee-dark/50 border-coffee-border rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Source Providers Health
          </h2>
          {sourcesLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {sources?.map(source => (
                <div key={source.id} className="flex justify-between items-center p-3 rounded-lg bg-coffee-dark/30 border border-coffee-border/40">
                  <div>
                    <p className="font-semibold">{source.name}</p>
                    <p className="text-xs text-coffee-text-muted">{source.category} • {source.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {source.healthStatus === 'ERROR' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span className={`text-xs px-2 py-1 rounded-full ${source.healthStatus === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {source.healthStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="p-6 bg-coffee-dark/50 border-coffee-border rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Recent Ingestion Jobs</h2>
          {jobsLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {jobs?.slice(0, 5).map(job => (
                <div key={job.id} className="p-3 rounded-lg bg-coffee-dark/30 border border-coffee-border/40">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-sm">{job.sourceName}</span>
                    <span className={`text-xs ${job.status === 'SUCCESS' ? 'text-emerald-400' : job.status === 'FAILED' ? 'text-red-400' : 'text-blue-400'}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="text-xs text-coffee-text-muted flex justify-between">
                    <span>Fetched: {job.itemsFetched} | Added: {job.itemsAdded} | Duplicates: {job.duplicatesFound}</span>
                    <span>{job.executionTimeMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
