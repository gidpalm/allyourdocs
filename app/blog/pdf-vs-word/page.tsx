import { Metadata } from "next"

export const metadata: Metadata = {
  title: "PDF vs Word: When to Use Which Format - AllYourDocs.com",
  description: "A comprehensive guide comparing PDF and DOC formats to help you choose the right format for your specific needs.",
}

export default function PDFvsWordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PDF vs Word: When to Use Which Format</h1>
          <p className="text-lg text-gray-600 mb-8">Understanding the strengths and limitations of PDF and Word documents for different use cases.</p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">PDF: The Standard for Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              PDF (Portable Document Format) was designed to present documents consistently across different devices and platforms. 
              Once a document is converted to PDF, its formatting is locked in place.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Use PDF when:</strong> you need to share documents that must look identical on every device, 
              submit legal or official documents, distribute read-only content, or preserve original formatting exactly.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Word: The Standard for Editing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Microsoft Word (DOC/DOCX) documents are editable and flexible. They allow collaboration, 
              tracking changes, and easy content modification.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Use Word when:</strong> you need collaborative editing, document revision tracking, 
              template creation, or content that will be frequently updated.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Side-by-Side Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Feature</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">PDF</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Word</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Editing</td>
                    <td className="border border-gray-200 px-4 py-3">Not editable (without tools)</td>
                    <td className="border border-gray-200 px-4 py-3">Fully editable</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">Formatting consistency</td>
                    <td className="border border-gray-200 px-4 py-3">Perfect on all devices</td>
                    <td className="border border-gray-200 px-4 py-3">May vary by application</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">File size</td>
                    <td className="border border-gray-200 px-4 py-3">Typically smaller</td>
                    <td className="border border-gray-200 px-4 py-3">Can be larger with formatting</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">Security</td>
                    <td className="border border-gray-200 px-4 py-3">Password protection, encryption</td>
                    <td className="border border-gray-200 px-4 py-3">Limited protection</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3">Best for</td>
                    <td className="border border-gray-200 px-4 py-3">Sharing, printing, archiving</td>
                    <td className="border border-gray-200 px-4 py-3">Drafting, collaboration</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Workflows</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Creating a Professional Report</h3>
                <p className="text-gray-600">Draft in Word → Review and edit → Convert to PDF for final distribution. This leverages Word&aposres flexibility and PDF&aposres consistency.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Receiving a Form to Fill</h3>
                <p className="text-gray-600">Fill the PDF form digitally → Save as PDF → Submit back. Keep it in PDF format for formatting preservation.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Collaborative Document Creation</h3>
                <p className="text-gray-600">Share Word file → Collect feedback via Track Changes → Finalize → Export to PDF for archival.</p>
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Need to Convert?</h3>
            <p className="text-gray-700 mb-4">Our tools handle both directions — convert Word to PDF and PDF to Word with formatting preservation.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/word-to-pdf" className="inline-block bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors">Word to PDF</a>
              <a href="/pdf-to-word" className="inline-block bg-white text-green-700 border border-green-300 px-5 py-2.5 rounded-lg font-medium hover:bg-green-50 transition-colors">PDF to Word</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
