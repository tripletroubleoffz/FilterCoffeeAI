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
  MailOpen
} from 'lucide-react';
import { UserButton, SignOutButton } from '@clerk/nextjs';
import { trpc } from '@/utils/trpc';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMockClerk = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('mock');

  // Fetch subscription & role status
  const { data: subData, isLoading } = trpc.billing.getSubscriptionStatus.useQuery();

  const links = [
    { name: 'Morning Briefings', href: '/dashboard', icon: MailOpen },
    { name: 'Signal Feed', href: '/dashboard/signals', icon: Radio },
    { name: 'Topic Feeds', href: '/dashboard/topics', icon: FolderHeart },
    { name: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
    { name: 'Billing & Plans', href: '/dashboard/billing', icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-[#070403] text-f4eae4">
      {/* Sidebar */}
      <aside className="w-64 border-r border-coffee-border/30 bg-[#0f0a08]/90 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30">
        <div className="flex flex-col">
          {/* Logo */}
          <div className="h-16 border-b border-coffee-border/20 flex items-center px-6 gap-2">
            <svg className="w-5 h-5 text-coffee-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            </svg>
            <span className="font-display font-extrabold text-sm tracking-wider text-f4eae4">
              FILTERCOFFEE<span className="text-coffee-accent">.AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-coffee-accent text-[#090504] shadow-[0_2px_8px_rgba(194,136,84,0.25)]'
                      : 'text-coffee-text-muted hover:bg-coffee-border/20 hover:text-coffee-cream'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}

            {/* Admin link - Check database user role */}
            {!isLoading && subData && (
              <Link
                href="/dashboard/admin"
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
                  pathname === '/dashboard/admin'
                    ? 'bg-red-900/40 text-red-200 border border-red-800'
                    : 'text-coffee-text-muted hover:bg-coffee-border/20 hover:text-red-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Admin Console</span>
                </div>
              </Link>
            )}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-coffee-border/20 bg-coffee-dark/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMockClerk ? (
              <div className="w-8 h-8 rounded-full bg-coffee-border flex items-center justify-center border border-coffee-accent/30 text-xs font-bold text-coffee-accent font-display">
                FC
              </div>
            ) : (
              <UserButton />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-coffee-cream truncate">Founder</span>
              <span className="text-[9px] font-mono text-coffee-text-muted truncate">founder@filtercoffee.ai</span>
            </div>
          </div>
          {isMockClerk ? (
            <Link
              href="/"
              title="Sign Out (Mock)"
              className="text-coffee-text-muted hover:text-coffee-accent transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          ) : (
            <SignOutButton>
              <button className="text-coffee-text-muted hover:text-coffee-accent transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </SignOutButton>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pl-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-coffee-border/20 flex items-center justify-between px-8 bg-[#070403]/80 backdrop-blur sticky top-0 z-20">
          <div className="text-xs font-semibold text-coffee-text-muted">
            Status: <span className="text-emerald-500">Pipeline Online</span>
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
