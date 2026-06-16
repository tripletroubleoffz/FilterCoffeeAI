import Parser from 'rss-parser';
import { BaseIngestionProvider } from './BaseIngestionProvider';
import { RawContent, NormalizedContent } from '../types';
import DOMPurify from 'isomorphic-dompurify';

export class ArxivProvider extends BaseIngestionProvider {
  private parser: Parser;

  constructor(providerRecord: any) {
    super(providerRecord);
    this.parser = new Parser({
      customFields: {
        item: ['summary', 'author'],
      },
    });
  }

  async fetch(): Promise<RawContent[]> {
    if (!this.providerRecord.url) return [];
    
    try {
      // url should be e.g. http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG+OR+cat:cs.CV+OR+cat:stat.ML&sortBy=submittedDate&sortOrder=descending&max_results=100
      const feed = await this.parser.parseURL(this.providerRecord.url);
      return feed.items || [];
    } catch (error) {
      console.error(`Error fetching Arxiv for ${this.providerRecord.name}:`, error);
      return [];
    }
  }

  async normalize(rawItems: RawContent[]): Promise<NormalizedContent[]> {
    return rawItems.map(item => {
      const rawContent = item.summary || item.content || item.description || '';
      const cleanContent = DOMPurify.sanitize(rawContent, { ALLOWED_TAGS: [] }).trim();

      const publishedAt = item.pubDate || item.isoDate 
        ? new Date(item.pubDate || item.isoDate) 
        : new Date();

      return {
        title: item.title?.replace(/\n/g, ' ').trim() || 'Untitled',
        summary: cleanContent.substring(0, 500),
        content: cleanContent,
        source: this.providerRecord.name,
        sourceType: 'API_ARXIV',
        url: item.link || '',
        author: item.author || item.creator || null,
        publishedAt,
        imageUrl: null,
        language: 'en',
        category: this.providerRecord.category || 'RESEARCH',
      };
    });
  }
}
