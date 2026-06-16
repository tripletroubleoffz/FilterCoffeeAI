import { SourceProvider } from '@prisma/client';
import { IngestionProvider } from './types';
import { RSSProvider } from './providers/RSSProvider';
import { HackerNewsProvider } from './providers/HackerNewsProvider';
import { GithubReleaseProvider } from './providers/GithubReleaseProvider';
import { ArxivProvider } from './providers/ArxivProvider';
import { ProductHuntProvider } from './providers/ProductHuntProvider';

export class SourceRegistry {
  /**
   * Get the appropriate provider implementation for a given SourceProvider record.
   */
  static getProvider(record: SourceProvider): IngestionProvider | null {
    if (!record.isActive) return null;

    // First try by explicit type
    switch (record.type) {
      case 'RSS':
        return new RSSProvider(record);
      case 'API_HACKERNEWS':
        return new HackerNewsProvider(record);
      case 'API_GITHUB':
        return new GithubReleaseProvider(record);
      case 'API_ARXIV':
        return new ArxivProvider(record);
      case 'SCRAPE_PRODUCTHUNT':
        return new ProductHuntProvider(record);
    }

    // Fallback parsing based on URL if type is generically just API or SCRAPE but we can infer it
    if (record.url.includes('hacker-news.firebaseio.com')) {
      return new HackerNewsProvider(record);
    }
    if (record.url.includes('api.github.com/repos')) {
      return new GithubReleaseProvider(record);
    }
    if (record.url.includes('export.arxiv.org/api')) {
      return new ArxivProvider(record);
    }
    if (record.url.includes('producthunt.com')) {
      return new ProductHuntProvider(record);
    }
    if (record.url.endsWith('.xml') || record.url.includes('feed')) {
      return new RSSProvider(record);
    }

    console.warn(`Unsupported source type or url: ${record.type} / ${record.url} for source ${record.name}`);
    return null;
  }
}
