'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import { Check, Loader2, Sparkles, X, CheckCircle2, AlertCircle, Building2, HelpCircle } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { PLAN_LIMITS } from '@/server/services/subscription/plans';
import { motion, AnimatePresence } from 'framer-motion';

function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: sub, isLoading, refetch } = trpc.billing.getSubscriptionStatus.useQuery();

  // Pricing toggle state
  const [billingFrequency, setBillingFrequency] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Modal control state
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PRO' | 'POWER' | 'ENTERPRISE' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [customCredits, setCustomCredits] = useState<number>(0);
  const [successState, setSuccessState] = useState<{ success: boolean; message: string; intentId?: string } | null>(null);

  const createCheckoutMutation = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      setSuccessState({
        success: data.success,
        message: data.message || 'Thank you for your interest! We have added you to our early access priority list.',
        intentId: data.intentId,
      });
      refetch();
    },
    onError: (err) => {
      setSuccessState({
        success: false,
        message: err.message || 'An error occurred while registering your intent. Please try again.',
      });
    },
  });

  const confirmMockCheckoutMutation = trpc.billing.confirmMockCheckout.useMutation({
    onSuccess: () => {
      utils.billing.getSubscriptionStatus.invalidate();
      refetch();
      router.replace('/dashboard/billing');
    },
  });

  // Check for mock checkout parameters in URL (from developer testing)
  useEffect(() => {
    const isSuccess = searchParams.get('mock_checkout_success') === 'true';
    const planCode = searchParams.get('plan') as 'STARTER' | 'PRO' | 'POWER' | 'ENTERPRISE';
    
    if (isSuccess && planCode) {
      confirmMockCheckoutMutation.mutate({ planCode });
    }
  }, [searchParams]);

  const handleOpenUpgradeModal = (planCode: 'STARTER' | 'PRO' | 'POWER' | 'ENTERPRISE') => {
    setSelectedPlan(planCode);
    setNotes('');
    setCustomCredits(0);
    setSuccessState(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setSuccessState(null);
  };

  const handleSubmitIntent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    createCheckoutMutation.mutate({
      planCode: selectedPlan,
      billingFrequency,
      sourcePage: 'billing_dashboard',
      referrer: document.referrer || undefined,
    });
  };

  // Helper to calculate pricing displays
  const getPriceDisplay = (planCode: string) => {
    if (planCode === 'FREE') return '₹0';
    if (planCode === 'ENTERPRISE') return 'Custom';
    
    // Hardcoded pricing mappings corresponding to database and constants
    const pricing: Record<string, { monthly: number; yearly: number }> = {
      STARTER: { monthly: 199, yearly: 159 },
      PRO: { monthly: 499, yearly: 399 },
      POWER: { monthly: 999, yearly: 799 },
    };

    const rate = pricing[planCode];
    if (!rate) return 'TBD';

    return billingFrequency === 'MONTHLY' 
      ? `₹${rate.monthly}/mo` 
      : `₹${rate.yearly}/mo`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-coffee-cream">Billing & Plans</h1>
          <p className="text-xs text-coffee-text-muted">Explore pricing plans, manage subscription intents, and check signal limits.</p>
        </div>

        {/* Billed Monthly/Yearly toggle */}
        <div className="flex items-center gap-3 bg-[#130d0b] border border-coffee-border/40 p-1 rounded-lg">
          <button
            onClick={() => setBillingFrequency('MONTHLY')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              billingFrequency === 'MONTHLY'
                ? 'bg-coffee-accent text-background shadow-md'
                : 'text-coffee-text-muted hover:text-coffee-cream'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingFrequency('YEARLY')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingFrequency === 'YEARLY'
                ? 'bg-coffee-accent text-background shadow-md'
                : 'text-coffee-text-muted hover:text-coffee-cream'
            }`}
          >
            <span>Yearly</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wide ${
              billingFrequency === 'YEARLY' ? 'bg-[#0f0a08] text-coffee-accent' : 'bg-coffee-accent/20 text-coffee-accent border border-coffee-accent/30'
            }`}>
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-32 flex-1">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
            <p className="text-xs text-coffee-text-muted">Retrieving subscription status...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current plan box */}
          <div className="glass-panel p-6 rounded-xl border border-coffee-border/50 bg-[#0e0907]/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-coffee-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-coffee-text-muted tracking-wider">Account Plan</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-coffee-accent/20 text-coffee-accent border border-coffee-accent/30">
                  {sub?.plan}
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-coffee-cream">
                {sub?.plan === 'FREE' ? 'Free Summary Feed' : `${sub?.plan} Priority Feed`}
              </h2>
              <p className="text-xs text-coffee-text-muted">
                Active Topic Feeds: <strong className="text-coffee-cream">{sub?.activeTopicCount}</strong> of <strong className="text-coffee-cream">{sub?.maxTopics}</strong> allowed.
              </p>
            </div>

            <div className="relative z-10">
              {sub?.plan !== 'FREE' ? (
                <div className="space-y-2">
                  <div className="text-right text-[11px] text-coffee-text-muted">
                    Billed via Mock Payment System
                  </div>
                  <button
                    onClick={() => handleOpenUpgradeModal(sub?.plan as any)}
                    className="px-4 py-2 bg-[#1b120f] border border-coffee-border/80 text-coffee-cream text-xs font-semibold rounded hover:bg-coffee-border/20 transition-colors flex items-center gap-1.5"
                  >
                    <span>Update Preferences / Support</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-coffee-text-muted flex items-center gap-1.5 bg-coffee-border/20 border border-coffee-border/30 px-3 py-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-coffee-accent animate-pulse" />
                  <span>Choose a premium plan below to secure early launch pricing.</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            
            {/* 1. FREE TIER */}
            <div className="glass-panel p-5 rounded-xl space-y-4 border border-coffee-border/20 bg-[#070504]/30 flex flex-col justify-between hover:border-coffee-border/50 transition-all">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-coffee-cream">Free</h3>
                  </div>
                  <p className="text-[10px] text-coffee-text-muted">Basic daily summaries</p>
                </div>
                <div className="font-display text-2xl font-extrabold text-coffee-cream">₹0</div>
                <ul className="space-y-2.5 text-[11px] text-coffee-text-muted border-t border-coffee-border/20 pt-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Up to {PLAN_LIMITS.FREE.maxTopics} active topics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>{PLAN_LIMITS.FREE.maxDailySearches} daily searches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>{PLAN_LIMITS.FREE.maxDailyAiGenerations} daily AI actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Weekly digests & web portal</span>
                  </li>
                </ul>
              </div>
              <button
                disabled
                className="w-full py-2 bg-coffee-border/10 text-coffee-text-muted text-xs font-semibold rounded cursor-not-allowed mt-4 border border-coffee-border/10"
              >
                {sub?.plan === 'FREE' ? 'Active Plan' : 'Free Tier'}
              </button>
            </div>

            {/* 2. STARTER TIER */}
            <div className={`glass-panel p-5 rounded-xl space-y-4 flex flex-col justify-between hover:border-coffee-accent/40 transition-all ${
              sub?.plan === 'STARTER' ? 'border-coffee-accent bg-[#0f0a08]/80' : 'border-coffee-border/20 bg-[#070504]/30'
            }`}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-coffee-cream">Starter</h3>
                  <p className="text-[10px] text-coffee-text-muted">For casual newsletter readers</p>
                </div>
                <div className="font-display text-2xl font-extrabold text-coffee-cream">{getPriceDisplay('STARTER')}</div>
                <ul className="space-y-2.5 text-[11px] text-coffee-text-muted border-t border-coffee-border/20 pt-4">
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Up to {PLAN_LIMITS.STARTER.maxTopics} active topics</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>{PLAN_LIMITS.STARTER.maxDailySearches} daily searches</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>{PLAN_LIMITS.STARTER.maxDailyAiGenerations} AI actions</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>RSS/Newsletter export support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenUpgradeModal('STARTER')}
                disabled={sub?.plan === 'STARTER'}
                className="w-full py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-semibold rounded transition-colors mt-4 disabled:bg-coffee-border/20 disabled:text-coffee-text-muted disabled:cursor-not-allowed"
              >
                {sub?.plan === 'STARTER' ? 'Active Plan' : 'Select Starter'}
              </button>
            </div>

            {/* 3. PRO TIER (POPULAR) */}
            <div className={`glass-panel p-5 rounded-xl space-y-4 flex flex-col justify-between hover:border-coffee-accent transition-all relative ${
              sub?.plan === 'PRO' ? 'border-coffee-accent bg-[#0f0a08]/90' : 'border-coffee-accent/40 bg-[#0f0a08]/40'
            }`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coffee-accent text-background text-[9px] uppercase font-extrabold px-3 py-1 rounded-full border border-coffee-accent/20 tracking-wider shadow-lg">
                MOST POPULAR
              </div>
              <div className="space-y-4 mt-2">
                <div>
                  <h3 className="font-display font-bold text-coffee-cream flex items-center justify-between">
                    Pro <Sparkles className="w-4 h-4 text-coffee-accent" />
                  </h3>
                  <p className="text-[10px] text-coffee-text-muted">For professionals & curators</p>
                </div>
                <div className="font-display text-2xl font-extrabold text-coffee-cream">{getPriceDisplay('PRO')}</div>
                <ul className="space-y-2.5 text-[11px] text-coffee-text-muted border-t border-coffee-border/20 pt-4">
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Up to {PLAN_LIMITS.PRO.maxTopics} active topics</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>{PLAN_LIMITS.PRO.maxDailySearches} daily searches</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>{PLAN_LIMITS.PRO.maxDailyAiGenerations} AI actions</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Exclusion keywords & bookmarks</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Custom sources & reports</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenUpgradeModal('PRO')}
                disabled={sub?.plan === 'PRO'}
                className="w-full py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-semibold rounded transition-colors mt-4 disabled:bg-coffee-border/20 disabled:text-coffee-text-muted disabled:cursor-not-allowed"
              >
                {sub?.plan === 'PRO' ? 'Active Plan' : 'Select Pro'}
              </button>
            </div>

            {/* 4. POWER TIER */}
            <div className={`glass-panel p-5 rounded-xl space-y-4 flex flex-col justify-between hover:border-coffee-accent/40 transition-all ${
              sub?.plan === 'POWER' ? 'border-coffee-accent bg-[#0f0a08]/80' : 'border-coffee-border/20 bg-[#070504]/30'
            }`}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-coffee-cream">Power</h3>
                  <p className="text-[10px] text-coffee-text-muted">For power users & executives</p>
                </div>
                <div className="font-display text-2xl font-extrabold text-coffee-cream">{getPriceDisplay('POWER')}</div>
                <ul className="space-y-2.5 text-[11px] text-coffee-text-muted border-t border-coffee-border/20 pt-4">
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Up to {PLAN_LIMITS.POWER.maxTopics} active topics</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>{PLAN_LIMITS.POWER.maxDailySearches} daily searches</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>{PLAN_LIMITS.POWER.maxDailyAiGenerations} AI actions</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Priority backup ingestion</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Historical exports & archives</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenUpgradeModal('POWER')}
                disabled={sub?.plan === 'POWER'}
                className="w-full py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-semibold rounded transition-colors mt-4 disabled:bg-coffee-border/20 disabled:text-coffee-text-muted disabled:cursor-not-allowed"
              >
                {sub?.plan === 'POWER' ? 'Active Plan' : 'Select Power'}
              </button>
            </div>

            {/* 5. ENTERPRISE TIER */}
            <div className={`glass-panel p-5 rounded-xl space-y-4 flex flex-col justify-between hover:border-coffee-accent/40 transition-all ${
              sub?.plan === 'ENTERPRISE' ? 'border-coffee-accent bg-[#0f0a08]/80' : 'border-coffee-border/20 bg-[#070504]/30'
            }`}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-coffee-cream flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-coffee-accent" />
                    <span>Enterprise</span>
                  </h3>
                  <p className="text-[10px] text-coffee-text-muted">For scaling teams & businesses</p>
                </div>
                <div className="font-display text-2xl font-extrabold text-coffee-cream">Custom</div>
                <ul className="space-y-2.5 text-[11px] text-coffee-text-muted border-t border-coffee-border/20 pt-4">
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Unlimited active topics & logs</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Unlimited daily searches</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Dedicated integration API key</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>Dedicated crawler worker</span>
                  </li>
                  <li className="flex items-start gap-2 text-coffee-cream">
                    <Check className="w-3.5 h-3.5 text-coffee-accent shrink-0 mt-0.5" />
                    <span>SLA & dedicated manager support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenUpgradeModal('ENTERPRISE')}
                disabled={sub?.plan === 'ENTERPRISE'}
                className="w-full py-2 bg-[#1b120f] border border-coffee-border hover:bg-coffee-border/20 text-coffee-cream text-xs font-semibold rounded transition-colors mt-4 disabled:opacity-50"
              >
                {sub?.plan === 'ENTERPRISE' ? 'Active Plan' : 'Contact Sales'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Pre-launch Glow-Glassmorphism Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-[#070504]/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-panel bg-[#0e0907]/95 border border-coffee-accent/40 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8 text-coffee-cream"
            >
              {/* Glow details */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-coffee-accent to-transparent shadow-[0_0_20px_rgba(224,142,88,0.8)]" />

              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1 rounded-full text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {!successState ? (
                <form onSubmit={handleSubmitIntent} className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold uppercase font-mono tracking-widest text-coffee-accent bg-coffee-accent/10 px-2.5 py-1 rounded-md border border-coffee-accent/20">
                      Pre-Launch Early Access
                    </span>
                    <h3 className="text-2xl font-display font-extrabold mt-2">
                      Secure launch pricing for <span className="text-coffee-accent">{selectedPlan}</span>
                    </h3>
                    <p className="text-xs text-coffee-text-muted leading-relaxed">
                      FilterCoffee AI is currently in pre-launch mode. We will soon launch subscriptions on this domain. Register your priority interest below to lock in a <strong className="text-coffee-cream">20% lifetime early-adopter discount</strong>.
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-coffee-border/20 pt-4">
                    {/* User email (read-only) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-coffee-text-muted">Registered Email</label>
                      <input
                        type="email"
                        value={sub?.email || ''}
                        disabled
                        className="w-full bg-[#1b120f]/50 border border-coffee-border/30 rounded px-3 py-2 text-xs text-coffee-text-muted cursor-not-allowed outline-none"
                      />
                    </div>

                    {/* Choice recap */}
                    <div className="grid grid-cols-2 gap-4 bg-[#1b120f]/30 p-3 rounded-lg border border-coffee-border/10">
                      <div>
                        <span className="text-[9px] font-mono text-coffee-text-muted block uppercase">Selected Plan</span>
                        <span className="text-xs font-bold text-coffee-cream">{selectedPlan}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-coffee-text-muted block uppercase">Price (Pre-Launch)</span>
                        <span className="text-xs font-bold text-coffee-accent">
                          {getPriceDisplay(selectedPlan)}
                          {billingFrequency === 'YEARLY' && selectedPlan !== 'ENTERPRISE' && ' / year'}
                        </span>
                      </div>
                    </div>

                    {/* Custom Request Notes */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-coffee-text-muted flex justify-between">
                        <span>Launch Request or Feedback (Optional)</span>
                        <span className="text-[9px] text-coffee-text-muted font-normal lowercase">Max 250 chars</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value.substring(0, 250))}
                        placeholder="Add custom limits, source requests, or usage objectives..."
                        rows={3}
                        className="w-full bg-[#130d0b] border border-coffee-border/40 rounded px-3 py-2 text-xs text-coffee-cream focus:border-coffee-accent outline-none placeholder:text-coffee-text-muted resize-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-coffee-text-muted flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-coffee-accent shrink-0" />
                      <span>Zero charge. Zero credit card needed.</span>
                    </span>
                    
                    <button
                      type="submit"
                      disabled={createCheckoutMutation.isPending}
                      className="px-5 py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      {createCheckoutMutation.isPending ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          <span>Saving Spot...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Secure Early Access</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-6"
                >
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-coffee-accent/15 border border-coffee-accent/30 text-coffee-accent shadow-inner animate-pulse">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-extrabold text-coffee-cream">Priority Spot Secured!</h3>
                    <p className="text-xs text-coffee-text-muted max-w-sm mx-auto leading-relaxed">
                      {successState.message}
                    </p>
                  </div>

                  {successState.intentId && (
                    <div className="bg-[#1b120f]/50 p-2.5 rounded-lg border border-coffee-border/20 inline-block">
                      <code className="text-[10px] font-mono text-coffee-text-muted">
                        Reference ID: {successState.intentId}
                      </code>
                    </div>
                  )}

                  <div className="border-t border-coffee-border/20 pt-6 max-w-sm mx-auto">
                    <p className="text-[11px] text-coffee-text-muted mb-4 leading-normal">
                      We have noted your interest in the <strong className="text-coffee-cream">{selectedPlan}</strong> plan ({billingFrequency.toLowerCase()} billing). Our product team will contact you at <strong className="text-coffee-cream">{sub?.email}</strong> prior to release.
                    </p>
                    <button
                      onClick={handleCloseModal}
                      className="px-5 py-2 bg-coffee-border hover:bg-coffee-border/20 text-coffee-cream text-xs font-semibold rounded transition-colors"
                    >
                      Return to Billing
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
