import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import type { SessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';

const PROTECTED_ROUTES  = ['/feed', '/saved', '/notifications', '/settings', '/profile', '/challenges', '/admin'];
const ADMIN_ROUTES      = ['/admin'];
const AUTH_ONLY_ROUTES  = ['/login', '/signup'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // iron-session reads cookies from Request and writes to Response
  const session = await getIronSession<SessionData>(req.cookies as never, res.cookies as never, sessionOptions);

  const path      = req.nextUrl.pathname;
  const isLoggedIn = !!session.isLoggedIn;
  const isAdmin    = !!session.isAdmin;

  // Already logged in — bounce away from auth pages
  if (AUTH_ONLY_ROUTES.some(r => path.startsWith(r)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/feed', req.url));
  }

  // Not logged in — bounce away from protected pages
  if (PROTECTED_ROUTES.some(r => path.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Not admin — bounce away from admin area
  if (ADMIN_ROUTES.some(r => path.startsWith(r)) && !isAdmin) {
    return NextResponse.redirect(new URL('/feed', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads|sources).*)'],
};
