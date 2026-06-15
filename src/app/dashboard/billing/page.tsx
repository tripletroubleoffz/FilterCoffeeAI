'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { PLANS } from '@/lib/constants';

function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: sub, isLoading, refetch } = trpc.billing.getSubscriptionStatus.useQuery();
  
  const createCheckoutMutation = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const createPortalMutation = trpc.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const confirmMockCheckoutMutation = trpc.billing.confirmMockCheckout.useMutation({
    onSuccess: () => {
      utils.billing.getSubscriptionStatus.invalidate();
      refetch();
      router.replace('/dashboard/billing');
    },
  });

  useEffect(() => {
    const isSuccess = searchParams.get('mock_checkout_success') === 'true';
    const planCode = searchParams.get('plan') as 'PRO' | 'POWER';
    
    if (isSuccess && planCode) {
      confirmMockCheckoutMutation.mutate({ planCode });
    }
  }, [searchParams]);

  const handleUpgrade = (planCode: 'PRO' | 'POWER') => {
    createCheckoutMutation.mutate({ planCode });
  };

  const handlePortalRedirect = () => {
    createPortalMutation.mutate();
  };

  const isUnavailable = searchParams.get('unavailable') === 'true';

  return (
    <div className="space-y-8 max-w-5xl mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-coffee-cream">Billing & Plans</h1>
        <p className="text-xs text-coffee-text-muted">Manage your subscription tiers and review signal limits.</p>
      </div>

      {isUnavailable && (
        <div className="glass-panel p-4 rounded-lg border border-coffee-accent/40 bg-coffee-accent/5 text-coffee-cream text-xs flex flex-col gap-1">
          <div className="font-bold flex items-center gap-1.5 text-coffee-accent">
            <Sparkles className="w-4 h-4" />
            <span>Payments Coming Soon</span>
          </div>
          <p className="text-coffee-text-muted">The checkout and billing management portal is not available yet. We will be launching payment subscriptions soon!</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-xl border border-coffee-border/50 bg-[#0e0907]/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-coffee-text-muted tracking-wider">Account Plan</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-coffee-accent/20 text-coffee-accent border border-coffee-accent/30">
                  {sub?.plan}
                </span>
              </div>
              <h2 className="text-lg font-display font-extrabold text-coffee-cream">
                {sub?.plan === 'FREE' ? 'Free Summary Feed' : `${sub?.plan} Professional Feed`}
              </h2>
              <p className="text-xs text-coffee-text-muted">
                Active Topic Feeds: <strong className="text-coffee-cream">{sub?.activeTopicCount}</strong> of <strong className="text-coffee-cream">{sub?.maxTopics}</strong> allowed.
              </p>
            </div>

            <div className="space-y-2 text-right">
              {sub?.plan !== 'FREE' ? (
                <button
                  onClick={handlePortalRedirect}
                  disabled={createPortalMutation.isPending}
                  className="px-4 py-2 bg-[#1b120f] border border-coffee-border/80 text-coffee-cream text-xs font-semibold rounded hover:bg-coffee-border/20 transition-colors flex items-center gap-1.5"
                >
                  {createPortalMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Manage Billing & Invoices</span>
                </button>
              ) : (
                <div className="text-xs text-coffee-text-muted flex items-center gap-1.5 bg-coffee-border/20 border border-coffee-border/30 px-3 py-1.5 rounded">
                  <Sparkles className="w-4 h-4 text-coffee-accent" />
                  <span>Upgrade below to increase feeds and delivery frequencies</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-xl space-y-4 border border-coffee-border/40 bg-[#0b0705]/40 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-coffee-cream">Free</h3>
                  <p className="text-[10px] text-coffee-text-muted">Minimal historical tracking</p>
                </div>
                <div className="font-display text-3xl font-extrabold text-coffee-cream">₹0</div>
                <ul className="space-y-2 text-[11px] text-coffee-text-muted border-t border-coffee-border/20 pt-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>{PLANS.FREE.limits}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Email & dashboard reports</span>
                  </li>
                </ul>
              </div>
              <button
                disabled
                className="w-full py-2 bg-coffee-border/20 text-coffee-text-muted text-xs font-semibold rounded cursor-not-allowed mt-4"
              >
                {sub?.plan === 'FREE' ? 'Active Plan' : 'Free Tier'}
              </button>
            </div>

            <div className={`glass-panel p-6 rounded-xl space-y-4 flex flex-col justify-between relative ${
              sub?.plan === 'PRO' ? 'border-coffee-accent bg-[#0f0a08]/80' : 'border-coffee-border/40 bg-[#0b0705]/40'
            }`}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-coffee-cream flex items-center gap-2">
                    Pro <Sparkles className="w-4 h-4 text-coffee-accent" />
                  </h3>
                  <p className="text-[10px] text-coffee-text-muted">For creators & professionals</p>
                </div>
                <div className="font-display text-3xl font-extrabold text-coffee-cream">{PLANS.PRO.price}</div>
                <ul className="space-y-2 text-[11px] text-coffee-text-muted border-t border-coffee-border/20 pt-4">
                  <li className="flex items-center gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>{PLANS.PRO.limits}</span>
                  </li>
                  <li className="flex items-center gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Exclusion keyword filters</span>
                  </li>
                  <li className="flex items-center gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Save bookmarks & analytics</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleUpgrade('PRO')}
                disabled={sub?.plan === 'PRO' || createCheckoutMutation.isPending}
                className="w-full py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-semibold rounded transition-colors mt-4 disabled:opacity-50"
              >
                {sub?.plan === 'PRO' ? 'Active Plan' : 'Upgrade to Pro'}
              </button>
            </div>

            <div className={`glass-panel p-6 rounded-xl space-y-4 flex flex-col justify-between relative ${
              sub?.plan === 'POWER' ? 'border-coffee-accent bg-[#0f0a08]/80' : 'border-coffee-border/40 bg-[#0b0705]/40'
            }`}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-coffee-cream">Power</h3>
                  <p className="text-[10px] text-coffee-text-muted">For founders & executives</p>
                </div>
                <div className="font-display text-3xl font-extrabold text-coffee-cream">{PLANS.POWER.price}</div>
                <ul className="space-y-2 text-[11px] text-coffee-text-muted border-t border-coffee-border/20 pt-4">
                  <li className="flex items-center gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>{PLANS.POWER.limits}</span>
                  </li>
                  <li className="flex items-center gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Priority background ingestion</span>
                  </li>
                  <li className="flex items-center gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent" />
                    <span>Direct history backup exports</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleUpgrade('POWER')}
                disabled={sub?.plan === 'POWER' || createCheckoutMutation.isPending}
                className="w-full py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-semibold rounded transition-colors mt-4 disabled:opacity-50"
              >
                {sub?.plan === 'POWER' ? 'Active Plan' : 'Upgrade to Power'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
          <p className="text-xs text-coffee-text-muted mt-2">Loading billing center...</p>
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
