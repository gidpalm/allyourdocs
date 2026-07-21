import Link from "next/link"
import { FileText, File, Image as ImageIcon, Scissors, Minus, Type, RefreshCw, ArrowRight, Shield, Zap, Search } from "lucide-react"

export const metadata = {
  title: "All Document Tools - Free Online PDF & Image Converters",
  description: "Browse the complete collection of free, browser-based document tools: merge, split, compress, convert PDFs, extract text with OCR, and more. 100% private processing.",
}

const tools = [
  { title: "Merge PDF", description: "Combine multiple PDF files into a single, organized document in the order you choose.", icon: FileText, path: "/merge-pdf", accent: "text-indigo-600 bg-indigo-50" },
  { title: "Split PDF", description: "Extract specific pages or divide a PDF into smaller files by custom page ranges.", icon: Scissors, path: "/split-pdf", accent: "text-rose-600 bg-rose-50" },
  { title: "Compress PDF", description: "Shrink PDF file size by up to 70% while keeping text and layout intact.", icon: Minus, path: "/compress-pdf", accent: "text-amber-600 bg-amber-50" },
  { title: "PDF to Word", description: "Convert PDF files into editable Word documents, preserving the original layout.", icon: File, path: "/pdf-to-word", accent: "text-emerald-600 bg-emerald-50" },
  { title: "Word to PDF", description: "Turn DOC and DOCX files into universally compatible PDF documents.", icon: FileText, path: "/word-to-pdf", accent: "text-sky-600 bg-sky-50" },
  { title: "Image to PDF", description: "Build a single PDF from multiple images with adjustable page size and margins.", icon: ImageIcon, path: "/image-to-pdf", accent: "text-violet-600 bg-violet-50" },
  { title: "PDF to Text", description: "Pull all text out of a PDF for editing, search, or reuse in other apps.", icon: File, path: "/pdf-to-text", accent: "text-cyan-600 bg-cyan-50" },
  { title: "Image to Text (OCR)", description: "Extract editable text from images and scans using optical character recognition.", icon: Type, path: "/image-to-text", accent: "text-teal-600 bg-teal-50" },
  { title: "Rearrange PDF", description: "Reorder, rotate, or delete pages with an intuitive drag-and-drop editor.", icon: RefreshCw, path: "/rearrange-pdf", accent: "text-fuchsia-600 bg-fuchsia-50" },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">All Document Tools</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Nine free, browser-based tools to merge, split, compress, convert, and edit your documents.
            Every file is processed locally on your device — nothing is ever uploaded to a server.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mt-8">
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span className="text-sm sm:text-base">100% Private</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span className="text-sm sm:text-base">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Search className="w-5 h-5 text-indigo-600" />
              <span className="text-sm sm:text-base">No Registration</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="card p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300 group flex flex-col"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${tool.accent} flex-shrink-0 border border-current/10`}>
                  <tool.icon className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{tool.title}</h3>
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">{tool.description}</p>
                  <div className="flex items-center text-indigo-600 font-medium text-sm">
                    Open Tool
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 card p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need help choosing?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            Visit our <Link href="/blog" className="text-indigo-600 underline">Blog & Guides</Link> for step-by-step tutorials,
            or reach out on our <Link href="/contact" className="text-indigo-600 underline">Contact page</Link>.
          </p>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}

