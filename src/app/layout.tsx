import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'FilterCoffee.ai — Brewed Intelligence for Professionals',
  description: 'AI, Finance, Career and Market Signals curated into one morning briefing. Blending Stripe aesthetics with Perplexity-style search and Bloomberg-style intelligence.',
  keywords: ['AI intelligence', 'finance intelligence', 'career signals', 'market trends', 'startup funding', 'morning digest'],
  authors: [{ name: 'FilterCoffee.ai Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

const isMockClerk = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('mock');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const innerContent = (
    <html lang="en" className="h-full dark antialiased scroll-smooth">
      <body className="min-h-full bg-[#0a0604] text-[#f7f3f0] font-sans selection:bg-[#8b5a2b] selection:text-white flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  if (isMockClerk) {
    return innerContent;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {innerContent}
    </ClerkProvider>
  );
}
