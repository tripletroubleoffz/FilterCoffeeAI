'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0604] flex items-center justify-center p-6 text-f4eae4">
      <div className="glass-panel p-8 md:p-10 rounded-2xl max-w-md w-full border border-coffee-border/40 text-center space-y-6 bg-[#0f0a08]/90">
        <div className="w-14 h-14 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-display font-extrabold text-coffee-cream">Espresso Extraction Error</h2>
          <p className="text-xs text-coffee-text-muted leading-relaxed">
            The brewing process failed mid-extraction. This might be due to a transient database timeout or network latency.
          </p>
        </div>

        {error.digest && (
          <div className="bg-[#070403] px-3 py-1.5 rounded border border-coffee-border/20 text-[10px] font-mono text-coffee-text-muted">
            Digest Code: {error.digest}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={reset}
            className="w-full py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-coffee-accent/5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-Brew Page</span>
          </button>
          
          <Link
            href="/dashboard"
            className="w-full py-2.5 bg-[#070403] border border-coffee-border/40 hover:border-coffee-border/60 text-coffee-cream text-xs font-semibold rounded-lg block text-center transition-colors"
          >
            Return to Brewing Room
          </Link>
        </div>
      </div>
    </div>
  );
}
