import axios from 'axios';
import { BaseIngestionProvider } from './BaseIngestionProvider';
import { RawContent, NormalizedContent } from '../types';
import DOMPurify from 'isomorphic-dompurify';

export class GithubReleaseProvider extends BaseIngestionProvider {
  async fetch(): Promise<RawContent[]> {
    if (!this.providerRecord.url) return [];
    
    try {
      // The url will be the direct api url e.g. https://api.github.com/repos/openai/openai-node/releases
      const response = await axios.get<RawContent[]>(this.providerRecord.url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'FilterCoffee-AI-Ingestion',
        },
        timeout: 10000,
      });
      return response.data.slice(0, 20); // Latest 20 releases
    } catch (error) {
      console.error(`Error fetching GitHub releases for ${this.providerRecord.name}:`, error);
      return [];
    }
  }

  async normalize(rawItems: RawContent[]): Promise<NormalizedContent[]> {
    return rawItems.map(item => {
      const cleanContent = DOMPurify.sanitize(item.body || '', { ALLOWED_TAGS: [] }).trim();
      
      return {
        title: item.name || item.tag_name || 'Untitled Release',
        summary: cleanContent.substring(0, 500),
        content: cleanContent,
        source: this.providerRecord.name,
        sourceType: 'API_GITHUB',
        url: item.html_url || '',
        author: item.author?.login || null,
        publishedAt: new Date(item.published_at || item.created_at || new Date()),
        imageUrl: item.author?.avatar_url || null,
        language: 'en',
        category: this.providerRecord.category || 'ENGINEERING',
      };
    });
  }
}
