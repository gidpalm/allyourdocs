import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Privacy Policy - AllYourDocs",
  description: "How AllYourDocs protects your privacy, processes documents locally, and uses advertising cookies with Google AdSense.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="card p-8 md:p-12">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">1. Introduction</h2>
              <p className="text-slate-600 leading-relaxed">
                Welcome to AllYourDocs. We are committed to protecting your privacy. This Privacy Policy explains
                how our website works, what data we collect through standard web technologies, and how we keep your
                documents private.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">2. How Our Tools Work</h2>
              <p className="text-slate-600">
                All document processing occurs directly in your web browser. Your files are never uploaded to our
                servers. This means:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600">
                <li>Your documents remain on your computer at all times.</li>
                <li>Processing happens locally in your browser using client-side technology.</li>
                <li>No document data is transmitted over the internet.</li>
                <li>When you close the tab, temporary processing data is cleared from memory.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">3. Information We Do NOT Collect</h2>
              <p className="text-slate-600 mb-2">Because all file processing is local, we do NOT:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Collect or store your personal documents.</li>
                <li>Require registration or account creation to use tools.</li>
                <li>Store your name, email, or contact information through the tools themselves.</li>
                <li>Access the contents of any file you process.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">4. Advertising & Cookies</h2>
              <p className="text-slate-600 leading-relaxed">
                To keep AllYourDocs free, we display advertisements provided by Google AdSense. Google may use
                cookies to serve ads based on your prior visits to this or other websites. This is standard ad
                network behavior and is not related to the documents you process. You can opt out of personalized
                advertising by visiting{' '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google Ads Settings</a>.
                For full details, see our <Link href="/cookie-policy" className="text-indigo-600 underline">Cookie Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">5. Analytics</h2>
              <p className="text-slate-600">
                We use basic, anonymous analytics to understand aggregate traffic and which tools are most popular.
                This information:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600">
                <li>Is anonymous and contains no personal identifiers.</li>
                <li>Is used only to improve our services.</li>
                <li>Is never linked to the contents of files you process.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">6. Feedback Submissions</h2>
              <p className="text-slate-600 leading-relaxed">
                If you use our feedback form and choose to provide an email, we use it only to respond to you. We do
                not sell or share it with third parties. See our <Link href="/terms-of-service" className="text-indigo-600 underline">Terms of Service</Link> for more.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">7. Children&apos;s Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Our services are suitable for users of all ages. Since we do not collect document contents or
                require accounts, we minimize the collection of personal information from any user, including
                children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">8. Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
                updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-indigo-600 mb-3">9. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                Questions about this policy? Reach us through our{' '}
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

