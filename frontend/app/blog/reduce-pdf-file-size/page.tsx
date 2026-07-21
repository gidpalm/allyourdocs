import Link from "next/link"
import { Calendar, Clock, ArrowRight, Minus, FileDown, Image as ImageIcon, Settings, ChevronRight } from "lucide-react"

export const metadata = {
  title: "How to Reduce PDF File Size Without Losing Quality | AllYourDocs",
  description: "Professional techniques to compress PDF files while maintaining readability and image quality. Learn lossless compression, image optimization, and font subsetting strategies.",
}

export default function ReducePdfFileSizePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
          Back to Blog
        </Link>

        <article className="card p-8 md:p-12">
          <header className="mb-10 pb-8 border-b border-slate-200">
            <span className="badge badge-brand mb-4">Tutorial</span>
            <h1 className="section-title mb-4">How to Reduce PDF File Size Without Losing Quality</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Nov 15, 2024
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                5 min read
              </span>
            </div>
          </header>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Large PDF files can slow down sharing, increase storage costs, and make email attachments impossible. 
              The good news is that you can significantly reduce PDF file sizes without sacrificing readability or 
              visual quality. In this guide, we will walk through the most effective compression techniques used 
              by document professionals.
            </p>

            <h2 className="section-title text-2xl mt-10 mb-4">1. Optimize Images Before Embedding</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Images are usually the biggest contributor to oversized PDFs. Before converting or exporting, 
              resize images to the exact dimensions they will appear in the document. A 3000px wide photo displayed 
              at 600px carries unnecessary data. Use JPEG for photographs and PNG only for text-heavy graphics 
              or screenshots where transparency matters.
            </p>

            <div className="surface p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="icon-tile-muted w-10 h-10 flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Quick Tip</h3>
                  <p className="text-sm text-slate-600">
                    Export images at 150–200 DPI for screen viewing and 300 DPI for print. Most users never 
                    need more than 200 DPI for digital documents.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="section-title text-2xl mt-10 mb-4">2. Use Lossless Compression Wisely</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              PDF compression comes in two forms: lossy and lossless. Lossless compression reduces file size 
              by eliminating redundant data without removing any content. This is ideal for text-heavy documents 
              where every character must remain crisp. Lossy compression removes some data, which works well 
              for photographs but can blur text if overused.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              When choosing a compression level, start with a medium setting and preview the result. If text 
              remains sharp and images look acceptable, you can push the compression further. Always keep a 
              backup of the original file.
            </p>

            <h2 className="section-title text-2xl mt-10 mb-4">3. Subset and Embed Fonts Efficiently</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Full font embedding can add megabytes to a PDF. Font subsetting includes only the characters 
              actually used in the document, dramatically shrinking file size. If you are using standard fonts 
              like Arial or Times New Roman, consider not embedding them at all and relying on the reader&apos;s 
              system fonts instead.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="stat">
                <div className="stat-value">70%</div>
                <div className="stat-label">Typical size reduction</div>
              </div>
              <div className="stat">
                <div className="stat-value">0</div>
                <div className="stat-label">Files uploaded to servers</div>
              </div>
              <div className="stat">
                <div className="stat-value">100%</div>
                <div className="stat-label">Free to use</div>
              </div>
            </div>

            <h2 className="section-title text-2xl mt-10 mb-4">4. Remove Unnecessary Elements</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              PDFs often contain hidden data: embedded thumbnails, annotations, bookmarks, metadata, and 
              hidden layers. Cleaning these out can shave off a surprising amount of space. Most PDF editors 
              include a &quot;Remove Hidden Information&quot; or &quot;Sanitize&quot; feature that strips 
              everything except the visible content.
            </p>

            <h2 className="section-title text-2xl mt-10 mb-4">5. Convert Vector Graphics to Images When Appropriate</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Complex vector drawings and CAD exports can bloat a PDF. If a graphic does not need to scale, 
              rasterizing it at the target resolution often produces a smaller file. This is especially true 
              for logos with gradients and detailed illustrations.
            </p>

            <div className="alert alert-info mb-8">
              <Settings className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">Automate the Process</p>
                <p className="text-sm text-blue-800">
                  Instead of manually adjusting settings, use our <strong>Compress PDF</strong> tool to optimize 
                  files instantly. It applies balanced compression that preserves readability and image clarity 
                  for most everyday use cases.
                </p>
              </div>
            </div>

            <h2 className="section-title text-2xl mt-10 mb-4">When to Re-compress an Already Compressed PDF</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              If a PDF has already been compressed multiple times, additional passes may not help and could 
              degrade quality. Check the file history first. A single, well-tuned compression is almost always 
              better than repeated aggressive passes.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="card p-6 bg-indigo-50 border-indigo-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to compress your PDF?</h3>
              <p className="text-slate-600 mb-4">
                Try our free Compress PDF tool to reduce file size while keeping your document crisp and readable.
              </p>
              <Link href="/compress-pdf" className="btn-primary">
                <Minus className="w-4 h-4" />
                Compress PDF Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link href="/blog" className="btn-secondary">
            <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
            Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  )
}
