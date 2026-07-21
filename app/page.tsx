import { FileText, File, Image, Scissors, Type, RefreshCw, Upload, Settings, Download, Minus, Shield, Lock, Globe, Users, Clock, Zap, CheckCircle, Award, BarChart, HelpCircle } from "lucide-react"
import Link from "next/link"
import BlogPreview from "@/components/BlogPreview"

export default function Home() {
  const features = [
    { title: "Merge PDFs", description: "Combine multiple PDF files into a single document", icon: FileText, path: "/merge-pdf", color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600" },
    { title: "PDF to Word", description: "Convert PDF files to editable Word documents", icon: File, path: "/pdf-to-word", color: "bg-green-50 border-green-100", iconColor: "text-green-600" },
    { title: "Word to PDF", description: "Convert Word documents to PDF format", icon: FileText, path: "/word-to-pdf", color: "bg-purple-50 border-purple-100", iconColor: "text-purple-600" },
    { title: "Split PDF", description: "Split PDF files by page ranges", icon: Scissors, path: "/split-pdf", color: "bg-yellow-50 border-yellow-100", iconColor: "text-yellow-600" },
    { title: "Images to PDF", description: "Convert multiple images to a PDF document", icon: Image, path: "/image-to-pdf", color: "bg-pink-50 border-pink-100", iconColor: "text-pink-600" },
    { title: "Compress PDF", description: "Reduce PDF file size without losing quality", icon: Minus, path: "/compress-pdf", color: "bg-red-50 border-red-100", iconColor: "text-red-600" },
    { title: "Image to Text (OCR)", description: "Extract text from images using OCR technology", icon: Type, path: "/image-to-text", color: "bg-indigo-50 border-indigo-100", iconColor: "text-indigo-600" },
    { title: "PDF to Text", description: "Extract text content from PDF documents", icon: File, path: "/pdf-to-text", color: "bg-teal-50 border-teal-100", iconColor: "text-teal-600" },
    { title: "Rearrange PDF", description: "Reorder PDF pages as needed", icon: RefreshCw, path: "/rearrange-pdf", color: "bg-orange-50 border-orange-100", iconColor: "text-orange-600" },
  ]

  const blogPosts = [
    {
      title: "How to Reduce PDF File Size Without Losing Quality",
      excerpt: "Learn professional techniques to compress PDF files while maintaining readability and image quality for different use cases.",
      category: "Tutorial",
      readTime: "5 min read",
      date: "Nov 15, 2024",
      slug: "/blog/reduce-pdf-file-size"
    },
    {
      title: "PDF vs. Word: When to Use Which Format",
      excerpt: "A comprehensive guide comparing PDF and DOC formats to help you choose the right format for your specific needs.",
      category: "Guide",
      readTime: "7 min read",
      date: "Nov 10, 2024",
      slug: "/blog/pdf-vs-word-guide"
    },
    {
      title: "Understanding OCR Technology: How It Extracts Text from Images",
      excerpt: "Discover how Optical Character Recognition works and best practices for getting accurate text extraction results.",
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
      description: "All processing happens locally in your browser using advanced WebAssembly technology. Your files never touch our servers."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process documents in seconds using optimized algorithms. No upload delays or server processing time."
    },
    {
      icon: Globe,
      title: "No Limits",
      description: "No file size limits, no daily usage caps, no watermarks. Process as many documents as you need."
    },
    {
      icon: Award,
      title: "Professional Quality",
      description: "Industry-leading conversion accuracy with 99%+ success rate. Preserves formatting, fonts, and layout."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Substantial Content */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600">Document Processing</span> Solution
            </h1>
            
            <div className="max-w-4xl mx-auto mb-10">
              <p className="text-xl text-gray-700 mb-6">
                Welcome to <strong>AllYourDocs Pro</strong>, your trusted partner for all document conversion and processing needs. 
                As professional document specialists with over 10 years of experience, we've built this comprehensive suite of tools 
                to solve real-world document challenges for students, professionals, and businesses worldwide.
              </p>
              
              <p className="text-lg text-gray-600">
                Unlike other online converters, we prioritize your <strong>privacy, quality, and user experience</strong>. 
                Every tool has been meticulously designed and tested to deliver professional-grade results without compromising 
                your data security.
              </p>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">No Registration Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">100% Browser-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">No Watermarks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Works Offline</span>
              </div>
            </div>
            
            {/* Red Horizontal Line */}
            <div className="w-32 h-1 bg-red-500 mx-auto mb-10 rounded-full"></div>
            
            {/* Enhanced Privacy Section */}
            <div className="max-w-3xl mx-auto mb-16">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Privacy-First Document Processing</h3>
                </div>
                
                <div className="text-left space-y-4">
                  <p className="text-gray-700">
                    <strong>Local Processing Technology:</strong> AllYourDocs Pro uses advanced client-side processing powered by 
                    WebAssembly and JavaScript. Your documents are processed directly in your browser - they never leave your computer, 
                    are never uploaded to any server, and we have no access to your files at any point.
                  </p>
                  
                  <p className="text-gray-700">
                    <strong>Data Protection:</strong> We believe privacy is a fundamental right. That's why we've designed our 
                    platform with a strict <strong>"no data collection" policy</strong>. No tracking, no analytics on your documents, 
                    no storage of any kind. Once you close the browser tab, all temporary data is automatically deleted.
                  </p>
                  
                  <p className="text-gray-700">
                    <strong>Professional-Grade Security:</strong> Our technology stack includes enterprise-level security protocols 
                    and regular security audits. We comply with GDPR standards and respect user privacy across all jurisdictions.
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap justify-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">0</div>
                      <div className="text-gray-600">Files Uploaded</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">0</div>
                      <div className="text-gray-600">Files Stored</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">0</div>
                      <div className="text-gray-600">Servers Involved</div>
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Document Tools</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive suite of tools designed by document processing experts. Each tool includes detailed guides, 
            best practices, and troubleshooting tips to ensure perfect results every time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Link 
              key={index} 
              href={feature.path}
              className={`block p-6 rounded-2xl border-2 ${feature.color} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${feature.color.replace("bg-", "bg-").replace(" border-", " bg-")}`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className={`flex items-center ${feature.iconColor} font-medium`}>
                    Try Now
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Key Advantages Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose AllYourDocs Pro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <advantage.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{advantage.title}</h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">How Our Document Processing Works</h2>
          <p className="text-xl text-center text-gray-300 mb-12 max-w-3xl mx-auto">
            A transparent look at our client-side processing technology and workflow
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Select Your File</h3>
              <p className="text-gray-300">
                Choose any document from your device. Our system supports PDF, DOC, DOCX, JPG, PNG, and more. 
                Files are loaded directly into your browser memory.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Local Processing</h3>
              <p className="text-gray-300">
                Advanced algorithms process your file entirely in your browser using WebAssembly. 
                No internet connection needed after loading the page.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Download Results</h3>
              <p className="text-gray-300">
                Get your processed file instantly. All temporary data is cleared automatically 
                when you leave the page. No traces left behind.
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-800/50 rounded-2xl p-8 mt-8">
            <h3 className="text-2xl font-bold text-center mb-6">Technical Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-semibold mb-3">Front-End Processing</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <span>WebAssembly for high-performance processing</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <span>JavaScript for user interface and controls</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <span>IndexedDB for temporary file handling</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-3">Security Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-400 mr-2" />
                    <span>Zero data transmission to servers</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-400 mr-2" />
                    <span>Automatic memory cleanup</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-400 mr-2" />
                    <span>HTTPS encryption for page delivery</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note - Important for AdSense */}
      <div className="bg-gray-50 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            <strong>About AllYourDocs Pro:</strong> We are a team of document processing experts dedicated to providing 
            secure, high-quality tools for all your document needs. Our platform is designed with privacy as the core principle, 
            ensuring your documents never leave your device. All tools work directly in your browser using advanced 
            client-side processing technology.
          </p>
        </div>
      </div>
    </div>
  )
}