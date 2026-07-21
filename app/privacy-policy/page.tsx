export const metadata = {
  title: "Privacy Policy - AllYourDocs",
  description: "Privacy policy for AllYourDocs - Your privacy is important to us.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to AllYourDocs. We are committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Do NOT Collect</h2>
              <p className="text-gray-700 mb-4">
                We want to be perfectly clear about what we do NOT collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We do NOT collect or store your personal documents</li>
                <li>We do NOT require registration or account creation</li>
                <li>We do NOT store your name, email, or contact information</li>
                <li>We do NOT use cookies to track your browsing behavior</li>
                <li>We do NOT share or sell any user data to third parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How Our Tools Work</h2>
              <p className="text-gray-700">
                All document processing occurs directly in your web browser. Your files are never uploaded to our servers. This means:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
                <li>Your documents remain on your computer at all times</li>
                <li>Processing happens locally in your browser</li>
                <li>No data is transmitted over the internet</li>
                <li>Your documents are completely private</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Analytics</h2>
              <p className="text-gray-700">
                We use basic, anonymous analytics to understand how many people visit our site and which tools are most popular. This information is:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
                <li>Completely anonymous (no personal identifiers)</li>
                <li>Used only to improve our services</li>
                <li>Not shared with any third parties</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-700">
                We do not integrate with any third-party services that collect user data. Our website is self-contained and does not use external trackers, analytics services, or advertising networks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are suitable for users of all ages. Since we do not collect any personal information, we are fully compliant with children's privacy regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us through our Feedback page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
