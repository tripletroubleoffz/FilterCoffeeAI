import { ICacheService } from './interface';

export class MockCacheService implements ICacheService {
  private cache = new Map<string, { value: any; expiresAt: number }>();

  constructor() {
    // Periodic cleanup of expired keys in background
    if (typeof setInterval !== 'undefined') {
      const interval = setInterval(() => {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
          if (now > item.expiresAt) {
            this.cache.delete(key);
          }
        }
      }, 30000);
      
      // Let node process exit even if interval is active
      if (interval && typeof interval.unref === 'function') {
        interval.unref();
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
