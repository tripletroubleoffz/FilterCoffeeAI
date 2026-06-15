'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowRight, Mail, Lock, User, Info, CheckCircle } from 'lucide-react';

import { useAuth } from '@/components/AuthProvider';

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated, loading: isCheckingSession } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isCheckingSession && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isCheckingSession, isAuthenticated, router]);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    startTransition(async () => {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // If email confirmation is disabled in Supabase, session is returned immediately
      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // Email confirmation required
        setSuccess(true);
      }
    });
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#070403] text-f4eae4 flex flex-col justify-center items-center px-4">
        <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
        <p className="text-xs text-coffee-text-muted mt-2">Checking session...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#070403] flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-coffee-accent mx-auto" />
          <h2 className="text-xl font-display font-bold text-coffee-cream">Check your email</h2>
          <p className="text-sm text-coffee-text-muted">
            We&apos;ve sent a confirmation link to <strong className="text-coffee-cream">{email}</strong>.
            Click the link in the email to activate your account.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-[#090504] font-semibold text-xs rounded-lg transition-all"
          >
            Back to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
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
            Create your account
          </h2>
          <p className="text-xs text-coffee-text-muted">
            Join FilterCoffee.ai and get your daily intelligence feed.
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

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-coffee-cream">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-coffee-text-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={isPending}
                  className="block w-full pl-10 pr-4 py-2.5 bg-coffee-dark border border-coffee-border/60 rounded-lg text-xs text-f4eae4 placeholder-coffee-text-muted/50 focus:border-coffee-accent focus:ring-1 focus:ring-coffee-accent focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-coffee-cream">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-coffee-text-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
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
                  <span>Creating account...</span>
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
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
