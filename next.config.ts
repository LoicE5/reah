import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
              "connect-src 'self' https://api.vimeo.com https://fresnel.vimeocdn.com",
              "media-src 'self' https://player.vimeo.com",
            ].join(' '),
          },
        ],
      },
    ]
  }
}

export default nextConfig
