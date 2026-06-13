'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { Cpu, RefreshCw, Layers, Zap, Calendar, Gauge, BarChart3, Calculator, Award, ArrowRight } from 'lucide-react';

interface ModelRoastProfile {
  name: string;
  developer: string;
  contextWindow: string;
  mmlu: string;
  costInput: number; // cost per million tokens in USD
  costOutput: number;
  capabilities: string;
  bestUse: string;
}

export default function ModelRoasteryPage() {
  const { data: trendsData, isLoading, refetch, isRefetching } = trpc.signals.getTrends.useQuery();
  const [selectedModelId, setSelectedModelId] = useState<string>('gpt-5');
  const [monthlyTokens, setMonthlyTokens] = useState<number>(5000000); // default 5M tokens

  const modelProfiles: Record<string, ModelRoastProfile> = {
    'gpt-5': {
      name: 'GPT-5 Preview',
      developer: 'OpenAI',
      contextWindow: '256,000 tokens',
      mmlu: '91.2%',
      costInput: 2.50,
      costOutput: 10.00,
      capabilities: 'Native multi-agent orchestration, YAML-defined state routing, advanced logical planning, visual chart auditing.',
      bestUse: 'Complex autonomous agent routing and declarative workflow automation.'
    },
    'claude-3-5-opus': {
      name: 'Claude 3.5 Opus',
      developer: 'Anthropic',
      contextWindow: '500,000 tokens',
      mmlu: '89.8%',
      costInput: 15.00,
      costOutput: 75.00,
      capabilities: 'Deep Graph Routing for long-context file repositories, near-zero hallucination rates on massive source documentation.',
      bestUse: 'Legacy codebase migration, complex legal auditing, and deep document parsing.'
    },
    'gemini-1-5-pro': {
      name: 'Gemini 1.5 Pro',
      developer: 'Google',
      contextWindow: '2,000,000 tokens',
      mmlu: '86.4%',
      costInput: 1.25,
      costOutput: 5.00,
      capabilities: 'Native multi-modal audio and video streaming inputs, real-time voice latency support (< 150ms).',
      bestUse: 'Interactive voice conversational agents and automated video sequence parsing.'
    },
    'deepseek-v3': {
      name: 'DeepSeek-V3 Reasoning',
      developer: 'DeepSeek',
      contextWindow: '128,000 tokens',
      mmlu: '92.1%',
      costInput: 0.14,
      costOutput: 0.28,
      capabilities: 'Extremely high logical deduction scores, cost-to-performance efficiency benchmark leader.',
      bestUse: 'High-volume logical validations, programming copilots, and low-cost API scaling.'
    }
  };

  const selectedProfile = modelProfiles[selectedModelId] || modelProfiles['gpt-5'];

  // Calculate estimated monthly cost based on slider input
  // Assume a standard distribution of 70% input tokens and 30% output tokens
  const estimatedCost = (monthlyTokens / 1000000) * (selectedProfile.costInput * 0.7 + selectedProfile.costOutput * 0.3);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
              <Cpu className="w-6 h-6 text-coffee-accent" />
              Model Roastery
            </h1>
            <p className="text-xs text-coffee-text-muted">
              Deep telemetry comparison of context windows, parameter scales, and pricing calculators.
            </p>
          </div>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Models</span>
          </button>
        </div>

        {isLoading ? (
          <div className="glass-panel p-20 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-coffee-accent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left list */}
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider px-1">Model Family Registry</span>
              <div className="space-y-2">
                {Object.keys(modelProfiles).map((key) => {
                  const prof = modelProfiles[key];
                  const isSelected = selectedModelId === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedModelId(key)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                        isSelected
                          ? 'bg-coffee-card border-coffee-accent shadow-md shadow-coffee-accent/5'
                          : 'bg-[#0f0a08]/50 border-coffee-border/40 hover:bg-coffee-card/50 hover:border-coffee-border/70'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className={`text-xs font-bold font-display ${isSelected ? 'text-coffee-accent' : 'text-coffee-cream'}`}>
                          {prof.name}
                        </span>
                        <span className="block text-[8.5px] text-coffee-text-muted font-mono">{prof.developer}</span>
                      </div>
                      <span className="text-[9px] font-mono text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-border/30">
                        {prof.mmlu}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Profile card */}
              <div className="glass-panel rounded-xl p-6 md:p-8 border border-coffee-border/80 bg-gradient-to-b from-coffee-card/85 to-[#0c0806] space-y-6 relative">
                <div className="h-[2px] w-full bg-coffee-accent absolute top-0 left-0 right-0" />

                <div className="flex justify-between items-center pb-4 border-b border-coffee-border/20">
                  <h3 className="text-base font-display font-extrabold text-coffee-cream">
                    {selectedProfile.name} Specifications
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-coffee-border/50 text-coffee-accent border border-coffee-accent/20">
                    Active Index
                  </span>
                </div>

                {/* Specs list */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono py-3 border-b border-coffee-border/20">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-coffee-text-muted uppercase flex items-center gap-0.5">
                      <Layers className="w-3.5 h-3.5 text-coffee-accent" /> Context Limit
                    </span>
                    <p className="text-coffee-cream font-bold">{selectedProfile.contextWindow}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-coffee-text-muted uppercase flex items-center gap-0.5">
                      <Gauge className="w-3.5 h-3.5 text-coffee-accent" /> MMLU Score
                    </span>
                    <p className="text-coffee-cream font-bold">{selectedProfile.mmlu}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-coffee-text-muted uppercase flex items-center gap-0.5">
                      <Zap className="w-3.5 h-3.5 text-coffee-accent" /> API Cost Index
                    </span>
                    <p className="text-emerald-400 font-bold">${selectedProfile.costInput.toFixed(2)} / $10k</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-coffee-accent uppercase tracking-wider text-[8px]">Capabilities Summary</span>
                  <p className="text-xs text-coffee-cream/80 leading-relaxed bg-[#070403] p-4 rounded-lg border border-coffee-border/40">
                    {selectedProfile.capabilities}
                  </p>
                </div>

                <div className="space-y-1 bg-coffee-dark/20 p-3.5 rounded-lg border border-coffee-border/20 text-xs">
                  <span className="font-bold text-coffee-cream flex items-center gap-1 text-[11px]">
                    <Award className="w-4 h-4 text-coffee-accent" /> Optimally Suited For
                  </span>
                  <p className="text-coffee-text-muted leading-relaxed pt-1">
                    {selectedProfile.bestUse}
                  </p>
                </div>
              </div>

              {/* Calculator slider */}
              <div className="glass-panel p-6 rounded-xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-6">
                <h3 className="text-xs font-mono uppercase text-coffee-accent tracking-widest flex items-center gap-1.5 border-b border-coffee-border/20 pb-2">
                  <Calculator className="w-4 h-4" /> Cost Estimation Simulator
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-coffee-cream font-bold">Estimated Monthly Ingestions</span>
                    <span className="text-coffee-accent font-mono font-bold">{(monthlyTokens / 1000000).toFixed(1)}M Tokens</span>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="1000000"
                    max="50000000"
                    step="500000"
                    value={monthlyTokens}
                    onChange={(e) => setMonthlyTokens(Number(e.target.value))}
                    className="w-full h-1 bg-coffee-border rounded-lg appearance-none cursor-pointer accent-coffee-accent"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-coffee-text-muted uppercase">
                    <span>1M Tokens</span>
                    <span>10M</span>
                    <span>20M</span>
                    <span>30M</span>
                    <span>40M</span>
                    <span>50M Tokens</span>
                  </div>
                </div>

                {/* Estimate output pricing display */}
                <div className="flex justify-between items-center bg-[#070403] p-5 rounded-xl border border-coffee-border/40">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-coffee-text-muted uppercase">Estimated Monthly Bill</span>
                    <p className="text-xl font-display font-extrabold text-white">
                      ${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-coffee-text-muted space-y-0.5">
                    <div>Input: <span className="text-coffee-cream font-bold">${selectedProfile.costInput.toFixed(2)}/M</span></div>
                    <div>Output: <span className="text-coffee-cream font-bold">${selectedProfile.costOutput.toFixed(2)}/M</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
