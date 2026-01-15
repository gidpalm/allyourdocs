import { FileText, File, Image, Scissors, Type, RefreshCw, Upload, Settings, Download, Minus, Maximize2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const features = [
    { title: "Merge PDFs", description: "Combine multiple PDF files into a single document", icon: FileText, path: "/merge-pdf", color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600" },
    { title: "PDF to Word", description: "Convert PDF files to editable Word documents", icon: File, path: "/pdf-to-word", color: "bg-green-50 border-green-100", iconColor: "text-green-600" },
    { title: "Word to PDF", description: "Convert Word documents to PDF format", icon: FileText, path: "/word-to-pdf", color: "bg-purple-50 border-purple-100", iconColor: "text-purple-600" },
    { title: "Split PDF", description: "Split PDF files by page ranges", icon: Scissors, path: "/split-pdf", color: "bg-yellow-50 border-yellow-100", iconColor: "text-yellow-600" },
    { title: "Images to PDF", description: "Convert multiple images to a PDF document", icon: Image, path: "/image-to-pdf", color: "bg-pink-50 border-pink-100", iconColor: "text-pink-600" },
    { title: "Compress PDF", description: "Reduce PDF file size without losing quality", icon: Minus, path: "/compress-pdf", color: "bg-red-50 border-red-100", iconColor: "text-red-600" },
    { title: "Image to Text (OCR)", description: "Extract text from images using OCR", icon: Type, path: "/image-to-text", color: "bg-indigo-50 border-indigo-100", iconColor: "text-indigo-600" },
    { title: "PDF to Text", description: "Extract text from PDF documents", icon: File, path: "/pdf-to-text", color: "bg-teal-50 border-teal-100", iconColor: "text-teal-600" },
    { title: "Rearrange PDF", description: "Reorder PDF pages as needed", icon: RefreshCw, path: "/rearrange-pdf", color: "bg-orange-50 border-orange-100", iconColor: "text-orange-600" },
  ]

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AllYourDocs <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Pro</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Your all-in-one document processing solution. Convert, merge, split, and optimize your documents with ease. No sign up, No account required.
            </p>
            
            {/* Red Horizontal Line */}
            <div className="w-24 h-1 bg-red-500 mx-auto mb-8 rounded-full"></div>
            
            {/* Privacy Paragraph */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">100% Private Processing</h3>
              </div>
              <p className="text-lg text-gray-700">
                <strong>Your files never leave your computer.</strong> All processing happens directly in your browser. 
                We never upload, store, or access your documents. Your privacy is guaranteed by design.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12 mb-12">
              <div className="text-center"><div className="text-4xl font-bold text-blue-600">9+</div><div className="text-gray-600">Tools</div></div>
              <div className="text-center"><div className="text-4xl font-bold text-green-600">100%</div><div className="text-gray-600">Secure</div></div>
              <div className="text-center"><div className="text-4xl font-bold text-red-600">Free</div><div className="text-gray-600">To Use</div></div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">All Document Tools in One Place</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Everything you need for document processing, completely free and easy to use</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link key={index} href={feature.path} className={`block p-6 rounded-2xl border-2 ${feature.color} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}>
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${feature.color.replace("bg-", "bg-").replace(" border-", " bg-")}`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className={`flex items-center ${feature.iconColor} font-medium`}>
                    Try it now
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Your File</h3>
              <p className="text-gray-300">Select your document from your computer or drag and drop it</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Process Instantly</h3>
              <p className="text-gray-300">Our system processes your file securely in the your browser</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Download Result</h3>
              <p className="text-gray-300">Download your processed file immediately, no waiting</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Process Your Documents?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of users who trust AllYourDocs for their document needs</p>
        </div>
      </div>
    </div>
  )
}
