import { FileText, Github, Twitter, Mail, Shield } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[var(--brand)] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--text)]">
                AllYourDocs
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Your trusted document processing platform. Secure, fast, and free to use — all processing happens privately in your browser.
            </p>
            <div className="flex items-center gap-2 mt-4 text-[var(--text-subtle)] text-xs">
              <Shield className="w-4 h-4 text-[var(--brand)]" />
              <span>100% private, browser-based</span>
            </div>
          </div>

          <div>
            <h3 className="text-[var(--text)] font-semibold mb-4">Tools</h3>
            <ul className="space-y-3">
              <li><Link href="/merge-pdf" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Merge PDF</Link></li>
              <li><Link href="/pdf-to-word" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">PDF to Word</Link></li>
              <li><Link href="/word-to-pdf" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Word to PDF</Link></li>
              <li><Link href="/split-pdf" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Split PDF</Link></li>
              <li><Link href="/compress-pdf" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Compress PDF</Link></li>
              <li><Link href="/tools" className="text-[var(--brand)] hover:text-[var(--brand)] text-sm transition-colors">View All Tools →</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--text)] font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Blog & Guides</Link></li>
              <li><Link href="/contact" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Contact Us</Link></li>
              <li><Link href="/feedback" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Feedback</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--text)] font-semibold mb-4">Legal & Info</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">Cookie Policy</Link></li>
              <li><Link href="/dmca" className="text-[var(--text-muted)] hover:text-[var(--brand)] text-sm transition-colors">DMCA / Copyright</Link></li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="https://github.com/gidpalm" target="_blank" rel="noopener noreferrer" className="text-[var(--text-subtle)] hover:text-[var(--brand)] transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:palmergideon@gmail.com" className="text-[var(--text-subtle)] hover:text-[var(--brand)] transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-8 text-center text-[var(--text-subtle)]">
          <p>© {currentYear} AllYourDocs. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-4">
            <Link href="/privacy-policy" className="hover:text-[var(--brand)] transition-colors">Privacy</Link>
            <span className="text-[var(--border)]">|</span>
            <Link href="/terms-of-service" className="hover:text-[var(--brand)] transition-colors">Terms</Link>
            <span className="text-[var(--border)]">|</span>
            <Link href="/contact" className="hover:text-[var(--brand)] transition-colors">Contact</Link>
            <span className="text-[var(--border)]">|</span>
            <Link href="/sitemap.xml" className="hover:text-[var(--brand)] transition-colors">Sitemap</Link>
          </div>
          <p className="text-[var(--text-subtle)] text-xs mt-4">
            This site may display advertisements. By using this site, you agree to our Terms of Service and Privacy Policy.
            AllYourDocs is not affiliated with Adobe, Microsoft, or any other document software company.
          </p>
        </div>
      </div>
    </footer>
  )
}
