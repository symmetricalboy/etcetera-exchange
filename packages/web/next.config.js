/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Removed standalone mode - causing issues in monorepo setup
  // output: 'standalone',
}

module.exports = nextConfig