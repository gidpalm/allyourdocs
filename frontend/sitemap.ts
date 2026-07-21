import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://allyourdocs.com'

  const routes: Array<{ route: string; freq: "daily" | "weekly" }> = [
    { route: '', freq: 'daily' },
    { route: 'about', freq: 'weekly' },
    { route: 'privacy-policy', freq: 'weekly' },
    { route: 'terms-of-service', freq: 'weekly' },
    { route: 'cookie-policy', freq: 'weekly' },
    { route: 'dmca', freq: 'weekly' },
    { route: 'feedback', freq: 'weekly' },
    { route: 'contact', freq: 'weekly' },
    { route: 'blog', freq: 'weekly' },
    { route: 'blog/reduce-pdf-file-size', freq: 'weekly' },
    { route: 'blog/pdf-vs-word-guide', freq: 'weekly' },
    { route: 'blog/ocr-technology-explained', freq: 'weekly' },
    { route: 'tools', freq: 'weekly' },
    { route: 'merge-pdf', freq: 'weekly' },
    { route: 'split-pdf', freq: 'weekly' },
    { route: 'pdf-to-word', freq: 'weekly' },
    { route: 'word-to-pdf', freq: 'weekly' },
    { route: 'compress-pdf', freq: 'weekly' },
    { route: 'image-to-pdf', freq: 'weekly' },
    { route: 'pdf-to-text', freq: 'weekly' },
    { route: 'image-to-text', freq: 'weekly' },
    { route: 'rearrange-pdf', freq: 'weekly' },
  ]

  return routes.map(({ route, freq }) => ({
    url: `${baseUrl}/${route}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority: route === '' ? 1.0 : 0.8,
  }))
}
