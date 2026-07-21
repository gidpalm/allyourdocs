import { FileText, Github, Twitter, Mail } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">
                AllYourDocs
              </span>
            </div>
            <p className="text-gray-400">
              Your trusted document processing platform. Secure, fast, and free to use.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Tools</h3>
            <ul className="space-y-3">
              <li><Link href="/merge-pdf" className="text-gray-400 hover:text-white">Merge PDF</Link></li>
              <li><Link href="/pdf-to-word" className="text-gray-400 hover:text-white">PDF to Word</Link></li>
              <li><Link href="/word-to-pdf" className="text-gray-400 hover:text-white">Word to PDF</Link></li>
              <li><Link href="/split-pdf" className="text-gray-400 hover:text-white">Split PDF</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-4">
              {/* Update these links from "#" to actual routes */}
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-400 hover:text-white">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Optional: Add Contact/Social Links Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="https://github.com/gidpalm" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-white">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:palmergideon@gmail.com" 
                 className="text-gray-400 hover:text-white">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Have questions? Contact us at{" "}
              <a href="mailto:palmergideon@gmail.com" className="text-blue-400 hover:text-blue-300">
                palmergideon@gmail.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {currentYear} AllYourDocs. All rights reserved.</p>
          <p className="text-white">Built by <span className="text-yellow-800">Splittech Solutions</span></p>
        </div>
      </div>
    </footer>
  )
}