import Link from "next/link"
import { Calendar, Clock, ArrowRight, Type, Scan, Settings, FileText, ChevronRight, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Understanding OCR Technology: How It Extracts Text from Images | AllYourDocs",
  description: "Discover how Optical Character Recognition works and best practices for getting accurate text extraction results from scanned documents and images.",
}

export default function OcrTechnologyExplainedPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
          Back to Blog
        </Link>

        <article className="card p-8 md:p-12">
          <header className="mb-10 pb-8 border-b border-slate-200">
            <span className="badge badge-brand mb-4">Technology</span>
            <h1 className="section-title mb-4">Understanding OCR Technology: How It Extracts Text from Images</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Nov 5, 2024
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                6 min read
              </span>
            </div>
          </header>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Optical Character Recognition, or OCR, is the technology that turns images of text into editable, 
              searchable content. It powers everything from document scanners to mobile banking apps. Understanding 
              how OCR works helps you prepare documents for better results and choose the right tool for your needs.
            </p>

            <h2 className="section-title text-2xl mt-10 mb-4">How OCR Works</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              OCR software analyzes an image pixel by pixel, looking for shapes that match known characters. 
              The process typically involves three stages: preprocessing, recognition, and post-processing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="surface p-5">
                <div className="icon-tile-muted w-10 h-10 mb-3">
                  <Scan className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Preprocessing</h3>
                <p className="text-sm text-slate-600">
                  The image is cleaned up: noise is removed, contrast is adjusted, and the page is deskewed 
                  so text lines are horizontal.
                </p>
              </div>
              <div className="surface p-5">
                <div className="icon-tile-muted w-10 h-10 mb-3">
                  <Type className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Recognition</h3>
                <p className="text-sm text-slate-600">
                  Algorithms match character shapes against trained models. Modern OCR uses neural networks 
                  that learn from millions of text samples.
                </p>
              </div>
              <div className="surface p-5">
                <div className="icon-tile-muted w-10 h-10 mb-3">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Post-processing</h3>
                <p className="text-sm text-slate-600">
                  The raw output is corrected using dictionaries, context rules, and language models to 
                  fix misread characters.
                </p>
              </div>
            </div>

            <h2 className="section-title text-2xl mt-10 mb-4">Why Accuracy Varies</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Not all OCR engines are equal. Accuracy depends on the quality of the source image, the language 
              and font used, and the training data behind the recognition model. Clean, high-resolution scans 
              of standard fonts like Arial or Times New Roman usually achieve over 95% accuracy. Handwriting, 
              cursive, faded ink, and textured backgrounds are much harder to read.
            </p>

            <div className="alert alert-info mb-8">
              <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">Pro Tip</p>
                <p className="text-sm text-blue-800">
                  Scan at 300 DPI or higher in black-and-white mode whenever possible. Color and low-contrast 
                  scans introduce noise that confuses recognition algorithms.
                </p>
              </div>
            </div>

            <h2 className="section-title text-2xl mt-10 mb-4">Preparing Documents for OCR</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              You can dramatically improve results by preparing your images before running OCR. Straighten 
              crooked pages, crop out margins and borders, increase contrast, and remove stains or creases. 
              If the original document is a photograph rather than a scan, try to flatten glare and ensure 
              the text is evenly lit.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              When working with multi-column layouts, check whether the OCR tool supports column detection. 
              Reading text column by column preserves the logical reading order, which is essential for 
              long documents like newspapers and academic papers.
            </p>

            <h2 className="section-title text-2xl mt-10 mb-4">Common Use Cases</h2>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Digitizing paper archives and historical records</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Extracting data from invoices and receipts</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Making scanned PDFs searchable and editable</span>
              </li>
              <li className="flex items-start gap-3 text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Building accessible content from image-based sources</span>
              </li>
            </ul>

            <h2 className="section-title text-2xl mt-10 mb-4">OCR Limitations to Know</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              OCR is powerful but not perfect. It struggles with artistic fonts, watermarks, overlapping text, 
              and low-resolution images. If accuracy is critical, always proofread the output. For sensitive 
              documents, choose an OCR tool that processes files locally in the browser to protect your data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="stat">
                <div className="stat-value">95%+</div>
                <div className="stat-label">Accuracy on clean scans</div>
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

            <h2 className="section-title text-2xl mt-10 mb-4">The Future of OCR</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Modern OCR is moving beyond simple character matching. New systems use large language models 
              to understand context, correct errors based on sentence structure, and even summarize extracted 
              text. These advances make OCR increasingly reliable for business, legal, and educational workflows.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="card p-6 bg-indigo-50 border-indigo-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Try OCR on your images</h3>
              <p className="text-slate-600 mb-4">
                Extract editable text from images and scanned PDFs using our free, browser-based OCR tool. 
                Your files never leave your device.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/image-to-text" className="btn-primary">
                  <Type className="w-4 h-4" />
                  Image to Text
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link href="/pdf-to-text" className="btn-secondary">
                  <FileText className="w-4 h-4" />
                  PDF to Text
                </Link>
              </div>
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
