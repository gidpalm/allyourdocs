"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, FileText, File, Image as ImageIcon, Scissors, Minus, Type, RefreshCw, Sun, Moon, Sparkles } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"

export default function Navigation() {
  const [isMenuOpen, setisMenuOpen] = useState(false)
  const [isToolsOpen, setisToolsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const toolItems = [
    { name: "Merge PDF", href: "/merge-pdf", icon: FileText, description: "Combine multiple PDFs" },
    { name: "PDF to Word", href: "/pdf-to-word", icon: File, description: "Convert PDF to editable Word" },
    { name: "Word to PDF", href: "/word-to-pdf", icon: FileText, description: "Convert Word to PDF" },
    { name: "Split PDF", href: "/split-pdf", icon: Scissors, description: "Split PDF by pages" },
    { name: "Images to PDF", href: "/image-to-pdf", icon: ImageIcon, description: "Convert images to PDF" },
    { name: "Compress PDF", href: "/compress-pdf", icon: Minus, description: "Reduce PDF file size" },
    { name: "Image to Text", href: "/image-to-text", icon: Type, description: "Extract text from images" },
    { name: "PDF to Text", href: "/pdf-to-text", icon: File, description: "Extract text from PDF" },
    { name: "Rearrange PDF", href: "/rearrange-pdf", icon: RefreshCw, description: "Reorder PDF pages" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[var(--surface)]/95 backdrop-blur-xl shadow-lg border-b border-[var(--border)]/50"
            : "bg-[var(--surface)] border-b border-[var(--border)]/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group" aria-label="AllYourDocs home">
              <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="AllYourDocs Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[var(--text)] leading-tight tracking-tight">
                  AllYourDocs
                </span>
                <span className="text-[10px] text-[var(--text-subtle)] font-medium uppercase tracking-wider">
                  Free Doc Tools
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] rounded-lg transition-all duration-200 relative group"
              >
                Home
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--brand)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              {/* Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setisToolsOpen(!isToolsOpen)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isToolsOpen
                      ? "text-[var(--brand)] bg-[var(--brand-soft)]"
                      : "text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)]"
                  }`}
                  aria-expanded={isToolsOpen}
                >
                  Tools
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isToolsOpen ? "rotate-180" : ""}`} />
                </button>

                {isToolsOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setisToolsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-[var(--border)]/50">
                        <span className="text-xs font-semibold text-[var(--text-subtle)] uppercase tracking-wider">All Tools</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto py-1">
                        {toolItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-4 py-3 hover:bg-[var(--brand-soft)] transition-all duration-150 group"
                            onClick={() => setisToolsOpen(false)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-[var(--brand-soft)] flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                              <item.icon className="w-4 h-4 text-[var(--brand)]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
                                {item.name}
                              </span>
                              <span className="text-xs text-[var(--text-subtle)]">{item.description}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link
                href="/blog"
                className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] rounded-lg transition-all duration-200 relative group"
              >
                Blog
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--brand)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              <Link
                href="/about"
                className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] rounded-lg transition-all duration-200 relative group"
              >
                About
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--brand)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>

              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[var(--border])/50">
                <Link
                  href="/merge-pdf"
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-200"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all duration-200"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setisMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isMenuOpen
                    ? "text-[var(--brand)] bg-[var(--brand-soft)]"
                    : "text-[var(--text)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)]"
                }`}
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t border-[var(--border)] pt-4 pb-6 space-y-1">
              <Link
                href="/"
                className="flex items-center px-3 py-3 text-[var(--text)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] rounded-lg transition-all duration-200"
                onClick={() => setisMenuOpen(false)}
              >
                <span className="font-medium">Home</span>
              </Link>

              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-[var(--text-subtle)] uppercase tracking-wider mb-2">
                  Tools
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {toolItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2.5 rounded-lg hover:bg-[var(--brand-soft)] text-[var(--text-muted)] transition-all duration-200"
                      onClick={() => setisMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-3 text-[var(--brand)] flex-shrink-0" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/blog"
                className="flex items-center px-3 py-3 text-[var(--text)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] rounded-lg transition-all duration-200"
                onClick={() => setisMenuOpen(false)}
              >
                <span className="font-medium">Blog</span>
              </Link>

              <Link
                href="/about"
                className="flex items-center px-3 py-3 text-[var(--text)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] rounded-lg transition-all duration-200"
                onClick={() => setisMenuOpen(false)}
              >
                <span className="font-medium">About</span>
              </Link>

              <div className="pt-3 border-t border-[var(--border)]/50">
                <Link
                  href="/merge-pdf"
                  className="flex items-center justify-center gap-2 px-4 py-3 text-center text-sm font-semibold text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] rounded-lg transition-all duration-200 shadow-md"
                  onClick={() => setisMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Optional: Subtle progress bar under navbar */}
      <div className="sticky top-16 z-40 h-0.5 bg-gradient-to-r from-[var(--brand)]/20 via-[var(--brand)] to-[var(--brand)]/20 scale-x-0 animate-[progress_auto_linear] origin-left" />
    </>
  )
}