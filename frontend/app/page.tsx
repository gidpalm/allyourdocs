"use client"

import { FileText, File, Image as ImageIcon, Scissors, Type, RefreshCw, Upload, Settings, Download, Minus, Shield, Lock, Globe, Users, Clock, Zap, CheckCircle, Award, BarChart, HelpCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import BlogPreview from "@/components/BlogPreview"

export default function Home() {
  const features = [
    { title: "Merge PDFs", description: "Combine multiple PDF files into a single document seamlessly. Perfect for consolidating reports, presentations, or multi-chapter documents into one organized file.", icon: FileText, path: "/merge-pdf", accent: "text-indigo-600 bg-indigo-50" },
    { title: "PDF to Word", description: "Convert PDF files to editable Word documents while preserving formatting, fonts, and layout. Ideal for editing locked PDF content.", icon: File, path: "/pdf-to-word", accent: "text-emerald-600 bg-emerald-50" },
    { title: "Word to PDF", description: "Convert Word documents to universally compatible PDF format. Maintains document integrity across all devices and platforms.", icon: FileText, path: "/word-to-pdf", accent: "text-sky-600 bg-sky-50" },
    { title: "Split PDF", description: "Extract specific pages or split large PDF files into smaller, manageable documents by custom page ranges.", icon: Scissors, path: "/split-pdf", accent: "text-rose-600 bg-rose-50" },
    { title: "Images to PDF", description: "Convert multiple images (JPG, PNG, WebP) into a single PDF document. Great for creating photo albums or scanned document collections.", icon: ImageIcon, path: "/image-to-pdf", accent: "text-violet-600 bg-violet-50" },
    { title: "Compress PDF", description: "Reduce PDF file size by up to 80% without noticeable quality loss. Essential for email attachments and web uploads.", icon: Minus, path: "/compress-pdf", accent: "text-amber-600 bg-amber-50" },
    { title: "Image to Text (OCR)", description: "Extract editable text from images using advanced Optical Character Recognition. Supports printed text in multiple languages.", icon: Type, path: "/image-to-text", accent: "text-teal-600 bg-teal-50" },
    { title: "PDF to Text", description: "Extract all text content from PDF documents for editing, analysis, or reuse in other applications.", icon: File, path: "/pdf-to-text", accent: "text-cyan-600 bg-cyan-50" },
    { title: "Rearrange PDF", description: "Reorder, rotate, or delete PDF pages with an intuitive drag-and-drop interface. Organize your documents exactly how you need them.", icon: RefreshCw, path: "/rearrange-pdf", accent: "text-fuchsia-600 bg-fuchsia-50" },
  ]

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

  const advantages = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "All processing happens locally in your browser using advanced WebAssembly technology. Your files never touch our servers, ensuring complete document confidentiality for sensitive business and personal files."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process documents in seconds using optimized algorithms running on your device's hardware. No upload delays, no server queues, no waiting for processing—instant results every time."
    },
    {
      icon: Globe,
      title: "No Limits",
      description: "No file size limits, no daily usage caps, no watermarks, and no premium tiers. Every feature is completely free and available to all users without restrictions."
    },
    {
      icon: Award,
      title: "Professional Quality",
      description: "Industry-leading conversion accuracy with 99%+ success rate. Our algorithms preserve formatting, fonts, images, and layout integrity that rivals expensive desktop software."
    }
  ]

  const useCases = [
    {
      title: "For Students",
      description: "Merge lecture notes, convert assignments between formats, extract text from textbook scans, compress thesis documents for submission, and organize research materials—all for free.",
      icon: Users
    },
    {
      title: "For Professionals",
      description: "Prepare client-ready documents, combine reports into single files, convert presentations for distribution, and process contracts without risking confidential information on third-party servers.",
      icon: BarChart
    },
    {
      title: "For Businesses",
      description: "Streamline document workflows, process invoices and receipts with OCR, prepare compliance documents, and maintain security standards by keeping all processing in-house on employee devices.",
      icon: Globe
    },
    {
      title: "For Everyone",
      description: "Whether you need to sign and merge a PDF, convert a photo to text, or simply compress a large file to send via email—our tools are designed to be intuitive enough for anyone to use.",
      icon: HelpCircle
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white border-b border-slate-200">
          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="badge badge-brand mb-6">
                <Shield className="w-3.5 h-3.5" />
                100% Private · Browser-Based
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Free Online Document{" "}
                <span className="text-indigo-600">Processing Tools</span>
              </h1>

              <div className="max-w-4xl mx-auto mb-8">
                <p className="text-lg md:text-xl text-slate-600 mb-6 leading-relaxed">
                  AllYourDocs provides a comprehensive suite of free document conversion and processing tools
                  designed for students, professionals, and businesses. Merge PDFs, convert between formats,
                  extract text with OCR, compress files, and more—all processed directly in your browser
                  for maximum privacy and speed.
                </p>

                <p className="text-base md:text-lg text-slate-500 leading-relaxed">
                  Unlike traditional online converters that upload your files to remote servers, our tools use
                  advanced client-side processing technology. This means your documents <strong className="text-slate-700">never leave your device</strong>,
                  ensuring complete confidentiality for sensitive business documents, personal files, and confidential materials.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mb-10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600 text-sm sm:text-base">No Registration Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600 text-sm sm:text-base">100% Browser-Based</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600 text-sm sm:text-base">No Watermarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-600 text-sm sm:text-base">Works Offline</span>
                </div>
              </div>

              <div className="w-32 h-1 bg-indigo-600 mx-auto mb-10 rounded-full"></div>

              {/* Privacy Security Box */}
              <div className="max-w-3xl mx-auto mb-12">
                <div className="card p-6 sm:p-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Lock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Privacy-First Document Processing</h2>
                  </div>

                  <div className="text-left space-y-4">
                    <p className="text-slate-600 leading-relaxed">
                      <strong className="text-slate-900">Local Processing Technology:</strong> AllYourDocs uses advanced client-side processing powered by
                      WebAssembly and modern JavaScript APIs. Your documents are processed directly in your browser—they are never uploaded
                      to any server, never transmitted over the internet, and we have no access to your files at any point during or after processing.
                    </p>

                    <p className="text-slate-600 leading-relaxed">
                      <strong className="text-slate-900">Zero Data Collection Policy:</strong> We believe privacy is a fundamental right, not a feature to be purchased.
                      Our platform operates under a strict no-data-collection policy: no tracking of your documents, no storage of file contents or metadata,
                      and no analytics on processing activity. When you close your browser tab, all temporary processing data is automatically deleted from memory.
                    </p>

                    <p className="text-slate-600 leading-relaxed">
                      <strong className="text-slate-900">Enterprise Security Standards:</strong> Our technology stack implements security best practices including
                      Content Security Policy headers, HTTPS encryption for all page loads, and regular security reviews. While we don&apos;t process data on servers,
                      our website infrastructure complies with modern web security standards and GDPR principles.
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">0</div>
                        <div className="text-slate-500 text-sm">Files Uploaded to Servers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">0</div>
                        <div className="text-slate-500 text-sm">Files Stored Anywhere</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">0</div>
                        <div className="text-slate-500 text-sm">Data Points Collected</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Professional Document Tools</h2>
            <p className="section-subtitle">
              Each tool below has been developed and tested by our team to deliver reliable, high-quality results.
              Click on any tool to access detailed instructions, tips for best results, and troubleshooting guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.path}
                className="card p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group flex flex-col"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${feature.accent} flex-shrink-0`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">{feature.description}</p>
                    <div className="flex items-center text-indigo-600 font-medium text-sm">
                      Use This Tool
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Key Advantages Section */}
          <div className="card p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Why Choose AllYourDocs?</h2>
            <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
              We built this platform to solve the common problems with online document tools: slow processing, privacy concerns,
              hidden fees, and poor output quality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advantages.map((advantage, index) => (
                <div key={index} className="text-center">
                  <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                    <advantage.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{advantage.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{advantage.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Who Uses Our Document Tools?</h2>
            <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto">
              Our tools serve a diverse community of users who need reliable document processing without compromising on privacy or quality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <div key={index} className="card p-6 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-100">
                      <useCase.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{useCase.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="card p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">How Our Document Processing Works</h2>
            <p className="text-xl text-center text-slate-600 mb-12 max-w-3xl mx-auto">
              A transparent look at how your documents are processed entirely within your browser
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">1. Select Your File</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Choose any document from your device using the file picker. Our system supports PDF, DOC, DOCX, JPG, PNG,
                  WebP, and other common formats. Files are loaded directly into your browser&apos;s memory—no upload occurs.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <Settings className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">2. Local Processing</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Advanced algorithms process your file entirely within your browser using WebAssembly and JavaScript.
                  This happens on your device&apos;s CPU/GPU, meaning no internet connection is required after the initial page load.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <Download className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">3. Download Results</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your processed file is generated locally and offered for download. All temporary data in browser memory
                  is automatically cleared when you navigate away or close the tab—no traces remain on any server.
                </p>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">Technical Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-3">Processing Technology</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start text-slate-600 text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>WebAssembly (WASM) for high-performance document parsing and conversion</span>
                    </li>
                    <li className="flex items-start text-slate-600 text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>JavaScript for user interface interactions and file handling via File API</span>
                    </li>
                    <li className="flex items-start text-slate-600 text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Canvas API and Web Workers for parallel processing of large documents</span>
                    </li>
                    <li className="flex items-start text-slate-600 text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Tesseract.js for client-side OCR text extraction from images</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-3">Security & Privacy Features</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start text-slate-600 text-sm">
                      <Shield className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Zero data transmission—files never leave the browser environment</span>
                    </li>
                    <li className="flex items-start text-slate-600 text-sm">
                      <Shield className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Automatic JavaScript garbage collection clears processing memory</span>
                    </li>
                    <li className="flex items-start text-slate-600 text-sm">
                      <Shield className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>TLS/HTTPS encryption secures the website and tool delivery</span>
                    </li>
                    <li className="flex items-start text-slate-600 text-sm">
                      <Shield className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Content Security Policy headers prevent unauthorized code execution</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Blog / Educational Content Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="section-title mb-4">Document Processing Guides & Tutorials</h2>
              <p className="section-subtitle">
                Our blog features in-depth guides, tutorials, and technical explanations to help you get the most
                from our tools and understand document processing technology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <BlogPreview key={index} post={post} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/blog"
                className="btn-primary"
              >
                View All Articles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="card p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Is AllYourDocs really free to use?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Yes, all tools on AllYourDocs are completely free with no hidden costs, no premium tiers, and no usage limits.
                  We sustain the platform through non-intrusive advertising. There are no file size restrictions, daily caps, or features
                  locked behind paywalls—every tool is fully available to every visitor.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Are my documents safe? Do you store my files?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your documents are completely safe because they never leave your device. All processing occurs locally in your web browser
                  using client-side technology. We do not have servers that receive, process, or store your files. When you close the browser tab,
                  all temporary data is automatically cleared from your device&apos;s memory. We have zero access to your documents at any time.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">What file formats are supported?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our tools support a wide range of formats including PDF, DOC, DOCX, JPG, JPEG, PNG, WebP, BMP, GIF, and TXT.
                  Input and output formats vary by tool—each tool page lists the specific formats it supports. We continuously work to
                  add support for additional formats based on user needs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Do I need to create an account to use the tools?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  No account or registration is required. Simply visit any tool page and start using it immediately. We don&apos;t collect
                  email addresses, names, or any personal information. This approach aligns with our privacy-first philosophy and ensures
                  you can process documents without any barriers or data exchange.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Can I use these tools on my phone or tablet?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Yes, AllYourDocs is fully responsive and works on smartphones, tablets, laptops, and desktops.
                  The tools are optimized for both touch and mouse interactions. Processing performance depends on your device&apos;s
                  capabilities, but modern mobile devices handle document processing without issues for typical file sizes.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">What happens if I accidentally close the browser during processing?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Since processing happens in your browser&apos;s memory, closing the tab will stop the process and clear all temporary data.
                  You would need to restart the conversion. We recommend keeping the tab open until your download completes.
                  For very large files, most browsers also warn you before closing tabs with active processes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <FileText className="w-7 h-7 text-indigo-600" />
                <span className="text-lg font-bold text-slate-900">AllYourDocs</span>
              </Link>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 max-w-md">
                AllYourDocs is a free online platform providing secure, browser-based document processing tools.
                Founded with the mission of making document conversion accessible while respecting user privacy,
                our tools process everything locally on your device—no uploads, no storage, no data collection.
              </p>
              <p className="text-indigo-600 text-sm font-medium">
                Built with privacy as a core principle, not an afterthought.
              </p>
            </div>

            <div>
              <h3 className="text-slate-900 font-semibold mb-4">Tools</h3>
              <ul className="space-y-2">
                <li><Link href="/merge-pdf" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Merge PDFs</Link></li>
                <li><Link href="/pdf-to-word" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">PDF to Word</Link></li>
                <li><Link href="/word-to-pdf" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Word to PDF</Link></li>
                <li><Link href="/split-pdf" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Split PDF</Link></li>
                <li><Link href="/image-to-pdf" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Images to PDF</Link></li>
                <li><Link href="/compress-pdf" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Compress PDF</Link></li>
                <li><Link href="/tools" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">View All Tools →</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-900 font-semibold mb-4">Information</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Contact Us</Link></li>
                <li><Link href="/blog" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Blog & Guides</Link></li>
                <li><Link href="/privacy-policy" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookie-policy" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">Cookie Policy</Link></li>
                <li><Link href="/dmca" className="text-slate-600 hover:text-indigo-600 text-sm transition-colors">DMCA / Copyright</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-sm">
                © {new Date().getFullYear()} AllYourDocs. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/privacy-policy" className="text-slate-600 hover:text-indigo-600 transition-colors">Privacy</Link>
                <span className="text-slate-300">|</span>
                <Link href="/terms-of-service" className="text-slate-600 hover:text-indigo-600 transition-colors">Terms</Link>
                <span className="text-slate-300">|</span>
                <Link href="/contact" className="text-slate-600 hover:text-indigo-600 transition-colors">Contact</Link>
                <span className="text-slate-300">|</span>
                <Link href="/sitemap.xml" className="text-slate-600 hover:text-indigo-600 transition-colors">Sitemap</Link>
              </div>
            </div>
            <p className="text-center text-slate-400 text-xs mt-4">
              This site may display advertisements. By using this site, you agree to our Terms of Service and Privacy Policy.
              AllYourDocs is not affiliated with Adobe, Microsoft, or any other document software company.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
