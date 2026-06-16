import crypto from 'crypto';
import { db as prisma } from '@/lib/db';
import { NormalizedContent } from './types';

export class ContentDeduplicationService {
  /**
   * Generates a stable SHA-256 hash for a piece of content.
   * Priority: URL > Title > Content
   */
  static generateHash(content: NormalizedContent): string {
    const hash = crypto.createHash('sha256');
    
    if (content.url) {
      hash.update(content.url.trim().toLowerCase());
    } else {
      hash.update((content.title || '').trim().toLowerCase());
      hash.update((content.content || '').substring(0, 100).trim().toLowerCase());
    }
    
    return hash.digest('hex');
  }

  /**
   * Calculates a simple string similarity percentage (Jaccard-like or Levenshtein-like).
   * Here we use a fast bigram similarity.
   */
  static calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (s1 === s2) return 100;
    if (s1.length < 2 || s2.length < 2) return 0;
    
    const bigrams1 = new Set();
    for (let i = 0; i < s1.length - 1; i++) bigrams1.add(s1.substring(i, i + 2));
    
    let matches = 0;
    const total = bigrams1.size;
    
    for (let i = 0; i < s2.length - 1; i++) {
      if (bigrams1.has(s2.substring(i, i + 2))) {
        matches++;
      }
    }
    
    return total === 0 ? 0 : (matches / total) * 100;
  }

  /**
   * Check if the content is a duplicate.
   * Returns the ID of the existing record if duplicate, null otherwise.
   */
  static async isDuplicate(content: NormalizedContent, hash: string): Promise<string | null> {
    // Priority 1: Same URL
    if (content.url) {
      const existingByUrl = await prisma.contentItem.findFirst({
        where: { url: content.url },
        select: { id: true }
      });
      if (existingByUrl) return existingByUrl.id;
    }

    // Priority 2: Same Hash
    const existingByHash = await prisma.contentItem.findFirst({
      where: { hash },
      select: { id: true }
    });
    if (existingByHash) return existingByHash.id;

    // Priority 3 & 4: Title / Content similarity (requires fetching recent items to compare)
    // To be efficient, we only compare against items from the last 7 days.
    const recentItems = await prisma.contentItem.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      select: { id: true, title: true, content: true }
    });

    for (const item of recentItems) {
      // Priority 3: 95% Title Similarity
      if (this.calculateSimilarity(content.title, item.title) >= 95) {
        return item.id;
      }
      
      // Priority 4: 90% Content Similarity (if content is long enough)
      if (content.content.length > 100 && item.content.length > 100) {
        if (this.calculateSimilarity(content.content.substring(0, 500), item.content.substring(0, 500)) >= 90) {
          return item.id;
        }
      }
    }

    return null;
  }

  /**
   * Merges duplicate information. We don't overwrite the existing item's core content,
   * but we could update tags or append a source reference.
   */
  static async mergeDuplicates(existingId: string, newContent: NormalizedContent): Promise<void> {
    const existing = await prisma.contentItem.findUnique({ where: { id: existingId } });
    if (!existing) return;

    // e.g. append new source if different
    const updatedSources = Array.from(new Set([existing.source, newContent.source])).join(', ');
    
    await prisma.contentItem.update({
      where: { id: existingId },
      data: {
        source: updatedSources,
        // Update updated_at
      }
    });
  }
}
