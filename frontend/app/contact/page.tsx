import Link from "next/link"
import { Mail, MessageSquare, Github, HelpCircle, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Contact Us - AllYourDocs Support & Feedback",
  description: "Get in touch with the AllYourDocs team. Report issues, request features, or ask questions about our free document tools.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="icon-tile w-16 h-16 rounded-2xl mx-auto mb-6">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We love hearing from our users. Whether you found a bug, have a feature idea,
            or just want to say hello, there are several ways to reach the AllYourDocs team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card p-8">
            <div className="flex items-center mb-4">
              <div className="icon-tile-muted w-12 h-12 mr-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Feedback Form</h2>
            </div>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              The fastest way to report a problem or share a suggestion is our feedback form.
              It sends a direct message to our team.
            </p>
            <Link href="/feedback" className="btn-primary w-full">
              Open Feedback Form
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="card p-8">
            <div className="flex items-center mb-4">
              <div className="icon-tile-muted w-12 h-12 mr-4">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Email</h2>
            </div>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Prefer email? Send us a message and we will respond as soon as possible.
            </p>
            <a href="mailto:palmergideon@gmail.com" className="btn-secondary w-full">
              palmergideon@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="link-brand font-medium">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
