'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function AdSense() {
  const isProduction = process.env.NODE_ENV === 'production';
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-9089093304511732';

  useEffect(() => {
    if (isProduction && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense initialization error:', error);
      }
    }
  }, [isProduction]);

  return (
    <>
      {isProduction && (
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}