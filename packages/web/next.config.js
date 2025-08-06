/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'cdn.bsky.app', // Bluesky avatars
      'bsky.social',  // Bluesky images
      'localhost',    // Local development
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.railway.app',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  // Enable standalone mode for Railway deployment
  output: 'standalone',
}

module.exports = nextConfig