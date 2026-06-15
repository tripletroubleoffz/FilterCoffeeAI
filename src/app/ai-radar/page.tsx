'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import EcosystemMap from '@/components/EcosystemMap';
import { Compass, Sparkles, Network, ArrowRight } from 'lucide-react';

import HubHeader from '@/components/HubHeader';
import { Users, Cpu, Bot } from 'lucide-react';

export default function AIRadarPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <HubHeader 
          title="AI & Industry Radar" 
          subtitle="Interactive visual network tracking capital flows, developer dependencies, and strategic corporate connections."
          icon={Bot}
          tabs={[
            { name: 'AI Radar', href: '/ai-radar', icon: Compass },
            { name: 'Companies', href: '/company-lounge', icon: Users },
            { name: 'Models', href: '/model-roastery', icon: Cpu },
          ]}
        />

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map canvas */}
          <div className="lg:col-span-8">
            <EcosystemMap onSelectNode={setSelectedNode} />
          </div>

          {/* Node detail drawer panel */}
          <div className="lg:col-span-4">
            {selectedNode ? (
              <div className="glass-panel p-6 rounded-xl border border-coffee-accent/40 bg-gradient-to-b from-[#110a08] to-[#070403] space-y-4 relative">
                <div className="h-[2px] w-full bg-coffee-accent absolute top-0 left-0 right-0" />
                
                <div className="space-y-0.5 pt-2">
                  <span className="text-[9px] font-mono text-coffee-accent uppercase tracking-wider bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/20">
                    {selectedNode.type} Node
                  </span>
                  <h3 className="text-base font-display font-extrabold text-coffee-cream pt-2">
                    {selectedNode.name}
                  </h3>
                </div>

                <p className="text-xs text-coffee-cream/80 bg-[#070403] p-4 rounded-lg border border-coffee-border/40 leading-relaxed">
                  {selectedNode.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-coffee-border/20 text-xs text-coffee-text-muted">
                  <div className="flex justify-between">
                    <span>Maturity Phase:</span>
                    <span className="text-coffee-cream font-bold">Accelerating</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connections count:</span>
                    <span className="text-coffee-accent font-mono font-bold">2 Direct Links</span>
                  </div>
                </div>

                {/* Footer trigger */}
                <div className="pt-2">
                  <a 
                    href={selectedNode.type === 'COMPANY' ? '/company-lounge' : selectedNode.type === 'MODEL' ? '/model-roastery' : '/coffee-search'}
                    className="text-[10px] font-bold text-coffee-accent hover:underline flex items-center gap-1"
                  >
                    Open Deep Profile Analysis <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-10 text-center rounded-xl border border-coffee-border/40 bg-[#0f0a08]/30 space-y-4 text-xs">
                <Network className="w-8 h-8 text-coffee-accent/40 mx-auto animate-pulse" />
                <h3 className="text-coffee-cream font-semibold font-display">Select a Node</h3>
                <p className="text-coffee-text-muted leading-relaxed">
                  Click on any connection circle on the radar map to reveal active strategic telemetry and relationship bounds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
