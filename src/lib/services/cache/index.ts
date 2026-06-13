import { ICacheService } from './interface';
import { MockCacheService } from './mock';
import { RedisCacheService } from './redis';

const cacheProvider = process.env.CACHE_PROVIDER || 'mock';

let cacheService: ICacheService;

if (cacheProvider === 'redis' && process.env.REDIS_URL && process.env.REDIS_URL !== 'mock') {
  cacheService = new RedisCacheService();
} else {
  cacheService = new MockCacheService();
}

export { cacheService };
export type { ICacheService };
