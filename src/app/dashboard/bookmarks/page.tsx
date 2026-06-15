'use client';

import React from 'react';
import { trpc } from '@/utils/trpc';
import { Bookmark, Trash2, ExternalLink, Loader2, Calendar } from 'lucide-react';

export default function BookmarksPage() {
  const { data: bookmarks, isLoading, refetch } = trpc.signals.getBookmarks.useQuery();

  const removeBookmarkMutation = trpc.signals.toggleBookmark.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-coffee-cream">Bookmarks</h1>
        <p className="text-xs text-coffee-text-muted">Your curated list of saved signals and analytical insights.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
          <p className="text-xs text-coffee-text-muted mt-2">Opening bookmarks folder...</p>
        </div>
      ) : !bookmarks || bookmarks.length === 0 ? (
        <div className="flex-1 glass-panel p-12 rounded-xl flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 mt-8">
          <div className="w-12 h-12 rounded-full bg-coffee-border/30 flex items-center justify-center text-coffee-accent border border-coffee-accent/20">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-coffee-cream">No Bookmarks Saved</h3>
            <p className="text-xs text-coffee-text-muted">
              Click the bookmark icon on any signal in the Signal Feed to save it here for reference.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider px-1">
            Saved Signals ({bookmarks.length})
          </div>

          <div className="space-y-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="glass-panel p-5 rounded-lg border border-coffee-border/40 bg-[#0c0806]/40 flex justify-between items-center gap-6"
              >
                <div className="space-y-2 min-w-0">
                  <h3 className="text-xs md:text-sm font-bold text-coffee-cream truncate max-w-2xl">
                    {bookmark.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] text-coffee-text-muted font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(bookmark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {bookmark.notes && <span>Notes: {bookmark.notes}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded bg-coffee-border/35 text-coffee-text-muted hover:text-coffee-accent transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <span>Read Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => removeBookmarkMutation.mutate({ title: bookmark.title, url: bookmark.url })}
                    className="p-2 rounded bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
