import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'FilterCoffee.ai — Brewed Intelligence for Professionals',
  description: 'AI, Finance, Career and Market Signals curated into one morning briefing. Blending Stripe aesthetics with Perplexity-style search and Bloomberg-style intelligence.',
  keywords: ['AI intelligence', 'finance intelligence', 'career signals', 'market trends', 'startup funding', 'morning digest'],
  authors: [{ name: 'FilterCoffee.ai Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark antialiased scroll-smooth">
      <body className="min-h-full bg-[#0a0604] text-[#f7f3f0] font-sans selection:bg-[#8b5a2b] selection:text-white flex flex-col">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

