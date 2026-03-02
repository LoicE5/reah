/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-process / single-instance deployments.
 * For multi-instance deployments, replace with Redis-backed solution (e.g. @upstash/ratelimit).
 */

interface Window {
  timestamps: number[]
}

const store = new Map<string, Window>()

/**
 * Returns true if the request should be blocked (limit exceeded).
 * @param key      Unique key (e.g. `login:1.2.3.4`)
 * @param limit    Max allowed requests in the window
 * @param windowMs Window size in milliseconds
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const cutoff = now - windowMs

  const entry = store.get(key) ?? { timestamps: [] }
  // Prune old timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => t > cutoff)

  if (entry.timestamps.length >= limit) {
    store.set(key, entry)
    return true
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return false
}

/** Extracts the best available client IP from a Next.js Request. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
