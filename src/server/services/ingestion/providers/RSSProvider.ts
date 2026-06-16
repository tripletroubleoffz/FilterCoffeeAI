import Parser from 'rss-parser';
import crypto from 'crypto';
import { BaseIngestionProvider } from './BaseIngestionProvider';
import { RawContent, NormalizedContent } from '../types';
import DOMPurify from 'isomorphic-dompurify';

export class RSSProvider extends BaseIngestionProvider {
  private parser: Parser;

  constructor(providerRecord: any) {
    super(providerRecord);
    this.parser = new Parser({
      customFields: {
        item: ['creator', 'content:encoded', 'description', 'pubDate', 'link', 'title'],
      },
    });
  }

  async fetch(): Promise<RawContent[]> {
    if (!this.providerRecord.url) return [];
    
    try {
      const feed = await this.parser.parseURL(this.providerRecord.url);
      return feed.items || [];
    } catch (error) {
      console.error(`Error fetching RSS for ${this.providerRecord.name}:`, error);
      return [];
    }
  }

  async normalize(rawItems: RawContent[]): Promise<NormalizedContent[]> {
    return rawItems.map(item => {
      // Clean HTML
      const rawContent = item['content:encoded'] || item.content || item.description || '';
      const cleanContent = DOMPurify.sanitize(rawContent, { ALLOWED_TAGS: [] }).trim();
      const cleanSummary = DOMPurify.sanitize(item.description || item.summary || '', { ALLOWED_TAGS: [] }).trim();

      const publishedAt = item.pubDate || item.isoDate 
        ? new Date(item.pubDate || item.isoDate) 
        : new Date();

      return {
        title: item.title || 'Untitled',
        summary: cleanSummary.substring(0, 500),
        content: cleanContent,
        source: this.providerRecord.name,
        sourceType: 'RSS',
        url: item.link || '',
        author: item.creator || item.author || null,
        publishedAt,
        imageUrl: null, // RSS rarely has reliable standard image tags unless parsed specifically
        language: 'en',
        category: this.providerRecord.category || 'GENERAL',
      };
    });
  }
}
