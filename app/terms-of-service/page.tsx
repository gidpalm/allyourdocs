export const metadata = {
  title: "Terms of Service - AllYourDocs.pro",
  description: "Terms and conditions for using AllYourDocs.pro services.",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Effective date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using AllYourDocs.pro ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700">
                AllYourDocs.pro provides free online document conversion and manipulation tools. All processing occurs in your web browser, and no files are uploaded to our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Free Service</h2>
              <p className="text-gray-700">
                Our Service is provided free of charge. We do not charge fees for any features or functionality. There are no premium versions, subscriptions, or hidden costs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use the Service only for lawful purposes</li>
                <li>Not upload or process illegal, copyrighted, or malicious content</li>
                <li>Not attempt to disrupt or compromise the Service</li>
                <li>Not use the Service for any commercial exploitation without permission</li>
                <li>Ensure you have the right to process any documents you use with our tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. No Warranty</h2>
              <p className="text-gray-700">
                The Service is provided "as is" without any warranties, express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
                <li>The Service will be uninterrupted or error-free</li>
                <li>The results will meet your specific requirements</li>
                <li>The Service will be available at all times</li>
                <li>Files will be processed without data loss</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700">
                To the fullest extent permitted by law, AllYourDocs.pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700">
                All content, features, and functionality on AllYourDocs.pro, including but not limited to text, graphics, logos, and software, are the property of AllYourDocs.pro and are protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by updating the effective date at the top of this page. Your continued use of the Service constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700">
                For any questions about these Terms of Service, please contact us through our Feedback page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
