// lib/env.ts
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  adsenseId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || '',
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '10'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
};

// Validate required env vars in production
if (process.env.NODE_ENV === 'production') {
  if (!env.adsenseId) {
    console.warn('⚠️ Warning: NEXT_PUBLIC_ADSENSE_PUBLISHER_ID is not set');
  }
  if (!env.emailUser || !env.emailPass) {
    console.warn('⚠️ Warning: Email credentials are not fully configured');
  }
}