'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Coffee, 
  Cpu, 
  TrendingUp, 
  Bookmark, 
  Settings, 
  CreditCard, 
  ShieldAlert, 
  LogOut, 
  Radio, 
  FolderHeart,
  ChevronRight,
  MailOpen,
  BookOpen,
  Briefcase,
  Search,
  Compass,
  Users,
  DollarSign,
  Activity,
  Zap,
  Clock,
  Mic
} from 'lucide-react';
import { UserButton, SignOutButton } from '@clerk/nextjs';
import { trpc } from '@/utils/trpc';
import { useCafeAtmosphere } from '@/components/CafeAtmosphere';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMockClerk = process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'mock' ||
                      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('mock');

  // Fetch subscription & role status
  const { data: subData, isLoading } = trpc.billing.getSubscriptionStatus.useQuery();
  const { label: atmosphereLabel } = useCafeAtmosphere();

  const sections = [
    {
      title: 'Brewing Archives',
      links: [
        { name: 'Brewing Room', href: '/dashboard', icon: Coffee },
        { name: 'Daily Brew', href: '/daily-brew', icon: MailOpen },
        { name: 'Weekly Roast', href: '/weekly-roast', icon: Clock },
        { name: 'Monthly Blend', href: '/monthly-blend', icon: BookOpen },
        { name: 'Annual Reserve', href: '/annual-reserve', icon: ShieldAlert },
      ]
    },
    {
      title: 'Intelligence Lounges',
      links: [
        { name: 'Brew Feed', href: '/brew-feed', icon: Radio },
        { name: 'Coffee Search', href: '/coffee-search', icon: Search },
        { name: 'Voice Lounge', href: '/dashboard/voice-agent', icon: Mic },
        { name: 'AI Radar Map', href: '/ai-radar', icon: Compass },
        { name: 'Company Lounge', href: '/company-lounge', icon: Users },
        { name: 'Model Roastery', href: '/model-roastery', icon: Cpu },
      ]
    },
    {
      title: 'Trackers & Pulse',
      links: [
        { name: 'Startup Café', href: '/startup-cafe', icon: Coffee },
        { name: 'Funding Board', href: '/funding-board', icon: DollarSign },
        { name: 'Research Lab', href: '/research-lab', icon: BookOpen },
        { name: 'Career Roast', href: '/career-roast', icon: Briefcase },
        { name: 'Skill Radar', href: '/skill-radar', icon: Activity },
        { name: 'Hiring Pulse', href: '/hiring-pulse', icon: Zap },
        { name: 'Market Signals', href: '/market-signals', icon: TrendingUp },
      ]
    },
    {
      title: 'Personal Vault',
      links: [
        { name: 'Topic Feeds', href: '/dashboard/topics', icon: FolderHeart },
        { name: 'Saved Beans', href: '/saved-beans', icon: Bookmark },
        { name: 'Billing & Plans', href: '/dashboard/billing', icon: CreditCard },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#070403] text-f4eae4">
      {/* Sidebar */}
      <aside className="w-64 border-r border-coffee-border/30 bg-[#0f0a08]/90 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30">
        <div className="flex flex-col min-h-0 flex-1">
          {/* Logo */}
          <div className="h-16 border-b border-coffee-border/20 flex items-center px-6 gap-2 shrink-0">
            <svg className="w-5 h-5 text-coffee-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            </svg>
            <span className="font-display font-extrabold text-sm tracking-wider text-f4eae4">
              FILTERCOFFEE<span className="text-coffee-accent">.AI</span>
            </span>
          </div>

          {/* Scrollable Navigation Links */}
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
            {sections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <div className="text-[9px] font-mono font-bold text-coffee-accent/60 uppercase tracking-widest px-3 py-1">
                  {sec.title}
                </div>
                {sec.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-coffee-accent text-[#090504] shadow-[0_2px_8px_rgba(194,136,84,0.25)]'
                          : 'text-coffee-text-muted hover:bg-coffee-border/20 hover:text-coffee-cream'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{link.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3 h-3" />}
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Admin link - Check database user role */}
            {!isLoading && subData && subData.role === 'ADMIN' && (
              <div className="space-y-1">
                <div className="text-[9px] font-mono font-bold text-red-500/60 uppercase tracking-widest px-3 py-1">
                  Administration
                </div>
                <Link
                  href="/dashboard/admin"
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition-all ${
                    pathname === '/dashboard/admin'
                      ? 'bg-red-900/40 text-red-200 border border-red-800'
                      : 'text-coffee-text-muted hover:bg-coffee-border/20 hover:text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Brewing Insights</span>
                  </div>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-coffee-border/20 bg-coffee-dark/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isMockClerk ? (
              <div className="w-8 h-8 rounded-full bg-coffee-border flex items-center justify-center border border-coffee-accent/30 text-xs font-bold text-coffee-accent font-display shrink-0">
                {(subData?.name || 'FC').substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <div className="shrink-0">
                <UserButton />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-coffee-cream truncate">
                {isLoading ? 'Loading...' : subData?.name || 'User'}
              </span>
              <span className="text-[9px] font-mono text-coffee-text-muted truncate">
                {isLoading ? '...' : subData?.email || ''}
              </span>
            </div>
          </div>
          {isMockClerk ? (
            <Link
              href="/"
              title="Sign Out (Mock)"
              className="text-coffee-text-muted hover:text-coffee-accent transition-colors ml-2 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          ) : (
            <div className="ml-2 shrink-0">
              <SignOutButton>
                <button className="text-coffee-text-muted hover:text-coffee-accent transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </SignOutButton>
            </div>
          )}
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pl-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-coffee-border/20 flex items-center justify-between px-8 bg-[#070403]/80 backdrop-blur sticky top-0 z-20 shrink-0">
          <div className="text-xs font-semibold text-coffee-text-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{atmosphereLabel}</span>
          </div>
          <div className="flex items-center gap-4">
            {!isLoading && subData && (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-coffee-border/50 text-coffee-accent border border-coffee-accent/20">
                {subData.plan} Subscription
              </span>
            )}
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-coffee-text-muted hover:text-coffee-cream font-medium"
            >
              Docs
            </a>
          </div>
        </header>

        {/* Child Page Wrapper */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
