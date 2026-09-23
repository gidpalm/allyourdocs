import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"

type Post = {
  title: string
  excerpt: string
  category: string
  readTime: string
  date: string
  slug: string
}

type BlogPreviewProps = {
  post: Post
}

export default function BlogPreview({ post }: BlogPreviewProps) {
  return (
    <article className="block p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {post.category}
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {post.date}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-snug">
        {post.title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {post.excerpt}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {post.readTime}
        </span>
        <Link
          href={post.slug}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 transition-colors"
        >
          Read More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  )
}
