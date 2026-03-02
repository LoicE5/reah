import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface SessionData {
  userId:     number
  username:   string
  isAdmin:    boolean
  isLoggedIn: boolean
}

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET env var is required and must be at least 32 characters long.')
}

export const sessionOptions: SessionOptions = {
  cookieName: 'reah_session',
  password:   sessionSecret,
  cookieOptions: {
    secure:  process.env.NODE_ENV === 'production',
    maxAge:  60 * 60 * 24 * 30, // 30 days — same as PHP
    httpOnly: true,
    sameSite: 'lax',
  },
}

/** Get the raw iron-session object (for API routes that need to mutate it). */
export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

/** Returns current user data or null. Safe to call in Server Components. */
export async function getCurrentUser(): Promise<SessionData | null> {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) return null
  return {
    userId:     session.userId,
    username:   session.username,
    isAdmin:    session.isAdmin,
    isLoggedIn: true,
  }
}

/** Requires authentication — redirects to /login if not logged in. */
export async function requireAuth(): Promise<SessionData> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

/** Requires admin access — redirects to /feed if not admin. */
export async function requireAdmin(): Promise<SessionData> {
  const user = await requireAuth()
  if (!user.isAdmin) redirect('/feed')
  return user
}
