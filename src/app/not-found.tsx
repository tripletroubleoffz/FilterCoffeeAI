import React from 'react';
import Link from 'next/link';
import { Coffee } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0604] flex items-center justify-center p-6 text-f4eae4">
      <div className="glass-panel p-8 md:p-12 rounded-2xl max-w-md w-full border border-coffee-border/40 text-center space-y-6 bg-[#0f0a08]/90">
        <div className="w-16 h-16 rounded-full bg-coffee-border/20 border border-coffee-accent/30 flex items-center justify-center text-coffee-accent mx-auto animate-bounce">
          <Coffee className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-display font-extrabold text-coffee-cream">404: Coffee Cup is Empty</h2>
          <p className="text-xs text-coffee-text-muted leading-relaxed">
            The page you are looking for has been drunk, renamed, or never existed in this cafe menu lineup.
          </p>
        </div>

        <Link
          href="/"
          className="w-full py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-background text-xs font-bold rounded-lg block text-center transition-colors shadow-lg shadow-coffee-accent/5"
        >
          Return to Entrance
        </Link>
      </div>
    </div>
  );
}
