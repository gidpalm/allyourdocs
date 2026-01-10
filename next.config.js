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
  
  // ADD THIS: Environment variable for your domain
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://allyourdocs.com',
  },
  
  // ADD THIS: Redirect from old URL to new domain
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'allyourdocs-six.vercel.app',
          },
        ],
        destination: 'https://allyourdocs.com/:path*',
        permanent: true,
      },
    ]
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