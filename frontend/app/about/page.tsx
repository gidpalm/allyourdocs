import Link from "next/link"
import { CheckCircle, Users, Shield, Zap, Globe, ArrowRight } from "lucide-react"

export const metadata = {
  title: "About Us - AllYourDocs",
  description: "Learn about AllYourDocs - a free, privacy-first platform for online PDF and document tools.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <section className="text-center mb-12">
          <span className="badge badge-brand mb-4">Our Mission</span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            About <span className="text-indigo-600">AllYourDocs</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We&apos;re on a mission to make document conversion simple, free, and private for everyone.
          </p>
        </section>

        <section className="mb-12">
          <div className="card p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="icon-tile-muted w-12 h-12 mr-4">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Our Story</h2>
            </div>
            <div className="space-y-5 text-slate-600 text-lg leading-relaxed">
              <p>
                AllYourDocs was born out of frustration with expensive, complicated document tools. We noticed people
                paying monthly subscriptions just to perform simple tasks like converting PDFs or merging documents.
              </p>
              <p>
                We set out to create a better solution: powerful, easy-to-use document tools that are completely
                free, with no hidden costs or registration. Most importantly, every tool runs entirely in your
                browser, so your files never leave your device.
              </p>
              <p>
                Today we serve many users every month, helping students, professionals, and businesses manage
                their documents efficiently without compromising on privacy.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-8">
              <div className="icon-tile-muted w-14 h-14 mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Free Forever</h3>
              <p className="text-slate-600">
                Essential document tools should be accessible to everyone. No paywalls, no premium tiers.
              </p>
            </div>

            <div className="card p-8">
              <div className="icon-tile-muted w-14 h-14 mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy First</h3>
              <p className="text-slate-600">
                Your documents are processed in your browser. We never store, share, or access your files.
              </p>
            </div>

            <div className="card p-8">
              <div className="icon-tile-muted w-14 h-14 mb-6">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Accessible</h3>
              <p className="text-slate-600">
                Simple, intuitive tools anyone can use, regardless of technical expertise or device.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">Why Choose Us?</h2>
            <div className="space-y-4">
              {[
                "No registration required — use our tools instantly.",
                "100% free — no hidden costs or subscriptions.",
                "Browser-based processing — your files never leave your computer.",
                "No watermarks on output files.",
                "Support for all major document formats.",
                "Fast processing with generous file size limits.",
                "Mobile-friendly, responsive interface.",
                "Regular updates with new features and tools.",
              ].map((feature, index) => (
                <div key={index} className="flex items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mr-4 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="text-center card p-8 md:p-12 bg-indigo-600 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Document Workflow?</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust AllYourDocs for their document needs.
            </p>
            <Link
              href="/tools"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              Explore Our Tools
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
