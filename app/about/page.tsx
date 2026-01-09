import Link from "next/link"
import { CheckCircle, Users, Shield, Zap, Globe } from "lucide-react"

export const metadata = {
  title: "About Us - AllYourDocs.pro",
  description: "Learn about AllYourDocs.pro - Free online PDF tools for everyone.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-600">AllYourDocs.pro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            We're on a mission to make document conversion and management simple, free, and accessible to everyone.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            </div>
            <div className="space-y-6 text-gray-700 text-lg">
              <p>
                AllYourDocs.pro was born out of frustration with expensive, complicated document tools. We noticed that people were paying monthly subscriptions just to perform simple tasks like converting PDFs or merging documents.
              </p>
              <p>
                In 2023, we set out to create a better solution - a collection of powerful, easy-to-use document tools that would be completely free, with no hidden costs or registration requirements.
              </p>
              <p>
                Today, we serve thousands of users every month, helping students, professionals, and businesses manage their documents efficiently without breaking the bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Free Forever</h3>
              <p className="text-gray-600">
                We believe essential document tools should be accessible to everyone. Our tools will always remain free, with no paywalls or premium features.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Privacy First</h3>
              <p className="text-gray-600">
                Your documents are processed securely in your browser. We never store, share, or access your files. Your privacy is our top priority.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accessibility</h3>
              <p className="text-gray-600">
                We design our tools to be simple and intuitive, ensuring everyone can use them regardless of technical expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us?</h2>
          <div className="space-y-6">
            {[
              "No registration required - use our tools instantly",
              "100% free - no hidden costs or subscriptions",
              "Browser-based processing - your files never leave your computer",
              "No watermarks on output files",
              "Support for all major document formats",
              "Fast processing with no file size limits",
              "Mobile-friendly interface",
              "Regular updates with new features"
            ].map((feature, index) => (
              <div key={index} className="flex items-center bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                <span className="text-gray-800">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Simplify Your Document Workflow?</h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of satisfied users who trust AllYourDocs.pro for their document needs.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Explore Our Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
