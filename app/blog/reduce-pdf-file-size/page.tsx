import { Metadata } from "next"

export const metadata: Metadata = {
  title: "How to Reduce PDF File Size Without Losing Quality - AllYourDocs.com",
  description: "Learn professional techniques to compress PDF files while maintaining readability and image quality for different use cases.",
}

export default function ReducePDFFileSizePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How to Reduce PDF File Size Without Losing Quality</h1>
          <p className="text-lg text-gray-600 mb-8">A comprehensive guide to compressing PDFs effectively while preserving document integrity.</p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Compress PDFs?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Large PDF files can be difficult to email, upload, or share. Whether you&aposre sending a document to a client, 
              submitting an application, or storing files on a limited device, reducing file size without sacrificing quality 
              is an essential skill.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The good news is that modern compression techniques can reduce PDF sizes by 50-70% while keeping text sharp, 
              images clear, and formatting intact.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding PDF Compression Types</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Lossless Compression</h3>
                <p className="text-gray-600">Reduces file size without any quality loss. Best for text-heavy documents and forms. Typically achieves 10-30% reduction.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Lossy Compression</h3>
                <p className="text-gray-600">Reduces quality slightly for significantly smaller files. Ideal for image-heavy PDFs like scanned documents, photos, and presentations. Can achieve 40-70% reduction.</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step-by-Step Guide</h2>
            <div className="space-y-4">
              <div className="flex items-start bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 mr-4">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Analyze Your PDF</h4>
                  <p className="text-gray-600">Determine if your document is text-heavy (use lossless) or image-heavy (use lossy). Check the current file size and identify what content it contains.</p>
                </div>
              </div>
              <div className="flex items-start bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 mr-4">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Choose Compression Level</h4>
                  <p className="text-gray-600">Select a compression method based on your needs. For critical documents, use basic/light compression. For web uploads, use enhanced/medium. For email attachments, use aggressive compression.</p>
                </div>
              </div>
              <div className="flex items-start bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 mr-4">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Review Results</h4>
                  <p className="text-gray-600">Compare the compressed file against the original. Check that text remains readable, images are clear, and formatting is preserved.</p>
                </div>
              </div>
              <div className="flex items-start bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 mr-4">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Download and Distribute</h4>
                  <p className="text-gray-600">Your compressed PDF is ready to share via email, upload to cloud storage, or distribute to clients.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Always keep an uncompressed backup before compressing</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Use lossless compression for legal and professional documents</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Reduce image resolution before compressing for web use</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Remove unnecessary metadata and embedded fonts</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Batch process multiple PDFs for consistency</li>
            </ul>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Try It Now</h3>
            <p className="text-gray-700 mb-4">Our PDF compression tool gives you full control over compression levels with instant results. No registration required, completely private.</p>
            <a href="/compress-pdf" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">Compress Your PDF Now</a>
          </div>
        </div>
      </div>
    </div>
  )
}
