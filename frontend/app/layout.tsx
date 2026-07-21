import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import Script from "next/script"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ToastProvider } from "@/components/ToastProvider"
import AdSense from "@/components/Adsense"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbbf24',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://allyourdocs.com'),
  title: {
    default: "AllYourDocs - Free Online PDF & Document Tools",
    template: "%s | AllYourDocs"
  },
  description: "Free, secure PDF and document tools. Merge, split, compress, convert, and edit files online. 100% private, browser-based processing.",
  keywords: ["PDF tools", "merge PDF", "split PDF", "compress PDF", "PDF converter", "Word to PDF", "free PDF editor", "online document tools", "OCR", "image to text"],
  
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
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://allyourdocs.com",
    title: "AllYourDocs - Free Online PDF Tools",
    description: "Free, secure PDF tools. Merge, split, convert PDFs online.",
    siteName: "AllYourDocs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AllYourDocs.com - Free PDF Tools",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "AllYourDocs - Free Online PDF Tools",
    description: "Free, secure PDF tools.",
    images: ["/twitter-image.png"],
    creator: "@allyourdocs",
  },

  alternates: {
    canonical: "https://allyourdocs.com",
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  }
}

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AllYourDocs",
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
    "Rearrange PDF",
    "PDF to Text",
    "Image to Text"
  ],
  "author": {
    "@type": "Organization",
    "name": "AllYourDocs"
  }
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is AllYourDocs.com really free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. All tools are completely free with no hidden costs, watermarks, or registration required."
      }
    },
    {
      "@type": "Question",
      "name": "Are my files secure and private?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "100% secure and private. All processing happens directly in your browser and files are never uploaded to any server."
      }
    },
    {
      "@type": "Question",
      "name": "What file types do you support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We support PDF, DOC, DOCX, images (JPG, PNG), and more."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a file size limit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most tools support files up to 50MB."
      }
    }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9089093304511732" />
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || ""} />
        
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        
        <script
          id="webapp-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webAppSchema)
          }}
          suppressHydrationWarning
        />
        
        <script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${inter.className} bg-[var(--bg)] text-[var(--text)] min-h-screen flex flex-col antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <Navigation />
            <main id="main-content" className="flex-grow w-full">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
        
        <AdSense />
        
        <noscript>
          <div className="fixed inset-0 bg-[var(--bg)] z-50 flex items-center justify-center p-4">
            <div className="text-center p-8 border border-[var(--border)] rounded-lg bg-[var(--surface)] max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-[var(--text)] mb-4">JavaScript Required</h2>
              <p className="text-[var(--text-muted)] mb-4">Please enable JavaScript to use our tools.</p>
              <p className="text-sm text-[var(--text-subtle)]">
                Our tools run directly in your browser for maximum privacy and security.
              </p>
            </div>
          </div>
        </noscript>
        
        {isProduction && (
          <Script
            id="analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID || 'YOUR-GA4-ID'}');
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}