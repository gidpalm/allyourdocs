import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import Script from "next/script"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://allyourdocs.com'),
  title: {
    default: "AllYourDocs.com - Free Online PDF Tools",
    template: "%s | AllYourDocs.com"
  },
  description: "Free, secure PDF tools. Merge, split, convert PDFs online. 100% private processing - files never leave your computer. No registration required.",
  keywords: [
    "PDF tools", 
    "free PDF converter", 
    "merge PDF", 
    "split PDF", 
    "PDF to Word", 
    "Word to PDF",
    "compress PDF",
    "image to PDF",
    "PDF to text",
    "online PDF editor",
    "document converter",
    "free document tools"
  ],
  authors: [{ name: "AllYourDocs.com" }],
  creator: "AllYourDocs.com",
  publisher: "AllYourDocs.com",
  
  // ✅ ADD THIS - Put AdSense verification in metadata
  other: {
    'google-adsense-account': 'ca-pub-9089093304511732',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://allyourdocs.com",
    title: "AllYourDocs.com - Free Online PDF Tools",
    description: "Free, secure PDF tools. 100% private processing - files never leave your computer.",
    siteName: "AllYourDocs.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AllYourDocs.com - Free PDF Tools",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "AllYourDocs.com - Free Online PDF Tools",
    description: "Free, secure PDF tools. 100% private processing.",
    images: ["/twitter-image.png"],
    creator: "@allyourdocs",
  },
  
  // Verification
  verification: {
    google: "add-your-code-here",
  },
  
  alternates: {
    canonical: "https://allyourdocs.com",
  },
  category: "software",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <script async crossOrigin="anonymous" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9089093304511732"></script>
     
        {/* AdSense Auto Ads Initialization */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
        >
          {`
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-9089093304511732",
              enable_page_level_ads: true
            });
          `}
        </Script>
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AllYourDocs.com",
              "url": "https://allyourdocs.com",
              "description": "Free online PDF tools with 100% private processing",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Merge PDF",
                "Split PDF", 
                "PDF to Word",
                "Word to PDF",
                "Compress PDF",
                "Image to PDF",
                "PDF to Images"
              ],
              "author": {
                "@type": "Organization",
                "name": "AllYourDocs.com"
              }
            })
          }}
        />
        
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is AllYourDocs.com really free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! All tools are completely free with no hidden costs, watermarks, or registration required. You can use all features without creating an account."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are my files secure and private?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "100% secure and private. All processing happens directly in your browser - files never leave your computer. We never upload, store, or access your documents."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What file types do you support?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We support PDF, DOC, DOCX, images (JPG, PNG), and more. Our tools can convert between these formats while maintaining quality."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is there a file size limit?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Most tools support files up to 50MB. For best performance, we recommend files under 20MB."
                  }
                }
              ]
            })
          }}
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900 min-h-screen flex flex-col`}>
        {/* Skip navigation for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 font-medium shadow-lg"
        >
          Skip to main content
        </a>
        
        <Navigation />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
        
        {/* No-JavaScript warning */}
        <noscript>
          <div className="fixed inset-0 bg-gradient-to-br from-red-50 to-pink-50 z-50 flex items-center justify-center p-4">
            <div className="max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-red-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">JavaScript Required</h2>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>AllYourDocs.com requires JavaScript to function.</strong> Our tools process files directly in your browser for maximum privacy and security.
              </p>
              <p className="text-gray-600">
                Please enable JavaScript in your browser settings to use our free PDF tools.
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  )
}