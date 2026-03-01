import { NextRequest, NextResponse } from 'next/server'

// Pages that require authentication (guests are redirected to /login)
const PROTECTED_ROUTES = ['/saved', '/notifications', '/settings', '/admin']
// /feed, /challenges, /profile, /search are public — they handle guests internally
const AUTH_ONLY_ROUTES = ['/login', '/signup']

export function middleware(req: NextRequest) {
  const path       = req.nextUrl.pathname
  const isLoggedIn = req.cookies.has('reah_session')

  // Already logged in — bounce away from auth-only pages
  if (AUTH_ONLY_ROUTES.some(r => path.startsWith(r)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/feed', req.url))
  }

  // Not logged in — bounce away from protected pages
  if (PROTECTED_ROUTES.some(r => path.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads|sources).*)'],
}
