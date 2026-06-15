import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/features',
  '/pricing',
  '/about',
  '/contact',
  '/signin',
  '/signup',
  '/sign-in',
  '/sign-up',
  '/verify',
  '/privacy-policy',
  '/terms-of-service',
];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/trpc')
  );
}

export function proxy(request: NextRequest, _event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  const projectRef = 'dputisltxposlukceoxo';
  const hasSession =
    request.cookies.has(`sb-${projectRef}-auth-token`) ||
    request.cookies.has(`sb-${projectRef}-auth-token.0`);

  const isAuthPage =
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname === '/signin' ||
    pathname === '/signup';

  if (hasSession && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (!isPublicPath(pathname)) {
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    '/(api|trpc)(.*)',
  ],
};

