import type { NextConfig } from "next"
import { PHASE_PRODUCTION_BUILD } from 'next/constants'

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === '1' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
      { protocol: 'https', hostname: 'vumbnail.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://player.vimeo.com https://f.vimeocdn.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://i.vimeocdn.com https://vumbnail.com",
              "frame-src https://player.vimeo.com",
              "frame-ancestors 'self'",
              "connect-src 'self' https://api.vimeo.com https://fresnel.vimeocdn.com",
              "media-src 'self' https://player.vimeo.com",
            ].join('; '),
          },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  }
}

export default function configureNext(phase: string): NextConfig {
  // Next evaluates route modules at build time. Preview builds use no production credentials.
  if (phase === PHASE_PRODUCTION_BUILD && process.env.VERCEL_ENV === 'preview') {
    process.env.DATABASE_URL ??= 'postgresql://127.0.0.1:1/reah'
    process.env.SESSION_SECRET ??= 'reah-preview-build-only-session-secret'
  }

  return nextConfig
}
