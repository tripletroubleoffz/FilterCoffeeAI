import axios from 'axios';
import { BaseIngestionProvider } from './BaseIngestionProvider';
import { RawContent, NormalizedContent } from '../types';

export class HackerNewsProvider extends BaseIngestionProvider {
  async fetch(): Promise<RawContent[]> {
    if (!this.providerRecord.url) return [];
    
    try {
      // url should be e.g. https://hacker-news.firebaseio.com/v0/topstories.json
      const response = await axios.get<number[]>(this.providerRecord.url, { timeout: 10000 });
      const ids = response.data.slice(0, 50); // limit to 50
      
      const stories: RawContent[] = [];
      for (const id of ids) {
        try {
          const itemRes = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 });
          if (itemRes.data) stories.push(itemRes.data);
        } catch (e) {
          console.warn(`Failed to fetch HN item ${id}`);
        }
      }
      return stories;
    } catch (error) {
      console.error(`Error fetching from Hacker News:`, error);
      return [];
    }
  }

  async normalize(rawItems: RawContent[]): Promise<NormalizedContent[]> {
    return rawItems
      .filter(item => item && item.title)
      .map(item => {
        const publishedAt = item.time ? new Date(item.time * 1000) : new Date();
        const url = item.url || `https://news.ycombinator.com/item?id=${item.id}`;
        
        return {
          title: item.title,
          summary: '',
          content: item.text || item.title,
          source: this.providerRecord.name,
          sourceType: 'API_HACKERNEWS',
          url,
          author: item.by || null,
          publishedAt,
          imageUrl: null,
          language: 'en',
          category: this.providerRecord.category || 'DEVELOPER',
        };
      });
  }
}
