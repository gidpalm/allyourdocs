interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
}

export default function SEO({ 
  title, 
  description, 
  canonical,
  ogImage = "/og-image.png"
}: SEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://allyourdocs.com'
  const fullTitle = title ? `${title} | AllYourDocs.com` : 'AllYourDocs.com - Free Online PDF Tools'
  const fullDescription = description || 'Free, secure PDF tools. Merge, split, convert PDFs online. 100% private processing.'
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
    </>
  )
}