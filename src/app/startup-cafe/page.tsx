'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { Coffee, RefreshCw, DollarSign, TrendingUp, Users, Sparkles, X, Award, HelpCircle } from 'lucide-react';

interface Startup {
  id: string;
  name: string;
  valuation: string;
  founders: string;
  growthMoM: string;
  capitalRaised: string;
  hiringRate: string;
  description: string;
  keyProduct: string;
  headquarters: string;
}

import HubHeader from '@/components/HubHeader';
import { Activity, Bot } from 'lucide-react';

export default function StartupCafePage() {
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [filterStage, setFilterStage] = useState<'ALL' | 'ACCELERATED' | 'HIGH_VALUATION'>('ALL');

  const startups: Startup[] = [
    {
      id: 'physical-intelligence',
      name: 'Physical Intelligence',
      valuation: '$2.4 Billion',
      founders: 'Karol Hausman, Sergey Levine, Chelsea Finn',
      growthMoM: '+18.5%',
      capitalRaised: '$400M Seed round',
      hiringRate: 'High (+24% QoQ)',
      description: 'Universal robotic brains combining reinforcement learning with foundation vision-language models for physical control.',
      keyProduct: 'Pi-1 Robot Controller',
      headquarters: 'San Francisco, CA'
    },
    {
      id: 'qdrant',
      name: 'Qdrant',
      valuation: '$280 Million',
      founders: 'Andre Zayarni, Andrey Vasnetsov',
      growthMoM: '+12.2%',
      capitalRaised: '$45M Series B',
      hiringRate: 'Steady (+10% QoQ)',
      description: 'High-throughput, real-time distributed vector databases optimized for large-scale semantic retrievals.',
      keyProduct: 'Qdrant Cloud Sharded Engine',
      headquarters: 'Berlin, Germany'
    },
    {
      id: 'cognition-ai',
      name: 'Cognition AI',
      valuation: '$2.0 Billion',
      founders: 'Scott Wu, Steven Hao, Walden Yan',
      growthMoM: '+35.0%',
      capitalRaised: '$175M Series A from Founders Fund',
      hiringRate: 'Hyper-Growth (+45% QoQ)',
      description: 'Stateful, autonomous code reasoning agents capable of planning and deploying full software stacks.',
      keyProduct: 'Devin AI Software Engineer',
      headquarters: 'New York, NY'
    },
    {
      id: 'cohere',
      name: 'Cohere',
      valuation: '$5.5 Billion',
      founders: 'Aidan Gomez, Ivan Zhang, Nick Frosst',
      growthMoM: '+8.4%',
      capitalRaised: '$500M Series D',
      hiringRate: 'Steady (+8% QoQ)',
      description: 'Enterprise-grade conversational LLMs and embedding architectures designed with multi-cloud deployments.',
      keyProduct: 'Command R+ Enterprise Model',
      headquarters: 'Toronto, Canada'
    }
  ];

  const filteredStartups = startups.filter(s => {
    if (filterStage === 'ACCELERATED') return s.growthMoM.includes('+18') || s.growthMoM.includes('+35');
    if (filterStage === 'HIGH_VALUATION') return s.valuation.includes('Billion');
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <HubHeader 
          title="Market Intelligence" 
          subtitle="Discover emerging AI startups, total capital backing, active founders, and monthly team growth rates."
          icon={TrendingUp}
          tabs={[
            { name: 'Startups', href: '/startup-cafe', icon: Coffee },
            { name: 'Funding', href: '/funding-board', icon: DollarSign },
            { name: 'Signals', href: '/market-signals', icon: TrendingUp },
            { name: 'Explorer', href: '/signals', icon: Activity },
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <span className="text-xs font-bold text-coffee-cream">AI Startup Ecosystem</span>
          
          {/* Quick Filters */}
          <div className="flex gap-1.5 p-1 bg-coffee-dark rounded-lg border border-coffee-border/40 w-fit">
            {(['ALL', 'ACCELERATED', 'HIGH_VALUATION'] as const).map((stage) => {
              const label = stage === 'ALL' ? 'All Startups' : stage === 'ACCELERATED' ? 'Accelerating Growth' : 'Unicorns ($1B+)';
              return (
                <button
                  key={stage}
                  onClick={() => setFilterStage(stage)}
                  className={`px-3 py-1.5 rounded text-[10px] font-semibold tracking-wide transition-all ${
                    filterStage === stage
                      ? 'bg-coffee-accent text-[#090504]'
                      : 'text-coffee-text-muted hover:text-coffee-cream'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Startups list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStartups.map((startup) => (
            <div
              key={startup.id}
              onClick={() => setSelectedStartup(startup)}
              className="glass-panel p-6 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/90 space-y-4 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative"
            >
              <div className="h-[2px] w-full bg-gradient-to-r from-coffee-accent/20 via-coffee-accent to-coffee-accent/20 absolute top-0 left-0 right-0" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/20 font-bold uppercase">
                    {startup.headquarters}
                  </span>
                  <span className="text-emerald-400 font-bold">Growth: {startup.growthMoM}</span>
                </div>

                <h3 className="text-base font-display font-extrabold text-coffee-cream group-hover:text-white transition-colors">
                  {startup.name}
                </h3>

                <p className="text-xs text-coffee-text-muted line-clamp-2">
                  {startup.description}
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-coffee-border/20 pt-3 mt-3">
                <div>Valuation: <span className="text-coffee-cream font-bold">{startup.valuation}</span></div>
                <div className="text-right">Product: <span className="text-coffee-accent font-bold">{startup.keyProduct}</span></div>
              </div>
            </div>
          ))}
        </div>

        {/* Startup details Modal */}
        {selectedStartup && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg bg-[#0f0a08] border border-coffee-border/80 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="h-[3px] w-full bg-coffee-accent" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedStartup(null)}
                className="absolute top-4 right-4 p-2 text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 space-y-6 text-xs leading-relaxed">
                {/* Header */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded bg-[#070403] border border-coffee-accent/30 flex items-center justify-center text-coffee-accent font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-extrabold text-coffee-cream">{selectedStartup.name}</h2>
                    <p className="text-[9px] font-mono text-coffee-text-muted">HQ: {selectedStartup.headquarters}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[8px] font-mono text-coffee-accent uppercase tracking-wider">Startup Focus</span>
                  <p className="text-coffee-cream/90 bg-[#070403] p-4 rounded border border-coffee-border/40">
                    {selectedStartup.description}
                  </p>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-4 bg-coffee-dark/40 p-4 rounded-lg border border-coffee-border/20 font-mono text-[10.5px]">
                  <div className="space-y-1">
                    <span className="text-[8.5px] text-coffee-text-muted uppercase">Valuation</span>
                    <p className="text-coffee-cream font-bold">{selectedStartup.valuation}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[8.5px] text-coffee-text-muted uppercase">Funding Inflow</span>
                    <p className="text-emerald-400 font-bold">{selectedStartup.capitalRaised}</p>
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-[8.5px] text-coffee-text-muted uppercase">Founders</span>
                    <p className="text-coffee-cream font-bold truncate" title={selectedStartup.founders}>{selectedStartup.founders}</p>
                  </div>
                  <div className="space-y-1 text-right pt-2">
                    <span className="text-[8.5px] text-coffee-text-muted uppercase">Recruiting Rate</span>
                    <p className="text-coffee-accent font-bold">{selectedStartup.hiringRate}</p>
                  </div>
                </div>

                {/* Core product */}
                <div className="space-y-1 bg-coffee-dark/20 p-3 rounded-lg border border-coffee-border/20 flex justify-between items-center">
                  <span className="font-bold text-coffee-cream flex items-center gap-1.5 text-[11px]">
                    <Award className="w-4 h-4 text-coffee-accent" /> Key Release Product
                  </span>
                  <span className="text-coffee-accent font-mono font-bold bg-[#070403] px-2 py-0.5 rounded border border-coffee-border/40">
                    {selectedStartup.keyProduct}
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setSelectedStartup(null)}
                    className="px-5 py-2.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded-xl text-xs font-bold transition-all"
                  >
                    Dismiss Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
