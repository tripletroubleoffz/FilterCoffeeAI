'use client';

import React from 'react';
import DashboardLayout from '../dashboard/layout';
import { trpc } from '@/utils/trpc';
import { Bookmark, RefreshCw, Trash2, Calendar, ExternalLink, ShieldAlert } from 'lucide-react';

import HubHeader from '@/components/HubHeader';
import { FolderOpen, FolderHeart } from 'lucide-react';

export default function SavedBeansPage() {
  const { data: bookmarks, isLoading, refetch, isRefetching } = trpc.signals.getBookmarks.useQuery();
  const deleteBookmarkMutation = trpc.signals.toggleBookmark.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const handleRemoveBookmark = (title: string, url: string) => {
    deleteBookmarkMutation.mutate({ title, url });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <HubHeader 
          title="Personal Vault" 
          subtitle="Your personal library of bookmarked signals, saved models, and compiled reports."
          icon={FolderOpen}
          tabs={[
            { name: 'Topics', href: '/dashboard/topics', icon: FolderHeart },
            { name: 'Saved Beans', href: '/saved-beans', icon: Bookmark },
          ]}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-coffee-cream">Vault Registry</span>
          <button 
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="px-3 py-1.5 bg-coffee-dark hover:bg-coffee-border/40 border border-coffee-border/60 text-coffee-cream rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Vault</span>
          </button>
        </div>

        {/* Loader */}
        {isLoading ? (
          <div className="glass-panel p-20 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-coffee-accent animate-spin" />
          </div>
        ) : !bookmarks || bookmarks.length === 0 ? (
          <div className="glass-panel p-16 rounded-xl text-center space-y-4 max-w-md mx-auto mt-12">
            <Bookmark className="w-10 h-10 text-coffee-accent/40 mx-auto animate-pulse" />
            <h3 className="text-sm font-bold text-coffee-cream">Your Vault is Empty</h3>
            <p className="text-xs text-coffee-text-muted leading-relaxed">
              Explore the Brew Feed, Companies list, or Signals page and bookmark interesting cards to store them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map((b) => (
              <div 
                key={b.id}
                className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/90 flex flex-col justify-between relative group transition-all duration-300"
              >
                <div className="h-[2px] w-full bg-gradient-to-r from-coffee-accent/10 via-coffee-accent to-coffee-accent/10 absolute top-0 left-0 right-0" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-mono text-coffee-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-coffee-accent" />
                      Saved {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleRemoveBookmark(b.title, b.url)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-display font-extrabold text-coffee-cream leading-snug">
                    {b.title}
                  </h3>
                </div>

                {/* Footer link */}
                <div className="pt-3 border-t border-coffee-border/10 mt-3 flex justify-end">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-coffee-accent hover:underline flex items-center gap-1 uppercase"
                  >
                    View Source <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
