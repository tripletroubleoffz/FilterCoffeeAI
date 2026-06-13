'use client';

import React from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { TrendingUp, RefreshCw, Sparkles, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MarketSignalsPage() {
  const { data: trendsData, isLoading, refetch, isRefetching } = trpc.signals.getTrends.useQuery();

  const financeTrends = trendsData?.finance || [];

  const getChangeStyle = (val: number) => {
    if (val > 0) return { color: 'text-emerald-400', icon: ArrowUpRight };
    if (val < 0) return { color: 'text-red-400', icon: ArrowDownRight };
    return { color: 'text-coffee-text-muted', icon: ArrowUpRight };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-coffee-accent animate-pulse" />
              Real-Time Market Signals
            </h1>
            <p className="text-xs text-coffee-text-muted">Track NASDAQ indicators, AI stocks, Federal Reserve rate decisions, and tech economic metrics.</p>
          </div>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Market</span>
          </button>
        </div>

        {/* Loader */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-coffee-accent animate-spin" />
            <p className="text-xs text-coffee-text-muted">Fetching ticker rates...</p>
          </div>
        ) : financeTrends.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center space-y-4 max-w-md mx-auto mt-12">
            <Sparkles className="w-8 h-8 text-coffee-accent mx-auto" />
            <h3 className="text-sm font-bold text-coffee-cream">No Market Tickers</h3>
            <p className="text-xs text-coffee-text-muted">Database has no active finance indicators. Run auto-seeding routines to initialize.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financeTrends.map((trend) => {
              const { color: changeColor, icon: ArrowIcon } = getChangeStyle(trend.change);

              const isRate = trend.name.toLowerCase().includes('rate');
              const isValuation = trend.value > 1000000;

              // Helper to format values elegantly (e.g. currency formatting, stock pricing, percentages)
              const formatTrendValue = (val: number) => {
                if (isRate) return `${val.toFixed(2)}%`;
                if (isValuation) return `₹${(val / 1000000000).toFixed(1)}B`;
                if (val > 1000) return val.toLocaleString();
                return `₹${val.toFixed(2)}`;
              };

              return (
                <div 
                  key={trend.id}
                  className="glass-panel rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/95 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-coffee-accent/5 hover:-translate-y-1 transition-all duration-300 relative"
                >
                  <div className="h-[2px] w-full bg-gradient-to-r from-coffee-accent/20 via-coffee-accent to-coffee-accent/20" />
                  
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-coffee-text-muted">
                      <span>Index / Ticker</span>
                      <span className="uppercase tracking-wider">{trend.period}</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-coffee-cream leading-snug">
                        {trend.name}
                      </h3>
                      <div className="flex items-baseline gap-2 pt-2">
                        <span className="text-xl font-display font-extrabold text-white">
                          {formatTrendValue(trend.value)}
                        </span>
                        {trend.change !== 0 && (
                          <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${changeColor}`}>
                            <ArrowIcon className="w-3 h-3" />
                            {trend.change >= 0 ? '+' : ''}{trend.change.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* details */}
                    <p className="text-xs text-coffee-text-muted leading-relaxed bg-[#070403] p-3 rounded-lg border border-coffee-border/40 min-h-[50px]">
                      {trend.details || 'Real-time market analytics feed for stock indicators.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
