import { ICacheService } from './interface';
import { RedisCacheService } from './redis';

let instance: ICacheService | null = null;

const cacheService = new Proxy({} as ICacheService, {
  get(target, prop) {
    if (!instance) {
      instance = new RedisCacheService();
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { cacheService };
export type { ICacheService };
