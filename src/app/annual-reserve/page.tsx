'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { ShieldAlert, Award, Star, TrendingUp, DollarSign, Calendar, ArrowRight, X } from 'lucide-react';

interface Accolade {
  id: string;
  category: string;
  title: string;
  winner: string;
  metrics: string;
  implications: string;
  adopterScore: number;
}

export default function AnnualReservePage() {
  const [selectedAccolade, setSelectedAccolade] = useState<Accolade | null>(null);

  const reserveAccolades: Accolade[] = [
    {
      id: 'model-year',
      category: 'Model of the Year',
      title: 'DeepSeek-V3 Reasoning Model',
      winner: 'DeepSeek AI',
      metrics: '92.1% Logic Benchmark, $0.14 per Million Tokens cost ratio',
      implications: 'Disrupted proprietary margins, forcing major players (OpenAI, Google) to pivot pricing strategies and speed up local reasoning engines.',
      adopterScore: 98
    },
    {
      id: 'funding-year',
      category: 'Unicorn of the Year',
      title: 'Physical Intelligence $400M Seed',
      winner: 'Physical Intelligence (Pi)',
      metrics: '$2.4B Valuation post-Seed round',
      implications: 'VC capital is transferring heavy investment from software UI wrappers into physical robotics foundations, targeting logistics automation.',
      adopterScore: 94
    },
    {
      id: 'ma-year',
      category: 'M&A Deal of the Year',
      title: 'OpenAI Acquires Rockset',
      winner: 'OpenAI / Rockset',
      metrics: 'Estimated $510M Transaction size',
      implications: 'Signals transition of generative models to real-time search queries. Integrates native database sharding directly inside model frameworks.',
      adopterScore: 92
    },
    {
      id: 'paper-year',
      category: 'Breakthrough Paper of the Year',
      title: 'AlphaFold 3 Molecular Routing',
      winner: 'Google DeepMind',
      metrics: 'Protein, DNA, RNA interaction modeling accuracy +55%',
      implications: 'Reduces pre-clinical therapeutic verification stages from years to days, allowing researchers to simulate molecular compounds in silico.',
      adopterScore: 96
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 py-6 relative overflow-hidden glass-panel rounded-2xl border-coffee-accent/30 bg-gradient-to-r from-coffee-dark via-[#1a100c]/40 to-coffee-dark">
          <Award className="w-10 h-10 text-coffee-accent mx-auto animate-pulse" />
          <h1 className="text-2xl font-display font-extrabold text-coffee-cream">
            FILTERCOFFEE<span className="text-coffee-accent">.AI</span> Annual Reserve
          </h1>
          <p className="text-xs text-coffee-text-muted max-w-lg mx-auto leading-relaxed">
            Direct access to the reserve registry logs. Tracking the macro winners, capital leaders, and technological pivots that defined the AI sector.
          </p>
        </div>

        {/* Accolades Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reserveAccolades.map((acc) => (
            <div 
              key={acc.id}
              onClick={() => setSelectedAccolade(acc)}
              className="glass-panel p-6 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/90 flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-all duration-300 relative group"
            >
              <div className="h-[2px] w-full bg-gradient-to-r from-coffee-accent/10 via-coffee-accent to-coffee-accent/10 absolute top-0 left-0 right-0" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-coffee-accent">
                  <span className="uppercase tracking-widest bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/20">
                    {acc.category}
                  </span>
                  <span className="flex items-center gap-0.5 text-coffee-text-muted">
                    <Star className="w-3 h-3 text-coffee-accent" /> Reserve Elite
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-display font-extrabold text-coffee-cream group-hover:text-white transition-colors">
                    {acc.title}
                  </h3>
                  <p className="text-xs text-coffee-text-muted">Winner: <span className="text-coffee-cream font-bold">{acc.winner}</span></p>
                </div>

                <p className="text-xs text-coffee-text-muted bg-[#070403] p-3 rounded border border-coffee-border/40 leading-relaxed font-mono">
                  {acc.metrics}
                </p>
              </div>

              {/* Action trigger */}
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-coffee-border/20 text-[10px] font-mono">
                <span className="text-coffee-text-muted group-hover:text-coffee-accent transition-all flex items-center gap-0.5">
                  Reveal reserve implications <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-emerald-500 font-bold">PULSE: {acc.adopterScore}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Accolade detail popup modal */}
        {selectedAccolade && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg bg-[#0f0a08] border border-coffee-border/80 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="h-[3px] w-full bg-coffee-accent" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedAccolade(null)}
                className="absolute top-4 right-4 p-2 text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 space-y-6 text-xs leading-relaxed">
                <div className="flex items-center gap-2.5">
                  <Award className="w-8 h-8 text-coffee-accent" />
                  <div>
                    <span className="text-[9px] font-mono text-coffee-accent uppercase tracking-widest block">
                      {selectedAccolade.category}
                    </span>
                    <h2 className="text-lg font-display font-extrabold text-coffee-cream">{selectedAccolade.winner}</h2>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[8px] font-mono text-coffee-accent uppercase tracking-wider">Accolade Title</span>
                  <p className="text-sm font-display font-bold text-coffee-cream">{selectedAccolade.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#070403] p-3.5 rounded-lg border border-coffee-border/40 font-mono text-[10px]">
                  <div>Metrics: <span className="text-coffee-cream font-semibold">{selectedAccolade.metrics}</span></div>
                  <div className="text-right">Adopter Score: <span className="text-emerald-500 font-bold">{selectedAccolade.adopterScore}%</span></div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="block text-[8px] font-mono text-coffee-accent uppercase tracking-wider">Strategic Sector Implications</span>
                  <p className="text-coffee-text-muted leading-relaxed italic bg-coffee-dark/20 p-4 rounded-lg border border-coffee-border/20">
                    "{selectedAccolade.implications}"
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setSelectedAccolade(null)}
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
