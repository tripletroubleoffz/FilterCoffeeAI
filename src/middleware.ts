import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isMockClerk = !process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.includes('mock');

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/trpc(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (isMockClerk) {
    return NextResponse.next();
  }
  
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
