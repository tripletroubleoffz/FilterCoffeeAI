import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

// Simple in-memory sliding window rate limiter
interface RateLimitBucket {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitBucket>();

// Clean up store periodically to prevent memory leaks
if (typeof globalThis !== 'undefined') {
  const globalAny = globalThis as any;
  if (!globalAny.__rateLimitInterval) {
    globalAny.__rateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of rateLimitStore.entries()) {
        bucket.timestamps = bucket.timestamps.filter(t => now - t < 60000);
        if (bucket.timestamps.length === 0) {
          rateLimitStore.delete(key);
        }
      }
    }, 60000);
  }
}

function isRateLimited(ip: string, category: string, limit: number, windowMs: number): boolean {
  const key = `${ip}:${category}`;
  const now = Date.now();
  
  let bucket = rateLimitStore.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    rateLimitStore.set(key, bucket);
  }
  
  // Filter out expired timestamps
  bucket.timestamps = bucket.timestamps.filter(t => now - t < windowMs);
  
  if (bucket.timestamps.length >= limit) {
    return true;
  }
  
  bucket.timestamps.push(now);
  return false;
}

export function proxy(request: NextRequest, _event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // 1. RATE LIMITING SPECIFICATIONS
  // Login: 5 req/min
  // Signup: 5 req/min
  // Password Reset: 3 req/min
  // AI Generation (search): 10 req/min
  // Contact Form: 3 req/min
  // Admin APIs: 20 req/min
  let limit = 100;
  let windowMs = 60000;
  let rateLimitCategory = '';

  if (pathname.startsWith('/sign-in')) {
    rateLimitCategory = 'login';
    limit = 5;
  } else if (pathname.startsWith('/sign-up')) {
    rateLimitCategory = 'signup';
    limit = 5;
  } else if (pathname.startsWith('/api/trpc/signals.search')) {
    rateLimitCategory = 'ai-generation';
    limit = 10;
  } else if (pathname.startsWith('/api/trpc/contact.submitMessage')) {
    rateLimitCategory = 'contact';
    limit = 3;
  } else if (pathname.startsWith('/api/trpc/admin')) {
    rateLimitCategory = 'admin';
    limit = 20;
  }

  if (rateLimitCategory && isRateLimited(ip, rateLimitCategory, limit, windowMs)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. CSRF PROTECTION FOR MUTATIONS (POST, PUT, DELETE, etc.)
  // Exclude webhooks as they rely on signature headers verification
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && !pathname.startsWith('/api/webhooks')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host') || request.nextUrl.host;
    const protocol = request.nextUrl.protocol;
    const expectedOrigin = `${protocol}//${host}`;

    if (origin && origin !== expectedOrigin) {
      return new NextResponse(
        JSON.stringify({ error: 'CSRF validation failed: Origin mismatch.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 3. ROUTE PROTECTION
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/daily-brew') ||
    pathname.startsWith('/weekly-roast') ||
    pathname.startsWith('/monthly-blend') ||
    pathname.startsWith('/annual-reserve') ||
    pathname.startsWith('/brew-feed') ||
    pathname.startsWith('/coffee-search') ||
    pathname.startsWith('/saved-beans') ||
    pathname.startsWith('/signals') ||
    pathname.startsWith('/startup-cafe') ||
    pathname.startsWith('/funding-board') ||
    pathname.startsWith('/market-signals') ||
    pathname.startsWith('/ai-radar') ||
    pathname.startsWith('/company-lounge') ||
    pathname.startsWith('/model-roastery') ||
    pathname.startsWith('/career-roast') ||
    pathname.startsWith('/skill-radar') ||
    pathname.startsWith('/hiring-pulse') ||
    pathname.startsWith('/research-lab');

  const isAuthPage =
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname === '/signin' ||
    pathname === '/signup';

  const authProvider = process.env.AUTH_PROVIDER || 'mock';
  let isAuthenticated = false;
  const projectRef = 'dputisltxposlukceoxo';

  if (authProvider === 'supabase') {
    isAuthenticated =
      request.cookies.has(`sb-${projectRef}-auth-token`) ||
      request.cookies.has(`sb-${projectRef}-auth-token.0`);
  } else if (authProvider === 'mock') {
    isAuthenticated = request.cookies.has('fc_session');
  } else if (authProvider === 'clerk') {
    isAuthenticated = request.cookies.has('__session');
  }

  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 4. SECURITY HEADERS
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy (allowing connections to self, fonts, and supabase)
  const cspHeader = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dputisltxposlukceoxo.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://dputisltxposlukceoxo.supabase.co; connect-src 'self' https://dputisltxposlukceoxo.supabase.co wss://dputisltxposlukceoxo.supabase.co; frame-ancestors 'none';`;
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
