import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Cookie Policy - AllYourDocs",
  description: "How AllYourDocs uses cookies and similar technologies, including advertising cookies used with Google AdSense.",
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="card p-8 md:p-12">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Cookie Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">1. What Are Cookies</h2>
              <p className="text-slate-600 leading-relaxed">
                Cookies are small text files stored on your device when you visit a website. They help the site
                remember your actions and preferences over time. AllYourDocs.com uses a minimal set of cookies
                necessary to operate the site and, with your consent, advertising cookies to support our free service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">2. Cookies We Use</h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong className="text-indigo-600">Essential cookies:</strong> Required for core functionality such as remembering your tool settings. These cannot be disabled.</li>
                <li><strong className="text-indigo-600">Advertising cookies:</strong> Set by Google AdSense to serve relevant ads and measure ad performance. These are loaded only after you interact with the site.</li>
                <li><strong className="text-indigo-600">Analytics cookies:</strong> Help us understand aggregate usage so we can improve the tools. These are anonymous and never tied to your documents.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">3. Third-Party Cookies</h2>
              <p className="text-slate-600 leading-relaxed">
                Google, through its AdSense program, may place cookies on your device to personalize and measure
                advertising. Google&apos;s use of advertising cookies is governed by the
                {' '}<a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google Ads Policy</a>.
                You can manage personalized advertising through your
                {' '}<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google Ads Settings</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">4. Managing Cookies</h2>
              <p className="text-slate-600 leading-relaxed">
                Most browsers let you control cookies through their settings. You can delete existing cookies or
                block them entirely. Note that disabling essential cookies may affect how some tools behave.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">5. Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this Cookie Policy from time to time. Material changes will be reflected by the
                &quot;Last updated&quot; date above.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">6. Contact</h2>
              <p className="text-slate-600 leading-relaxed">
                Questions about our use of cookies? Reach us through our{' '}
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

