"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, FileText, File, Image as ImageIcon, Scissors, Minus, Type, RefreshCw, Shield, Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"

export default function Navigation() {
  const [isMenuOpen, setisMenuOpen] = useState(false)
  const [isToolsOpen, setisToolsOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const toolItems = [
    { name: "Merge PDF", href: "/merge-pdf", icon: FileText },
    { name: "PDF to Word", href: "/pdf-to-word", icon: File },
    { name: "Word to PDF", href: "/word-to-pdf", icon: FileText },
    { name: "Split PDF", href: "/split-pdf", icon: Scissors },
    { name: "Images to PDF", href: "/image-to-pdf", icon: ImageIcon },
    { name: "Compress PDF", href: "/compress-pdf", icon: Minus },
    { name: "Image to Text", href: "/image-to-text", icon: Type },
    { name: "PDF to Text", href: "/pdf-to-text", icon: File },
    { name: "Rearrange PDF", href: "/rearrange-pdf", icon: RefreshCw },
  ]

  return (
    <nav className="Sticky top-0 z-50 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Text Section */}
          <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3" aria-label="AllYourDocs home">
               <div className="relative w-10 h-10">
                 <Image
                   src="/logo.png"
                   alt="AllYourDocs Logo"
                   width={40}
                   height={40}
                   className="object-contain"
                   priority={true}
                 />
               </div>

               <div className="flex flex-col">
                 <span className="text-xl font-bold text-[var(--text)] leading-tight">
                   AllYourDocs
                 </span>
                 <span className="text-xs text-[var(--text-subtle)] font-medium">
                   Free Doc Tools
                 </span>
               </div>
             </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--brand)] font-medium transition-colors">
              Home
            </Link>

            <div className="relative">
              <button
                onClick={() => setisToolsOpen(!isToolsOpen)}
                className="flex items-center text-[var(--text-muted)] hover:text-[var(--brand)] font-medium transition-colors"
                aria-expanded={isToolsOpen}
              >
                Tools
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {isToolsOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setisToolsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] py-2 z-50">
                    {toolItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-4 py-3 text-[var(--text-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] transition-colors"
                        onClick={() => setisToolsOpen(false)}
                      >
                        <item.icon className="w-5 h-5 mr-3 text-[var(--brand)]" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link href="/blog" className="text-[var(--text-muted)] hover:text-[var(--brand)] font-medium transition-colors">
              Blog
            </Link>
            <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--brand)] font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-[var(--text-muted)] hover:text-[var(--brand)] font-medium transition-colors">
              Contact
            </Link>

            <Link href="/merge-pdf" className="btn-primary">
              Get Started
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setisMenuOpen(!isMenuOpen)}
              className="text-[var(--text)] hover:text-[var(--brand)] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-[var(--text)] hover:text-[var(--brand)] font-medium" onClick={() => setisMenuOpen(false)}>
                Home
              </Link>

              <div className="border-t border-[var(--border)] pt-4">
                <div className="text-sm font-semibold text-[var(--text-subtle)] mb-2">TOOLS</div>
                <div className="grid grid-cols-1 gap-1">
                  {toolItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center p-3 bg-[var(--surface-2)] rounded-lg hover:bg-[var(--brand-soft)] text-[var(--text-muted)]"
                      onClick={() => setisMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-2 text-[var(--brand)]" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-4 flex flex-col space-y-4">
                <Link href="/blog" className="text-[var(--text)] hover:text-[var(--brand)] font-medium" onClick={() => setisMenuOpen(false)}>Blog</Link>
                <Link href="/about" className="text-[var(--text)] hover:text-[var(--brand)] font-medium" onClick={() => setisMenuOpen(false)}>About</Link>
                <Link href="/contact" className="text-[var(--text)] hover:text-[var(--brand)] font-medium" onClick={() => setisMenuOpen(false)}>Contact</Link>
                <button
                  onClick={() => { toggleTheme(); setisMenuOpen(false); }}
                  className="flex items-center text-[var(--text)] hover:text-[var(--brand)] font-medium"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              <Link
                href="/merge-pdf"
                className="btn-primary mt-2"
                onClick={() => setisMenuOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
