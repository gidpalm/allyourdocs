import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Understanding OCR Technology: Extracting Text from Images - AllYourDocs.com",
  description: "Discover how Optical Character Recognition works and best practices for getting accurate text extraction results.",
}

export default function OCRTechnologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Understanding OCR Technology: How It Extracts Text from Images</h1>
          <p className="text-lg text-gray-600 mb-8">Discover how Optical Character Recognition works and best practices for getting accurate results.</p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is OCR?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              OCR (Optical Character Recognition) is a technology that converts different types of documents — 
              such as scanned paper documents, PDF files, or digital photographs — into editable and searchable data.
            </p>
            <p className="text-gray-700 leading-relaxed">
              First developed in the early 1900s and refined through machine learning advances, modern OCR can recognize 
              text in over 100 languages with accuracy rates exceeding 99% under optimal conditions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How OCR Works</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">1. Image Preprocessing</h3>
                <p className="text-gray-600">The image is cleaned up — deskewed, denoised, and binarized (converted to black and white) to improve recognition accuracy. This step is crucial for scanned documents.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">2. Text Detection</h3>
                <p className="text-gray-600">The system identifies regions of the image that contain text, separating them from images, graphics, and whitespace. Advanced algorithms detect text lines and individual characters.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">3. Character Recognition</h3>
                <p className="text-gray-600">Each character is analyzed using pattern matching, feature extraction, and neural networks. The system compares detected patterns against known character sets across multiple languages.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">4. Post-Processing</h3>
                <p className="text-gray-600">Recognized text is spell-checked, formatting is applied, and confidence scores are assigned to each character. Context-aware correction improves overall accuracy.</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accuracy Factors</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Several factors affect OCR accuracy:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Image Quality</h4>
                <p className="text-sm text-gray-600">High-resolution, well-lit images with clear contrast produce the best results (300+ DPI recommended)</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Font Type</h4>
                <p className="text-sm text-gray-600">Standard fonts are recognized more accurately than handwritten or decorative fonts</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Document Condition</h4>
                <p className="text-sm text-gray-600">Clean, undamaged documents yield better results than faded, stained, or wrinkled originals</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Language</h4>
                <p className="text-sm text-gray-600">Common languages (English, Spanish, etc.) have higher accuracy than rare or complex scripts</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Digitizing archived documents and historical records</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Extracting data from invoices, receipts, and forms</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Making scanned documents searchable</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Converting business cards to contact information</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Translating foreign language documents</li>
              <li className="flex items-start"><span className="text-green-500 mr-2 mt-1">✓</span>Accessibility tools for visually impaired users</li>
            </ul>
          </section>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Extract Text from Images Now</h3>
            <p className="text-gray-700 mb-4">Our Image to Text tool uses Tesseract.js OCR engine, running entirely in your browser for maximum privacy.</p>
            <a href="/image-to-text" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Try OCR Extraction</a>
          </div>
        </div>
      </div>
    </div>
  )
}
