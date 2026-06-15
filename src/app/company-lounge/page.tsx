'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { TrendingUp, RefreshCw, Briefcase, DollarSign, Award, Users, Globe, Settings, MapPin, Activity, ListFilter, Calendar } from 'lucide-react';

interface CompanyProfile {
  name: string;
  hq: string;
  valuation: string;
  keyInvestors: string;
  employeeCount: string;
  milestones: { year: string; event: string }[];
  products: string[];
  acquisitions: string[];
  openRoles: string[];
}

import HubHeader from '@/components/HubHeader';
import { Compass, Cpu, Bot } from 'lucide-react';

export default function CompanyLoungePage() {
  const { data: trendsData, isLoading, refetch, isRefetching } = trpc.signals.getTrends.useQuery();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('openai');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'PRODUCTS' | 'HIRING'>('OVERVIEW');

  // Filter trends to companies only
  const companyTrends = trendsData?.ai.filter((item) => item.type === 'COMPANY') || [];

  const companyProfiles: Record<string, CompanyProfile> = {
    openai: {
      name: 'OpenAI',
      hq: 'San Francisco, CA',
      valuation: '$157 Billion (Last round: $6.6B)',
      keyInvestors: 'Thrive Capital, Microsoft, NVIDIA, SoftBank',
      employeeCount: '2,200+ globally',
      milestones: [
        { year: '2015', event: 'Founded as non-profit AI research lab.' },
        { year: '2019', event: 'Created capped-profit transition structure; partnered with Microsoft.' },
        { year: '2022', event: 'Launched ChatGPT, initiating generative consumer AI wave.' },
        { year: '2024', event: 'Announced custom reasoning models (o1) and search indexes.' }
      ],
      products: ['ChatGPT Premium', 'o1 / o1-preview', 'GPT-4o APIs', 'DALL-E 3', 'Sora Video API'],
      acquisitions: ['Rockset (database search sharding)', 'Multi (enterprise collaboration)'],
      openRoles: ['GPU Compiler Optimizations Engineer', 'Agentic UI Integration Lead', 'Safety Alignment Researcher']
    },
    anthropic: {
      name: 'Anthropic',
      hq: 'San Francisco, CA',
      valuation: '$40 Billion (Last round: $4B from Amazon)',
      keyInvestors: 'Amazon, Google, Salesforce Ventures',
      employeeCount: '950+ globally',
      milestones: [
        { year: '2021', event: 'Founded by former OpenAI researchers focusing on safety.' },
        { year: '2023', event: 'Launched Claude API; established strategic partner Bedrock connection.' },
        { year: '2024', event: 'Released Claude 3.5 Opus with deep reasoning context mapping.' }
      ],
      products: ['Claude.ai Pro', 'Claude 3.5 Sonnet API', 'Claude Enterprise Desktop Suite', 'Artifacts Console'],
      acquisitions: ['None public'],
      openRoles: ['Constitutional AI Researcher', 'RAG Graph Engineer', 'Enterprise Client Partner']
    },
    perplexity: {
      name: 'Perplexity AI',
      hq: 'San Francisco, CA',
      valuation: '$8 Billion (Last round: $500M)',
      keyInvestors: 'NVIDIA, Jeff Bezos, IVP, NEA',
      employeeCount: '180+ globally',
      milestones: [
        { year: '2022', event: 'Founded to pioneer conversational web search queries.' },
        { year: '2023', event: 'Expanded indexing architecture using external semantic models.' },
        { year: '2024', event: 'Launches publisher ad revenue sharing integrations.' }
      ],
      products: ['Perplexity Pro Search', 'Perplexity Enterprise API', 'Search Ads Network'],
      acquisitions: ['None public'],
      openRoles: ['Real-time Search Indexing Lead', 'Ad Operations Engineer', 'Mobile Client Architect']
    }
  };

  const selectedProfile = companyProfiles[selectedCompanyId] || companyProfiles['openai'];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <HubHeader 
          title="AI & Industry Radar" 
          subtitle="Deep telemetry on venture rounds, product lineups, historical milestones, and hiring maps."
          icon={Bot}
          tabs={[
            { name: 'AI Radar', href: '/ai-radar', icon: Compass },
            { name: 'Companies', href: '/company-lounge', icon: Users },
            { name: 'Models', href: '/model-roastery', icon: Cpu },
          ]}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-coffee-cream">Company Profiles & Venture Telemetry</span>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Lounge</span>
          </button>
        </div>

        {/* Loader */}
        {isLoading ? (
          <div className="glass-panel p-20 rounded-xl">
            <RefreshCw className="w-8 h-8 text-coffee-accent animate-spin mx-auto" />
            <p className="text-xs text-coffee-text-muted text-center mt-2">Opening lounge gates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left selector */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider px-1">Organization Directory</span>
              <div className="space-y-2">
                {Object.keys(companyProfiles).map((key) => {
                  const prof = companyProfiles[key];
                  const isSelected = selectedCompanyId === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCompanyId(key)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                        isSelected
                          ? 'bg-coffee-card border-coffee-accent shadow-md shadow-coffee-accent/5'
                          : 'bg-[#0f0a08]/50 border-coffee-border/40 hover:bg-coffee-card/50 hover:border-coffee-border/70'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`text-xs font-bold font-display ${isSelected ? 'text-coffee-accent' : 'text-coffee-cream'}`}>
                          {prof.name}
                        </span>
                        <span className="block text-[9px] text-coffee-text-muted font-mono">{prof.hq}</span>
                      </div>
                      <span className="text-[9px] font-mono text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-border/30">
                        Select
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right details */}
            <div className="lg:col-span-8 space-y-6">
              <div className="glass-panel rounded-xl p-6 md:p-8 border border-coffee-border/80 bg-gradient-to-b from-coffee-card/85 to-[#0c0806] space-y-6 relative">
                <div className="h-[2px] w-full bg-coffee-accent absolute top-0 left-0 right-0" />

                {/* Title */}
                <div className="flex justify-between items-center pb-4 border-b border-coffee-border/20">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-coffee-accent" />
                    <div>
                      <h2 className="text-base font-display font-extrabold text-coffee-cream">
                        {selectedProfile.name} Corporate Profile
                      </h2>
                      <p className="text-[9px] font-mono text-coffee-text-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> HQ: {selectedProfile.hq}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                    Verified
                  </span>
                </div>

                {/* Sub tabs */}
                <div className="flex border-b border-coffee-border/20 gap-1 pb-1">
                  {(['OVERVIEW', 'TIMELINE', 'PRODUCTS', 'HIRING'] as const).map((tab) => {
                    const label = 
                      tab === 'OVERVIEW' ? 'Telemetry' :
                      tab === 'TIMELINE' ? 'Milestones' :
                      tab === 'PRODUCTS' ? 'Product Lineup' : 'Hiring Pulse';
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-[10.5px] font-bold transition-all border-b-2 ${
                          activeTab === tab
                            ? 'border-coffee-accent text-coffee-accent bg-coffee-accent/5'
                            : 'border-transparent text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/10'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Panel content */}
                <div className="bg-[#070403] border border-coffee-border/40 rounded-xl p-5 min-h-[200px] text-xs leading-relaxed flex flex-col justify-center">
                  {activeTab === 'OVERVIEW' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-coffee-accent text-[12px] flex items-center gap-1.5">
                        <Activity className="w-4 h-4" /> Capital & Headcount Telemetry
                      </h4>
                      <div className="grid grid-cols-2 gap-4 bg-coffee-dark/40 p-4 rounded-lg border border-coffee-border/20 font-mono text-[11px]">
                        <div className="space-y-1">
                          <span className="text-[9px] text-coffee-text-muted block">Market Valuation</span>
                          <span className="text-coffee-cream font-bold">{selectedProfile.valuation}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-coffee-text-muted block">Team Size</span>
                          <span className="text-coffee-cream font-bold">{selectedProfile.employeeCount}</span>
                        </div>
                      </div>
                      <div className="space-y-1 bg-coffee-dark/20 p-3 rounded-lg border border-coffee-border/20">
                        <span className="text-[9.5px] font-mono text-coffee-text-muted block">Major Cap Backers</span>
                        <p className="text-coffee-cream font-medium">{selectedProfile.keyInvestors}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'TIMELINE' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-coffee-accent text-[12px] flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> Milestone Logs
                      </h4>
                      <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-3 before:w-[1.5px] before:bg-coffee-border">
                        {selectedProfile.milestones.map((m, idx) => (
                          <div key={idx} className="relative pl-8 text-[11.5px]">
                            <div className="absolute left-[9px] top-1.5 w-2 h-2 rounded-full bg-coffee-accent border border-[#070403]" />
                            <strong className="text-coffee-accent font-mono pr-2">{m.year}:</strong>
                            <span className="text-coffee-cream/80">{m.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'PRODUCTS' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-coffee-accent text-[12px] flex items-center gap-1.5">
                        <Settings className="w-4 h-4" /> Active Production Lineup
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedProfile.products.map((prod, idx) => (
                          <div key={idx} className="p-3 bg-coffee-dark/40 rounded border border-coffee-border/30 text-coffee-cream flex items-center gap-2 font-mono text-[10.5px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-coffee-accent" /> {prod}
                          </div>
                        ))}
                      </div>
                      {selectedProfile.acquisitions.length > 0 && selectedProfile.acquisitions[0] !== 'None public' && (
                        <div className="pt-2 border-t border-coffee-border/20 space-y-1">
                          <span className="text-[9.5px] font-mono text-coffee-text-muted block flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-coffee-accent" /> Strategic Acquisitions
                          </span>
                          <p className="text-coffee-cream font-medium">{selectedProfile.acquisitions.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'HIRING' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-coffee-accent text-[12px] flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" /> Open Roles & Recruitment Index
                      </h4>
                      <div className="space-y-3">
                        {selectedProfile.openRoles.map((role, idx) => (
                          <div key={idx} className="p-3 bg-[#0a0605] hover:bg-[#0f0a08] border border-coffee-border/40 hover:border-coffee-accent/40 rounded-lg flex justify-between items-center transition-all">
                            <span className="text-coffee-cream font-bold">{role}</span>
                            <span className="text-[8.5px] font-mono text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-border/20 uppercase">
                              Apply
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
