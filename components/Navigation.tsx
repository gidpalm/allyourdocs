"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, FileText, File, Image as ImageIcon, Scissors, Minus, Type, RefreshCw } from "lucide-react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isToolsOpen, setIsToolsOpen] = useState(false)

  const toolItems = [
    { name: "Merge PDF", href: "/merge-pdf", icon: FileText, color: "text-blue-600" },
    { name: "PDF to Word", href: "/pdf-to-word", icon: File, color: "text-green-600" },
    { name: "Word to PDF", href: "/word-to-pdf", icon: FileText, color: "text-purple-600" },
    { name: "Split PDF", href: "/split-pdf", icon: Scissors, color: "text-yellow-600" },
    { name: "Images to PDF", href: "/image-to-pdf", icon: ImageIcon, color: "text-pink-600" },
    { name: "Compress PDF", href: "/compress-pdf", icon: Minus, color: "text-red-600" },
    { name: "Image to Text", href: "/image-to-text", icon: Type, color: "text-indigo-600" },
    { name: "PDF to Text", href: "/pdf-to-text", icon: File, color: "text-teal-600" },
    { name: "Rearrange PDF", href: "/rearrange-pdf", icon: RefreshCw, color: "text-orange-600" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Text Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              {/* Logo Image */}
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
              
              {/* Text */}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 leading-tight">
                  AllYourDocs
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Free Doc Tools
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium"
              >
                Tools
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {isToolsOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setIsToolsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border py-2 z-50">
                    {toolItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-4 py-3 hover:bg-gray-50"
                        onClick={() => setIsToolsOpen(false)}
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              
              <div className="border-t pt-4">
                <div className="text-sm font-semibold text-gray-500 mb-2">TOOLS</div>
                <div className="grid grid-cols-2 gap-2">
                  {toolItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 mr-2 ${item.color}`} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <Link
                href="/merge-pdf"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium text-center mt-4"
                onClick={() => setIsMenuOpen(false)}
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