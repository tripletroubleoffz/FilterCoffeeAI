'use client';

import React from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { Briefcase, RefreshCw, Sparkles, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';

import HubHeader from '@/components/HubHeader';
import { GraduationCap, BookOpen, Cpu } from 'lucide-react';

export default function CareerRoastPage() {
  const { data: trendsData, isLoading, refetch, isRefetching } = trpc.signals.getTrends.useQuery();

  const careerTrends = trendsData?.career || [];

  const getChangeColor = (val: number) => {
    return val >= 0 ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <HubHeader 
          title="Career Center" 
          subtitle="Real-time stats on rising programming languages, average base salaries, and developer descriptions."
          icon={GraduationCap}
          tabs={[
            { name: 'Research Lab', href: '/research-lab', icon: BookOpen },
            { name: 'Career Roast', href: '/career-roast', icon: Briefcase },
            { name: 'Skill Radar', href: '/skill-radar', icon: Cpu },
            { name: 'Hiring Pulse', href: '/hiring-pulse', icon: TrendingUp },
          ]}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-coffee-cream">Hiring & Skills Roast</span>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* Loader */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-coffee-accent animate-spin" />
            <p className="text-xs text-coffee-text-muted">Loading hiring statistics...</p>
          </div>
        ) : careerTrends.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center space-y-4 max-w-md mx-auto mt-12">
            <Sparkles className="w-8 h-8 text-coffee-accent mx-auto" />
            <h3 className="text-sm font-bold text-coffee-cream">No Skills Indexed</h3>
            <p className="text-xs text-coffee-text-muted">Database has no career metrics. Run auto-seeding routines to initialize.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Skills & Adoption Card */}
            <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4">
              <h3 className="text-sm font-bold text-coffee-cream flex items-center gap-2 border-b border-coffee-border/30 pb-3">
                <Sparkles className="w-4 h-4 text-coffee-accent" />
                Trending Skills & Adoption Rates
              </h3>
              <div className="space-y-3">
                {careerTrends
                  .filter((t) => t.type === 'SKILL' || t.type === 'ADOPTION')
                  .map((trend) => (
                    <div key={trend.id} className="flex justify-between items-center bg-coffee-dark/40 p-3 rounded-lg border border-coffee-border/20">
                      <div>
                        <h4 className="text-xs font-bold text-coffee-cream">{trend.name}</h4>
                        <span className="text-[10px] text-coffee-text-muted">{trend.value}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono ${getChangeColor(trend.change)}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </span>
                        <span className="block text-[8px] text-coffee-text-muted font-mono uppercase">{trend.period}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Emerging Roles & Salaries */}
            <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4">
              <h3 className="text-sm font-bold text-coffee-cream flex items-center gap-2 border-b border-coffee-border/30 pb-3">
                <TrendingUp className="w-4 h-4 text-coffee-accent" />
                Emerging Roles & Salaries Index
              </h3>
              <div className="space-y-3">
                {careerTrends
                  .filter((t) => t.type === 'ROLE' || t.type === 'SALARY')
                  .map((trend) => (
                    <div key={trend.id} className="flex justify-between items-center bg-coffee-dark/40 p-3 rounded-lg border border-coffee-border/20">
                      <div>
                        <h4 className="text-xs font-bold text-coffee-cream">{trend.name}</h4>
                        <span className="text-[10px] text-coffee-text-muted">{trend.value}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono ${getChangeColor(trend.change)} flex items-center gap-0.5 justify-end`}>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          {trend.change >= 0 ? '+' : ''}{trend.change.toFixed(1)}%
                        </span>
                        <span className="block text-[8px] text-coffee-text-muted font-mono uppercase">{trend.period}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
