import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://allyourdocs.com'),
  title: {
    default: "AllYourDocs.com - Free Online PDF Tools",
    template: "%s | AllYourDocs.com"
  },
  description: "Free, secure PDF tools. Merge, split, convert PDFs online.",
  
  
  
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
    title: "AllYourDocs.com - Free Online PDF Tools",
    description: "Free, secure PDF tools.",
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
  
  twitter: {
    card: "summary_large_image",
    title: "AllYourDocs.com - Free Online PDF Tools",
    description: "Free, secure PDF tools.",
    images: ["/twitter-image.png"],
    creator: "@allyourdocs",
  },
  
  alternates: {
    canonical: "https://allyourdocs.com",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9089093304511732"
          crossOrigin="anonymous"
        />
        
        
        {/* 
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication",...}</script>
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage",...}</script>
        */}
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 min-h-screen flex flex-col`}>
        <Navigation />
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        <Footer />
        
        {/* No-JS warning */}
        <noscript>
          <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
            <div className="text-center p-8 border border-red-300 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">JavaScript Required</h2>
              <p className="text-gray-700">Please enable JavaScript to use our tools.</p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  )
}