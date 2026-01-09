import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://allyourdocs.pro'
  
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
    'pdf-to-images',
    'pdf-to-text',
    'image-to-text',
    'rearrange-pdf',
  ].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }))

  return routes
}