'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { signUpAction } from '../actions/auth';
import { Loader2, ArrowRight, Mail, User, Info } from 'lucide-react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isMockClerk = process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'mock' ||
                      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
                      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('mock');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await signUpAction(email, name);
        if (result && 'error' in result) {
          setError(result.error);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      }
    });
  };

  if (!isMockClerk) {
    return (
      <div className="min-h-screen bg-[#070403] text-f4eae4 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Decorative radial glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#8b5a2b]/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#8b5a2b]/5 blur-[150px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10 flex flex-col items-center">
          {/* Header */}
          <div className="text-center space-y-2 mb-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg className="w-8 h-8 text-coffee-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <path d="M6 2v3" />
                <path d="M10 2v3" />
                <path d="M14 2v3" />
              </svg>
              <span className="font-display font-extrabold text-2xl tracking-wider text-f4eae4">
                FILTERCOFFEE<span className="text-coffee-accent">.AI</span>
              </span>
            </Link>
          </div>

          <SignUp
            appearance={{
              variables: {
                colorPrimary: '#c28854',
                colorBackground: '#0f0a08',
                colorText: '#f4eae4',
                colorTextSecondary: '#a28a78',
                colorInputBackground: '#070403',
                colorInputText: '#f4eae4',
                colorBorder: '#2d1e18',
              },
              elements: {
                card: 'border border-coffee-border bg-[#0f0a08]/90 shadow-xl rounded-2xl',
                headerTitle: 'font-display font-extrabold text-f4eae4 text-xl tracking-wider',
                headerSubtitle: 'text-xs text-coffee-text-muted',
                socialButtonsIconButton: 'bg-coffee-dark border border-coffee-border hover:bg-coffee-border/30 text-f4eae4',
                formButtonPrimary: 'bg-coffee-accent hover:bg-coffee-accent-hover text-[#090504] font-semibold text-xs rounded-lg transition-all shadow-[0_4px_12px_rgba(194,136,84,0.2)]',
                footerActionLink: 'text-coffee-accent hover:text-coffee-accent-hover',
                formFieldInput: 'bg-coffee-dark border border-coffee-border/60 rounded-lg text-xs text-f4eae4 placeholder-coffee-text-muted/50 focus:border-coffee-accent focus:ring-1 focus:ring-coffee-accent focus:outline-none transition-all',
                formFieldLabel: 'text-xs font-semibold text-coffee-cream',
              }
            }}
            signInUrl="/sign-in"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070403] text-f4eae4 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative radial glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#8b5a2b]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#8b5a2b]/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <svg className="w-8 h-8 text-coffee-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <path d="M6 2v3" />
              <path d="M10 2v3" />
              <path d="M14 2v3" />
            </svg>
            <span className="font-display font-extrabold text-2xl tracking-wider text-f4eae4">
              FILTERCOFFEE<span className="text-coffee-accent">.AI</span>
            </span>
          </Link>
          <h2 className="text-lg font-display font-bold text-coffee-cream mt-6">
            Create your profile
          </h2>
          <p className="text-xs text-coffee-text-muted">
            Development Mode — No verification required.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-2xl border border-coffee-border/50 bg-[#0f0a08]/90 space-y-6 shadow-xl">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-xs text-red-200 flex gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold text-coffee-cream">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-coffee-text-muted">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isPending}
                  className="block w-full pl-10 pr-4 py-2.5 bg-coffee-dark border border-coffee-border/60 rounded-lg text-xs text-f4eae4 placeholder-coffee-text-muted/50 focus:border-coffee-accent focus:ring-1 focus:ring-coffee-accent focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-coffee-cream">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-coffee-text-muted">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isPending}
                  className="block w-full pl-10 pr-4 py-2.5 bg-coffee-dark border border-coffee-border/60 rounded-lg text-xs text-f4eae4 placeholder-coffee-text-muted/50 focus:border-coffee-accent focus:ring-1 focus:ring-coffee-accent focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-[#090504] font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(194,136,84,0.2)] disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-coffee-text-muted">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-coffee-accent hover:text-coffee-accent-hover font-medium underline underline-offset-4 transition-colors">
            Sign in (Mock)
          </Link>
        </p>
      </div>
    </div>
  );
}

