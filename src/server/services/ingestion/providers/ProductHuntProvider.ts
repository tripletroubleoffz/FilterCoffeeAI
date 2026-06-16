import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseIngestionProvider } from './BaseIngestionProvider';
import { RawContent, NormalizedContent } from '../types';

export class ProductHuntProvider extends BaseIngestionProvider {
  async fetch(): Promise<RawContent[]> {
    if (!this.providerRecord.url) return [];
    
    try {
      // url should be e.g. https://www.producthunt.com/
      const response = await axios.get(this.providerRecord.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FilterCoffeeBot/1.0)',
        },
        timeout: 10000,
      });
      
      const $ = cheerio.load(response.data);
      const items: RawContent[] = [];
      
      // Select the main post items (this selector might need adjustments based on PH UI)
      $('[data-test^="post-item-"]').each((_, el) => {
        if (items.length >= 30) return; // max 30
        
        const title = $(el).find('a[data-test^="post-name"]').text().trim();
        const tagline = $(el).find('a[data-test^="post-tagline"]').text().trim();
        const link = $(el).find('a[data-test^="post-name"]').attr('href');
        
        if (title && link) {
          items.push({
            title,
            tagline,
            link: link.startsWith('http') ? link : `https://www.producthunt.com${link}`,
          });
        }
      });
      
      return items;
    } catch (error) {
      console.error(`Error fetching Product Hunt for ${this.providerRecord.name}:`, error);
      return [];
    }
  }

  async normalize(rawItems: RawContent[]): Promise<NormalizedContent[]> {
    return rawItems.map(item => {
      return {
        title: item.title,
        summary: item.tagline,
        content: item.tagline,
        source: this.providerRecord.name,
        sourceType: 'SCRAPE_PRODUCTHUNT',
        url: item.link,
        author: null,
        publishedAt: new Date(), // Scraped items represent current top
        imageUrl: null,
        language: 'en',
        category: this.providerRecord.category || 'STARTUPS',
      };
    });
  }
}
