import { ICacheService } from './interface';
import { RedisCacheService } from './redis';
import { MockCacheService } from './mock';

let instance: ICacheService | null = null;

const cacheService = new Proxy({} as ICacheService, {
  get(target, prop) {
    if (!instance) {
      if (process.env.CACHE_PROVIDER === 'mock' || !process.env.REDIS_URL || process.env.REDIS_URL === 'mock') {
        instance = new MockCacheService();
      } else {
        instance = new RedisCacheService();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { cacheService };
export type { ICacheService };

