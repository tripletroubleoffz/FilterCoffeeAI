'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface Tab {
  name: string;
  href: string;
  icon?: LucideIcon;
}

interface HubHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  tabs: Tab[];
}

export default function HubHeader({ title, subtitle, icon: Icon, tabs }: HubHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 mb-8">
      {/* Hub Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-coffee-border/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-coffee-accent/10 border border-coffee-accent/20">
              <Icon className="w-6 h-6 text-coffee-accent animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-coffee-cream tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-coffee-text-muted mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control / Premium Tabs */}
      <div className="relative border-b border-coffee-border/20">
        <nav className="flex gap-2 -mb-px overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const TabIcon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 relative border ${
                  isActive
                    ? 'bg-coffee-accent text-[#090504] border-coffee-accent shadow-lg shadow-coffee-accent/10'
                    : 'text-coffee-text-muted hover:text-coffee-cream hover:bg-coffee-border/20 border-transparent'
                }`}
              >
                {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
                <span>{tab.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#090504] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
