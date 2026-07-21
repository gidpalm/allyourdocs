import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service - AllYourDocs",
  description: "The terms and conditions for using AllYourDocs free online document tools and services.",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="card p-8 md:p-12">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Terms of Service</h1>
          <p className="text-slate-500 mb-8">Effective date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">1. Acceptance of Terms</h2>
              <p className="text-slate-600">
                By accessing and using AllYourDocs (&quot;the Service&quot;), you accept and agree to be bound by these Terms of
                Service. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">2. Description of Service</h2>
              <p className="text-slate-600">
                AllYourDocs provides free online document conversion and manipulation tools. All processing occurs in
                your web browser, and no files are uploaded to our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">3. Free Service</h2>
              <p className="text-slate-600">
                Our Service is provided free of charge, supported by advertising (including Google AdSense). There are
                no premium versions, subscriptions, or hidden costs to use the tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">4. User Responsibilities</h2>
              <p className="text-slate-600 mb-2">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Use the Service only for lawful purposes.</li>
                <li>Not upload or process illegal, infringing, or malicious content.</li>
                <li>Not attempt to disrupt or compromise the Service.</li>
                <li>Ensure you have the right to process any documents you use with our tools.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">5. No Warranty</h2>
              <p className="text-slate-600">
                The Service is provided &quot;as is&quot; without warranties, express or implied. We do not guarantee that the
                Service will be uninterrupted, error-free, or that results will meet your specific requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">6. Limitation of Liability</h2>
              <p className="text-slate-600">
                To the fullest extent permitted by law, AllYourDocs shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">7. Intellectual Property</h2>
              <p className="text-slate-600">
                All content, features, and functionality on AllYourDocs, including text, graphics, logos, and software,
                are the property of AllYourDocs and are protected by applicable intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">8. Third-Party Advertising</h2>
              <p className="text-slate-600">
                We use Google AdSense to display advertisements. Third-party vendors, including Google, may use cookies
                to serve ads based on your prior visits. Your use of the Service is also subject to Google&apos;s
                advertising policies. See our <Link href="/cookie-policy" className="text-indigo-600 underline">Cookie Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">9. Changes to Terms</h2>
              <p className="text-slate-600">
                We reserve the right to modify these Terms at any time. Material changes will be reflected by updating
                the effective date above. Continued use constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">10. Termination</h2>
              <p className="text-slate-600">
                We may terminate or suspend access immediately, without prior notice, for conduct that violates these
                Terms or harms other users or the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">11. Governing Law</h2>
              <p className="text-slate-600">
                These Terms are governed by the laws of the jurisdiction in which we operate, without regard to conflict
                of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">12. Contact</h2>
              <p className="text-slate-600">
                Questions about these Terms? Reach us through our{' '}
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

