import { TRPCError } from '@trpc/server';
import { RateLimitService } from './RateLimitService';

export const RATE_LIMIT_CONFIGS = {
  ANONYMOUS: { keyPrefix: 'rl:anon', limit: 10 },
  AUTHENTICATED: { keyPrefix: 'rl:auth', limit: 60 },
  AI: { keyPrefix: 'rl:ai', limit: 10 },
  SEARCH: { keyPrefix: 'rl:search', limit: 20 },
  BILLING: { keyPrefix: 'rl:billing', limit: 5 },
  ADMIN: { keyPrefix: 'rl:admin', limit: 30 },
};

export function getClientIp(req?: Request): string {
  if (!req) return '127.0.0.1';
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for') || headers.get('x-real-ip');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1';
}

export function trpcRateLimit(config: { keyPrefix: string; limit: number; windowMs?: number }) {
  return async ({ next, ctx }: any) => {
    const ip = getClientIp(ctx.req);
    const identifier = ctx.user ? ctx.user.id : ip;
    const key = `${config.keyPrefix}:${identifier}`;

    const isLimited = await RateLimitService.limit(key, config.limit, config.windowMs || 60000);
    if (isLimited) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Too many requests. Limit is ${config.limit} per minute. Please try again later.`,
      });
    }
    return next();
  };
}
