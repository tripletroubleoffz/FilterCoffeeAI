'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Coffee, 
  Calendar,
  Search,
  Bot,
  TrendingUp,
  GraduationCap,
  FolderOpen,
  CreditCard,
  Mail,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { trpc } from '@/utils/trpc';
import { useCafeAtmosphere } from '@/components/CafeAtmosphere';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded, signOut } = useSupabaseAuth();

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  // Fetch subscription & role status
  const { data: subData, isLoading } = trpc.billing.getSubscriptionStatus.useQuery();
  const { label: atmosphereLabel } = useCafeAtmosphere();

  // Primary destinations with their active matching routes
  const mainSection = [
    { name: 'Brewing Room', href: '/dashboard', icon: Coffee, activeMatches: ['/dashboard'] },
    { name: 'Daily Brew', href: '/daily-brew', icon: Calendar, activeMatches: ['/daily-brew'] },
    { name: 'Weekly Roast', href: '/weekly-roast', icon: Calendar, activeMatches: ['/weekly-roast'] },
    { name: 'Monthly Blend', href: '/monthly-blend', icon: Calendar, activeMatches: ['/monthly-blend'] },
    { name: 'Annual Reserve', href: '/annual-reserve', icon: Calendar, activeMatches: ['/annual-reserve'] },
  ];

  const hubSection = [
    { 
      name: 'Intelligence Hub', 
      href: '/dashboard/intelligence', 
      icon: Search, 
      activeMatches: ['/dashboard/intelligence', '/brew-feed', '/coffee-search', '/dashboard/voice-agent'] 
    },
    { 
      name: 'AI & Industry Radar', 
      href: '/dashboard/radar', 
      icon: Bot, 
      activeMatches: ['/dashboard/radar', '/ai-radar', '/company-lounge', '/model-roastery'] 
    },
    { 
      name: 'Market Intelligence', 
      href: '/dashboard/market', 
      icon: TrendingUp, 
      activeMatches: ['/dashboard/market', '/startup-cafe', '/funding-board', '/market-signals', '/signals'] 
    },
    { 
      name: 'Career Center', 
      href: '/dashboard/career', 
      icon: GraduationCap, 
      activeMatches: ['/dashboard/career', '/research-lab', '/career-roast', '/skill-radar', '/hiring-pulse'] 
    },
    { 
      name: 'Personal Vault', 
      href: '/dashboard/vault', 
      icon: FolderOpen, 
      activeMatches: ['/dashboard/vault', '/dashboard/topics', '/saved-beans'] 
    },
    { 
      name: 'Billing & Plans', 
      href: '/dashboard/billing', 
      icon: CreditCard, 
      activeMatches: ['/dashboard/billing'] 
    },
    { 
      name: 'Contact Us', 
      href: '/dashboard/contact', 
      icon: Mail, 
      activeMatches: ['/dashboard/contact'] 
    },
  ];

  const isAdmin = !isLoading && subData && subData.role === 'ADMIN';

  const isLinkActive = (matches: string[]) => {
    return matches.some(route => pathname === route);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#070403] text-f4eae4 flex flex-col justify-center items-center px-4">
        <div className="w-8 h-8 border-2 border-coffee-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-coffee-text-muted mt-2">Entering Brewing Room...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#070403] text-f4eae4">
      {/* Sidebar */}
      <aside className="w-64 border-r border-coffee-border/30 bg-[#0f0a08]/95 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30">
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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none select-none">
            {/* Main Section */}
            <div className="space-y-1">
              {mainSection.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.activeMatches);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-coffee-accent text-[#090504] shadow-[0_2px_8px_rgba(194,136,84,0.25)]'
                        : 'text-coffee-text-muted hover:bg-coffee-border/20 hover:text-coffee-cream'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.name}</span>
                    </div>
                    {active && <ChevronRight className="w-3 h-3" />}
                  </Link>
                );
              })}
            </div>

            {/* Separator */}
            <hr className="border-coffee-border/20 my-3" />

            {/* Hubs Section */}
            <div className="space-y-1">
              {hubSection.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.activeMatches);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-coffee-accent text-[#090504] shadow-[0_2px_8px_rgba(194,136,84,0.25)]'
                        : 'text-coffee-text-muted hover:bg-coffee-border/20 hover:text-coffee-cream'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.name}</span>
                    </div>
                    {active && <ChevronRight className="w-3 h-3" />}
                  </Link>
                );
              })}
            </div>

            {/* Admin Section (Admin only) */}
            {isAdmin && (
              <>
                <hr className="border-coffee-border/20 my-3" />
                <div className="space-y-1">
                  <Link
                    href="/dashboard/admin"
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-semibold tracking-wide transition-all ${
                      pathname === '/dashboard/admin'
                        ? 'bg-red-950/40 text-red-200 border border-red-800/40'
                        : 'text-coffee-text-muted hover:bg-coffee-border/20 hover:text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>Administration</span>
                    </div>
                    {pathname === '/dashboard/admin' && <ChevronRight className="w-3 h-3" />}
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-coffee-border/20 bg-coffee-dark/40 flex items-center justify-between shrink-0">
          <Link 
            href="/dashboard/profile" 
            className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-85 transition-opacity cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-coffee-border flex items-center justify-center border border-coffee-accent/30 text-xs font-bold text-coffee-accent font-display shrink-0 group-hover:border-coffee-accent/60 transition-colors">
              {(subData?.name || 'FC').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-coffee-cream truncate group-hover:text-coffee-accent transition-colors">
                {isLoading ? 'Loading...' : subData?.name || 'User'}
              </span>
              <span className="text-[9px] font-mono text-coffee-text-muted truncate">
                {isLoading ? '...' : subData?.email || ''}
              </span>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="text-coffee-text-muted hover:text-coffee-accent transition-colors ml-2 shrink-0 bg-transparent border-none p-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
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
