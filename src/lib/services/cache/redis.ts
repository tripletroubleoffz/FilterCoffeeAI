import Redis from 'ioredis';
import { ICacheService } from './interface';

export class RedisCacheService implements ICacheService {
  private redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl || redisUrl === 'mock') {
      throw new Error('REDIS_URL must be configured to use RedisCacheService');
    }
    this.redis = new Redis(redisUrl);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, data);
      }
    } catch (err) {
      console.error('Redis cache set failed:', err);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      console.error('Redis cache delete failed:', err);
    }
  }
}
