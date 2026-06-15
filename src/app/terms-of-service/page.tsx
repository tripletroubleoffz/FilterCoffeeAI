import React from 'react';
import Link from 'next/link';
import SmoothScroll from '@/components/SmoothScroll';

export default function TermsOfService() {
  return (
    <SmoothScroll>
      <header className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-coffee-border/30 h-16 flex items-center px-6 md:px-12 bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-6 h-6 text-coffee-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <path d="M6 2v3" />
            <path d="M10 2v3" />
            <path d="M14 2v3" />
          </svg>
          <span className="font-display font-extrabold text-lg tracking-wider text-f4eae4">
            FILTERCOFFEE<span className="text-coffee-accent">.AI</span>
          </span>
        </Link>
      </header>

      <div className="min-h-screen pt-32 pb-20 px-6 md:px-12 bg-background">
        <div className="max-w-3xl mx-auto space-y-8 text-coffee-cream">
          <h1 className="text-3xl md:text-5xl font-display font-extrabold">Terms of Service</h1>
          <p className="text-coffee-text-muted">Effective Date: June 2026</p>
          
          <div className="space-y-6 text-sm leading-relaxed text-coffee-cream/80">
            <h2 className="text-xl font-bold text-coffee-accent mt-8">1. Acceptance of Terms</h2>
            <p>By accessing or using FilterCoffee.ai, you agree to be bound by these Terms of Service.</p>

            <h2 className="text-xl font-bold text-coffee-accent mt-8">2. Use of Service</h2>
            <p>You agree to use the service for professional intelligence tracking and will not misuse the platform or its automated systems.</p>

            <h2 className="text-xl font-bold text-coffee-accent mt-8">3. Intellectual Property</h2>
            <p>The curated content and platform algorithms are the property of FilterCoffee.ai. The source articles remain the property of their respective owners.</p>

            <h2 className="text-xl font-bold text-coffee-accent mt-8">4. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:admin@filtercoffee.ai" className="text-coffee-accent hover:underline">admin@filtercoffee.ai</a>.</p>
          </div>
        </div>
      </div>
    </SmoothScroll>
  );
}
