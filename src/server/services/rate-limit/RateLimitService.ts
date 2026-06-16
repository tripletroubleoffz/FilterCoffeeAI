import Redis from 'ioredis';

interface MemoryBucket {
  timestamps: number[];
}
const memoryStore = new Map<string, MemoryBucket>();

if (typeof globalThis !== 'undefined') {
  const globalAny = globalThis as any;
  if (!globalAny.__localRateLimitInterval) {
    globalAny.__localRateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of memoryStore.entries()) {
        bucket.timestamps = bucket.timestamps.filter((t) => now - t < 60000);
        if (bucket.timestamps.length === 0) {
          memoryStore.delete(key);
        }
      }
    }, 60000);
  }
}

export class RateLimitService {
  private static redis: Redis | null = null;

  private static getRedisInstance(): Redis | null {
    if (this.redis) return this.redis;

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl || redisUrl === 'mock') {
      return null;
    }

    try {
      this.redis = new Redis(redisUrl);
      this.redis.on('error', (err) => {
        console.error('[RateLimit] Redis connection error:', err);
      });
      return this.redis;
    } catch (err) {
      console.error('[RateLimit] Failed to connect to Redis:', err);
      return null;
    }
  }

  static async limit(
    key: string,
    limitCount: number,
    windowMs = 60000
  ): Promise<boolean> {
    const now = Date.now();
    const redis = this.getRedisInstance();

    if (redis) {
      const clearBefore = now - windowMs;
      try {
        const pipeline = redis.pipeline();
        pipeline.zremrangebyscore(key, 0, clearBefore);
        pipeline.zadd(key, now, `${now}-${Math.random()}`);
        pipeline.zcard(key);
        pipeline.expire(key, Math.ceil(windowMs / 1000));

        const results = await pipeline.exec();
        if (results) {
          const zcardResult = results[2];
          const card = zcardResult ? (zcardResult[1] as number) : 0;
          return card > limitCount;
        }
      } catch (err) {
        console.error('[RateLimit] Redis command failed, falling back to memory check:', err);
      }
    }

    let bucket = memoryStore.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      memoryStore.set(key, bucket);
    }

    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

    if (bucket.timestamps.length >= limitCount) {
      return true;
    }

    bucket.timestamps.push(now);
    return false;
  }
}
