'use client';

import React from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" className="h-full dark antialiased">
      <body className="min-h-full bg-[#0a0604] text-f4eae4 flex items-center justify-center p-6">
        <div className="glass-panel p-8 md:p-10 rounded-2xl max-w-md w-full border border-coffee-border/40 text-center space-y-6 bg-[#0f0a08]/90">
          <div className="w-14 h-14 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-display font-extrabold text-coffee-cream">Critical System Boiler Failure</h2>
            <p className="text-xs text-coffee-text-muted leading-relaxed">
              A critical layout boundary crash occurred. We are unable to boot the luxury coffee atmosphere interface at this moment.
            </p>
          </div>

          <button
            onClick={reset}
            className="w-full py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Server Boiler</span>
          </button>
        </div>
      </body>
    </html>
  );
}
