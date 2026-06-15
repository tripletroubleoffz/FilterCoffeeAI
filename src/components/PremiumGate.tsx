'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { trpc } from '@/utils/trpc';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: string;
  description?: string;
}

export default function PremiumGate({
  children,
  featureName = 'Premium Feature',
  description = 'Access custom-brewed intelligence briefings, instant AI insights, and voice broadcast lounges.',
}: PremiumGateProps) {
  const { data: subData, isLoading } = trpc.billing.getSubscriptionStatus.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-coffee-accent/30 border-t-coffee-accent rounded-full animate-spin" />
        <span className="mt-4 text-xs font-mono text-coffee-text-muted">Verifying credentials...</span>
      </div>
    );
  }

  const isPremium = subData?.plan === 'PRO' || subData?.plan === 'POWER' || subData?.role === 'ADMIN';

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-coffee-border/40 bg-[#0f0a08]/90 p-8 md:p-12 text-center max-w-2xl mx-auto my-12 shadow-2xl">
      {/* Decorative ambient background */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-coffee-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-coffee-cream/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-6 flex flex-col items-center">
        {/* Animated Icon lock badge */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-coffee-card to-coffee-dark border border-coffee-accent/30 flex items-center justify-center text-coffee-accent shadow-lg shadow-coffee-accent/5 relative group">
          <div className="absolute inset-0 rounded-full bg-coffee-accent/5 animate-pulse" />
          <Lock className="w-7 h-7 relative z-10 transition-transform group-hover:scale-110" />
        </div>

        <div className="space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-coffee-accent/10 text-coffee-accent border border-coffee-accent/20">
            <Sparkles className="w-3 h-3" /> Premium Feature
          </div>
          <h2 className="text-xl font-display font-extrabold text-coffee-cream tracking-wide">
            Upgrade to unlock {featureName}
          </h2>
          <p className="text-xs text-coffee-text-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center pt-2">
          <Link
            href="/dashboard/billing"
            className="px-6 py-2.5 rounded-xl bg-coffee-accent text-[#090504] text-xs font-bold font-display shadow-md shadow-coffee-accent/15 hover:bg-coffee-cream hover:shadow-coffee-cream/15 transition-all flex items-center gap-2 group"
          >
            <span>View Pricing Plans</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl border border-coffee-border/40 text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/10 text-xs font-bold transition-all"
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
