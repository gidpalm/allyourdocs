import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://allyourdocs.com'
  
  const routes = [
    '',
    'about',
    'privacy-policy', 
    'terms-of-service',
    'feedback',
    'merge-pdf',
    'split-pdf',
    'pdf-to-word',
    'word-to-pdf',
    'compress-pdf',
    'image-to-pdf',
    'pdf-to-text',
    'image-to-text',
    'rearrange-pdf',
    'blog/reduce-pdf-file-size',
    'blog/pdf-vs-word',
    'blog/ocr-technology-explained',
  ].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }))

  return routes
}