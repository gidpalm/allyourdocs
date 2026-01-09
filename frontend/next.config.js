// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic config
  output: 'standalone',
  poweredByHeader: false,
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: true, // Keep true for now, fix later
  },
  
  // Images
  images: {
    unoptimized: true,
  },
  
  // Security headers directly in next.config.js
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Add experimental config for stability
  experimental: {
    webpackBuildWorker: true,
  },
}

module.exports = nextConfig