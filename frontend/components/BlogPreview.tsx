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
    <article className="card p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="badge badge-brand">
          {post.category}
        </span>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {post.date}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-snug">
        {post.title}
      </h3>

      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
        {post.excerpt}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {post.readTime}
        </span>
        <Link
          href={post.slug}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1 transition-colors"
        >
          Read More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  )
}
