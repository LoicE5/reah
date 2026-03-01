import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/feed', '/saved', '/notifications', '/settings', '/profile', '/challenges', '/admin'];
const AUTH_ONLY_ROUTES = ['/login', '/signup'];

export function middleware(req: NextRequest) {
  const path       = req.nextUrl.pathname;
  const isLoggedIn = req.cookies.has('reah_session');

  // Already logged in — bounce away from auth-only pages
  if (AUTH_ONLY_ROUTES.some(r => path.startsWith(r)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/feed', req.url));
  }

  // Not logged in — bounce away from protected pages
  if (PROTECTED_ROUTES.some(r => path.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads|sources).*)'],
};
