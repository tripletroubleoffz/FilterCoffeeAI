'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { CreditCard, RefreshCw, Landmark, Clock, ArrowUpRight, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';
import BrewingLoader from '@/components/BrewingLoader';

interface Deal {
  id: string;
  startup: string;
  round: string;
  amount: string;
  valuation: string;
  leadInvestor: string;
  date: string;
  strategicRationale: string;
  coInvestors: string;
}

import HubHeader from '@/components/HubHeader';
import { Coffee, Activity, Bot } from 'lucide-react';

export default function FundingBoardPage() {
  const { data: signals, isLoading, refetch, isRefetching } = trpc.signals.getSignals.useQuery({ category: 'Finance' });
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const deals: Deal[] = [
    {
      id: 'deal-1',
      startup: 'Physical Intelligence',
      round: 'Seed Round',
      amount: '$400 Million',
      valuation: '$2.4 Billion',
      leadInvestor: 'Thrive Capital',
      date: 'Jun 2026',
      strategicRationale: 'Funding training of large-scale universal models for robotics controls, moving AI capabilities from pure digital agents to physical warehouse sorting.',
      coInvestors: 'Bezos Expeditions, OpenAI, Thrive Capital, Redpoint'
    },
    {
      id: 'deal-2',
      startup: 'Qdrant',
      round: 'Series B',
      amount: '$45 Million',
      valuation: '$280 Million',
      leadInvestor: 'Benchmark',
      date: 'May 2026',
      strategicRationale: 'Scale self-healing partitioned vector architectures capable of handling real-time indexing for billions of streaming telemetry events.',
      coInvestors: 'Scale Venture Partners, Venture Highway'
    },
    {
      id: 'deal-3',
      startup: 'Cognition AI',
      round: 'Series A',
      amount: '$175 Million',
      valuation: '$2.0 Billion',
      leadInvestor: 'Founders Fund',
      date: 'Apr 2026',
      strategicRationale: 'Capital to scale GPU clusters for training Devin, an autonomous software engineering agent running complex development pipelines.',
      coInvestors: 'Thrive Capital, Elad Gil, Patrick Collison'
    }
  ];

  const handleRowClick = (id: string) => {
    setSelectedDealId(selectedDealId === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <HubHeader 
          title="Market Intelligence" 
          subtitle="Interactive VC deal flow tracker, capital distributions, and lead syndicate partner registries."
          icon={TrendingUp}
          tabs={[
            { name: 'Startups', href: '/startup-cafe', icon: Coffee },
            { name: 'Funding', href: '/funding-board', icon: DollarSign },
            { name: 'Signals', href: '/market-signals', icon: TrendingUp },
            { name: 'Explorer', href: '/signals', icon: Activity },
          ]}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-coffee-cream">Venture Deal Flow</span>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Deal Flow</span>
          </button>
        </div>

        {/* Visual Capital Flow Sankey representation */}
        <div className="glass-panel p-5 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4">
          <h3 className="text-xs font-mono uppercase text-coffee-accent tracking-widest flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Visual Syndicate Capital Flows
          </h3>
          <div className="relative w-full h-36 bg-[#070403] border border-coffee-border/20 rounded-lg p-4 flex justify-between items-center text-[10px] font-mono select-none overflow-hidden">
            {/* SVG Link streams */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
              {/* Thrive to Pi */}
              <path d="M 100 30 Q 300 20, 500 40" fill="none" stroke="rgba(194, 136, 84, 0.2)" strokeWidth="8" />
              {/* Benchmark to Qdrant */}
              <path d="M 100 60 Q 300 60, 500 80" fill="none" stroke="rgba(194, 136, 84, 0.15)" strokeWidth="6" />
              {/* Founders Fund to Cognition */}
              <path d="M 100 90 Q 300 90, 500 50" fill="none" stroke="rgba(194, 136, 84, 0.25)" strokeWidth="10" />
            </svg>

            {/* Left nodes (VCs) */}
            <div className="space-y-3 z-10">
              <div className="px-3 py-1 bg-coffee-card border border-coffee-border rounded">Thrive Capital</div>
              <div className="px-3 py-1 bg-coffee-card border border-coffee-border rounded">Benchmark VC</div>
              <div className="px-3 py-1 bg-coffee-card border border-coffee-border rounded">Founders Fund</div>
            </div>

            {/* Right nodes (Startups) */}
            <div className="space-y-4 z-10 text-right">
              <div className="px-3 py-1 bg-coffee-card border border-coffee-border rounded text-coffee-accent font-bold">Physical Intel ($400M)</div>
              <div className="px-3 py-1 bg-coffee-card border border-coffee-border rounded text-coffee-accent font-bold">Cognition AI ($175M)</div>
              <div className="px-3 py-1 bg-coffee-card border border-coffee-border rounded text-coffee-accent font-bold">Qdrant Vector ($45M)</div>
            </div>
          </div>
        </div>

        {/* Interactive Deal Flow Table */}
        <div className="glass-panel rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 overflow-hidden shadow-lg">
          <div className="p-4 bg-coffee-dark/40 border-b border-coffee-border/20 text-xs font-mono uppercase text-coffee-text-muted tracking-wider">
            Deal Flow Registry (Click rows to expand details)
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs leading-normal">
              <thead>
                <tr className="border-b border-coffee-border/30 bg-coffee-dark/20 text-coffee-text-muted uppercase font-mono text-[9px] tracking-wider">
                  <th className="p-4">Startup</th>
                  <th className="p-4">Round</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Valuation</th>
                  <th className="p-4">Lead Investor</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const isExpanded = selectedDealId === deal.id;
                  return (
                    <React.Fragment key={deal.id}>
                      <tr
                        onClick={() => handleRowClick(deal.id)}
                        className={`border-b border-coffee-border/20 hover:bg-coffee-border/10 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-coffee-border/20' : ''
                        }`}
                      >
                        <td className="p-4 font-display font-extrabold text-coffee-cream">{deal.startup}</td>
                        <td className="p-4 font-mono text-coffee-text-muted">{deal.round}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">{deal.amount}</td>
                        <td className="p-4 font-mono text-coffee-cream">{deal.valuation}</td>
                        <td className="p-4 text-coffee-cream">{deal.leadInvestor}</td>
                        <td className="p-4 text-right text-coffee-text-muted font-mono">{deal.date}</td>
                      </tr>

                      {/* Expanded panel row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-[#070403]/80 p-6 border-b border-coffee-border/30">
                            <div className="space-y-4 max-w-3xl">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-coffee-accent uppercase tracking-widest block">
                                  Strategic Rationale
                                </span>
                                <p className="text-xs text-coffee-cream leading-relaxed bg-[#0c0806] p-3 rounded border border-coffee-border/40">
                                  {deal.strategicRationale}
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-coffee-text-muted uppercase tracking-widest block">
                                  Co-Investors
                                </span>
                                <p className="text-xs text-coffee-text-muted font-mono">
                                  {deal.coInvestors}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
