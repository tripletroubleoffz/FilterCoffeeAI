'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layout';
import { trpc } from '@/utils/trpc';
import VoiceAgentPlayer from '@/components/VoiceAgentPlayer';
import { Radio, Sparkles, Music, Coffee, Clock, Calendar, VolumeX, Volume2 } from 'lucide-react';

import HubHeader from '@/components/HubHeader';
import { Mic, Search } from 'lucide-react';
import PremiumGate from '@/components/PremiumGate';

export default function VoiceAgentPage() {
  const { data: briefings } = trpc.signals.getBriefings.useQuery();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isCafeMusicOn, setIsCafeMusicOn] = useState(false);

  // Web Audio Synth Jazz Cafe references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tones for ambient synth jazz (Pentatonic scale F Major: F3, A3, C4, D4, F4, G4)
  const jazzPitches = [174.61, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00];

  // Stop ambient synth music
  const stopAmbientMusic = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsCafeMusicOn(false);
  };

  // Start ambient synth music (Soft retro jazz generator)
  const startAmbientMusic = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Lowpass filter to make it sound warm and distant
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime); // muffles the sound

      // Delay effect for spacey lounge feel
      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime(0.5, ctx.currentTime);
      const delayGain = ctx.createGain();
      delayGain.gain.setValueAtTime(0.3, ctx.currentTime);

      // Connect nodes
      delay.connect(delayGain);
      delayGain.connect(filter);
      delayGain.connect(delay); // feedback loop
      filter.connect(ctx.destination);

      const playJazzNote = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(filter);
        gain.connect(delay);

        // Pick a random pitch
        const pitch = jazzPitches[Math.floor(Math.random() * jazzPitches.length)];
        osc.frequency.setValueAtTime(pitch, ctx.currentTime);
        osc.type = 'sine';

        // Soft attack, long release for gentle notes
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.5); // Very quiet
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 4.0);
      };

      // Play notes periodically
      playJazzNote();
      const interval = setInterval(() => {
        // Random chance of playing a note to keep it organic
        if (Math.random() > 0.3) {
          playJazzNote();
        }
      }, 1500);

      synthIntervalRef.current = interval;
      setIsCafeMusicOn(true);
    } catch (err) {
      console.warn('Lounge synth audio failed:', err);
    }
  };

  const handleToggleMusic = () => {
    if (isCafeMusicOn) {
      stopAmbientMusic();
    } else {
      startAmbientMusic();
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientMusic();
    };
  }, []);

  // Fetch the latest generated briefing text
  const latestBriefing = briefings?.[0]?.summary || '';

  // Scripts content builder
  const dailyFallback = `Good morning! Welcome to Filter Coffee AI, your daily distilled morning briefing. Today, OpenAI launched GPT-5 Preview with native multi-agent orchestration, which allows developers to build complex hierarchies directly inside their API pipelines. In other news, robotics startup Physical Intelligence closed a massive 400 million dollar seed round at a 2.4 billion dollar valuation. Finally, DeepMind introduced AlphaFold 3, predicting DNA and RNA molecule structures, reducing pharmaceutical validation cycles by up to 80 percent.`;

  const weeklyScript = `Welcome back to the Weekly Roast. This week in artificial intelligence, we witnessed significant talent movements as standard web developer demand shifted toward semantic cache design and custom agent routing roles. In funding rounds, distributed vector sharding startup Qdrant closed a 45 million dollar Series B led by Benchmark. Technology markets showed Nvidia stock rising 4.2 percent on strong Blackwell chip supply telemetry. Check back next week for more distilled intelligence.`;

  const monthlyScript = `This is the Monthly Blend. Let's analyze the technology S-curve adoption trends. Low-latency multi-modal audio architectures have officially crossed the early adopter threshold, while visual reasoning models enter widespread corporate pipelines. In the job market, companies are actively restructuring engineering teams to focus on semantic cache scaling and vector vector sharding infrastructures. That compiles our Monthly Blend review.`;

  const getActiveText = () => {
    if (selectedTimeframe === 'daily') {
      return latestBriefing || dailyFallback;
    }
    if (selectedTimeframe === 'weekly') {
      return weeklyScript;
    }
    return monthlyScript;
  };

  const getActiveTitle = () => {
    if (selectedTimeframe === 'daily') {
      return briefings?.[0]?.title || "Daily Brew Broadcast";
    }
    if (selectedTimeframe === 'weekly') {
      return "Weekly Roast Review";
    }
    return "Monthly Blend Tech Summary";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <HubHeader 
          title="Intelligence Hub" 
          subtitle="Listen to custom-brewed intelligence briefings read out loud by your choice of AI Voice Hosts."
          icon={Search}
          tabs={[
            { name: 'Feed', href: '/brew-feed', icon: Radio },
            { name: 'Search', href: '/coffee-search', icon: Search },
            { name: 'Voice', href: '/dashboard/voice-agent', icon: Mic },
          ]}
        />

        <PremiumGate featureName="AI Voice Broadcast Lounge" description="Listen to customized daily, weekly, and monthly audio briefs read out loud by custom AI voices with background cafe music.">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <span className="text-xs font-bold text-coffee-cream">Voice Broadcast Lounge</span>
          
          <button
            onClick={handleToggleMusic}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
              isCafeMusicOn
                ? 'bg-coffee-accent/10 text-coffee-accent border-coffee-accent/40 shadow-lg shadow-coffee-accent/5'
                : 'bg-[#0f0a08]/50 border-coffee-border/30 text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-card/50'
            }`}
          >
            {isCafeMusicOn ? (
              <>
                <Volume2 className="w-4 h-4 animate-spin text-coffee-accent" />
                <span>Ambient Cafe Music ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-coffee-text-muted" />
                <span>Play Cafe Ambient Music</span>
              </>
            )}
          </button>
        </div>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: selection & settings */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Timeframe Selector Card */}
            <div className="glass-panel p-5 rounded-2xl border border-coffee-border/40 bg-[#0f0a08]/90 space-y-4">
              <div className="flex items-center gap-2 border-b border-coffee-border/20 pb-3">
                <Coffee className="w-4.5 h-4.5 text-coffee-accent" />
                <h3 className="text-xs font-display font-extrabold text-coffee-cream uppercase tracking-wider">
                  Select Intelligence Roast
                </h3>
              </div>

              <div className="space-y-2.5">
                {/* Daily */}
                <button
                  onClick={() => setSelectedTimeframe('daily')}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    selectedTimeframe === 'daily'
                      ? 'bg-coffee-card border-coffee-accent shadow-md shadow-coffee-accent/5'
                      : 'bg-[#070403]/60 border-coffee-border/30 hover:bg-coffee-card/50 hover:border-coffee-border/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                    selectedTimeframe === 'daily'
                      ? 'bg-coffee-accent/10 border-coffee-accent/30 text-coffee-accent'
                      : 'bg-[#070403] border-coffee-border/50 text-coffee-text-muted'
                  }`}>
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${selectedTimeframe === 'daily' ? 'text-coffee-cream' : 'text-coffee-cream/80'}`}>
                        Daily Brew Broadcast
                      </span>
                    </div>
                    <p className="text-[10px] text-coffee-text-muted leading-relaxed">
                      Distilled news of today's AI, finance, and career shifts.
                    </p>
                  </div>
                </button>

                {/* Weekly */}
                <button
                  onClick={() => setSelectedTimeframe('weekly')}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    selectedTimeframe === 'weekly'
                      ? 'bg-coffee-card border-coffee-accent shadow-md shadow-coffee-accent/5'
                      : 'bg-[#070403]/60 border-coffee-border/30 hover:bg-coffee-card/50 hover:border-coffee-border/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                    selectedTimeframe === 'weekly'
                      ? 'bg-coffee-accent/10 border-coffee-accent/30 text-coffee-accent'
                      : 'bg-[#070403] border-coffee-border/50 text-coffee-text-muted'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold ${selectedTimeframe === 'weekly' ? 'text-coffee-cream' : 'text-coffee-cream/80'}`}>
                      Weekly Roast Summary
                    </span>
                    <p className="text-[10px] text-coffee-text-muted leading-relaxed">
                      Seven-day rollup timelines of product launches and deals.
                    </p>
                  </div>
                </button>

                {/* Monthly */}
                <button
                  onClick={() => setSelectedTimeframe('monthly')}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    selectedTimeframe === 'monthly'
                      ? 'bg-coffee-card border-coffee-accent shadow-md shadow-coffee-accent/5'
                      : 'bg-[#070403]/60 border-coffee-border/30 hover:bg-coffee-card/50 hover:border-coffee-border/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                    selectedTimeframe === 'monthly'
                      ? 'bg-coffee-accent/10 border-coffee-accent/30 text-coffee-accent'
                      : 'bg-[#070403] border-coffee-border/50 text-coffee-text-muted'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold ${selectedTimeframe === 'monthly' ? 'text-coffee-cream' : 'text-coffee-cream/80'}`}>
                      Monthly Blend S-Curve
                    </span>
                    <p className="text-[10px] text-coffee-text-muted leading-relaxed">
                      Macro adoption curves, funding distributions, and structures.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Broadcast Studio Instructions */}
            <div className="glass-panel p-5 rounded-2xl border border-coffee-border/30 bg-[#0f0a08]/50 text-xs leading-relaxed space-y-3">
              <span className="font-mono text-coffee-accent font-bold uppercase tracking-wider text-[9px] block">Broadcast Tips</span>
              <p className="text-coffee-text-muted text-[11px]">
                To listen, pick a roast timeframe on the left, then use the right-side control dashboard.
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-coffee-text-muted text-[11px]">
                <li>Toggle <strong className="text-coffee-cream">Ambient Café Music</strong> at the top to layer relaxing, synthetic lounge jazz behind the host's voice.</li>
                <li>Adjust speaking rate speeds to fit your breakfast pacing.</li>
                <li>Watch the sound waves sync in real-time as the text highlights.</li>
              </ul>
            </div>

          </div>

          {/* Right panel: Active Voice Agent Player */}
          <div className="lg:col-span-7">
            <VoiceAgentPlayer
              key={selectedTimeframe} // re-mounts player on selection to reset voice synthesis
              text={getActiveText()}
              title={getActiveTitle()}
            />
          </div>
        </div>
        </PremiumGate>
      </div>
    </DashboardLayout>
  );
}
