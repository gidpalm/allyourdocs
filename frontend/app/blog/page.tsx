import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import BlogPreview from "@/components/BlogPreview"

export const metadata = {
  title: "Blog & Guides - Document Processing Tips | AllYourDocs",
  description: "In-depth guides and tutorials on PDF tools, OCR, compression, and document conversion to help you work faster and more securely.",
}

const blogPosts = [
  {
    title: "How to Reduce PDF File Size Without Losing Quality",
    excerpt: "Learn professional techniques to compress PDF files while maintaining readability and image quality for different use cases. This comprehensive guide covers lossless compression, image optimization, and font subsetting strategies used by document professionals.",
    category: "Tutorial",
    readTime: "5 min read",
    date: "Nov 15, 2024",
    slug: "/blog/reduce-pdf-file-size"
  },
  {
    title: "PDF vs. Word: When to Use Which Format",
    excerpt: "A comprehensive guide comparing PDF and DOC formats to help you choose the right format for your specific needs. Understand the strengths and limitations of each format for printing, editing, sharing, and archiving documents.",
    category: "Guide",
    readTime: "7 min read",
    date: "Nov 10, 2024",
    slug: "/blog/pdf-vs-word-guide"
  },
  {
    title: "Understanding OCR Technology: How It Extracts Text from Images",
    excerpt: "Discover how Optical Character Recognition works and best practices for getting accurate text extraction results. Learn about preprocessing techniques, language models, and how to handle challenging documents.",
    category: "Technology",
    readTime: "6 min read",
    date: "Nov 5, 2024",
    slug: "/blog/ocr-technology-explained"
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Blog & Guides</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Practical tutorials and explainers to help you get the most out of our free document tools
            and understand the technology behind them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <BlogPreview key={index} post={post} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/tools" className="btn-primary">
            Explore Our Tools
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}

