import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export const metadata = {
  title: "DMCA & Copyright Policy - AllYourDocs",
  description: "How to report copyrighted material and file a DMCA takedown request with AllYourDocs.",
}

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="card p-8 md:p-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 border border-indigo-100">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-indigo-600">DMCA / Copyright Policy</h1>
          </div>
          <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">1. Our Position on Copyright</h2>
              <p className="text-slate-600 leading-relaxed">
                AllYourDocs.com respects the intellectual property rights of others. AllYourDocs is a set of
                locally-run document utilities — we do not host, store, or distribute user files. Because every
                file is processed in your own browser, we are not a repository of copyrighted material.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">2. Filing a DMCA Takedown</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                If you believe content on our website (such as text on our guides or blog) infringes your copyright,
                you may send a written notice that includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>A physical or electronic signature of the copyright owner or authorized agent.</li>
                <li>Identification of the copyrighted work you claim has been infringed.</li>
                <li>The URL or specific location of the material you want removed.</li>
                <li>Your contact information (address, phone, and email).</li>
                <li>A statement that you have a good-faith belief the use is not authorized.</li>
                <li>A statement, under penalty of perjury, that the information is accurate.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">3. How to Submit</h2>
              <p className="text-slate-600 leading-relaxed">
                Send your notice to{' '}
                <a href="mailto:palmergideon@gmail.com" className="text-indigo-600 underline">palmergideon@gmail.com</a>{' '}
                with the subject line &quot;DMCA Notice.&quot; We will review and respond as required by the
                Digital Millennium Copyright Act.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">4. Counter-Notification</h2>
              <p className="text-slate-600 leading-relaxed">
                If you believe material was removed in error, you may file a counter-notification with the same
                contact information. We will process valid counter-notices according to the DMCA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">5. Repeat Infringers</h2>
              <p className="text-slate-600 leading-relaxed">
                In accordance with the DMCA, we may terminate access for users who are repeat infringers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">6. Contact</h2>
              <p className="text-slate-600 leading-relaxed">
                For copyright questions, contact us through our{' '}
                <Link href="/contact" className="text-indigo-600 underline">Contact page</Link>.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-slate-500 font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

