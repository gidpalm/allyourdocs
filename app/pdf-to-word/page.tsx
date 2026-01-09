"use client"

import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from "react"
import Link from "next/link"
import { Upload, FileText, Download, AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"

export default function PDFToWord() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dynamically load libraries
  const loadPdfLib = async () => {
    if (typeof window === 'undefined') return null
    
    try {
      // Load PDF.js from CDN
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            resolve(null)
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      }
      return window.pdfjsLib
    } catch (err) {
      console.error("Failed to load PDF.js:", err)
      return null
    }
  }

  const loadDocxLib = async () => {
    if (typeof window === 'undefined') return null
    
    try {
      // Dynamic import for docx
      const docxModule = await import('docx')
      return docxModule
    } catch (err) {
      console.error("Failed to load docx:", err)
      return null
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const isPdf = selectedFile.type === 'application/pdf' || 
                   selectedFile.name.toLowerCase().endsWith('.pdf')
      
      if (!isPdf) {
        setError("Only PDF files are supported (.pdf)")
        return
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit")
        return
      }
      
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
      
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl)
        setDownloadUrl(null)
      }
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const event = {
        target: { files: [droppedFile] }
      } as unknown as ChangeEvent<HTMLInputElement>
      handleFileChange(event)
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfLib()
    if (!pdfjsLib) throw new Error("Failed to load PDF library")

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let text = ''
          
          // Extract text from each page
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ')
            text += pageText + '\n'
          }
          
          resolve(text.trim())
        } catch (err) {
          reject(err)
        }
      }
      
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsArrayBuffer(file)
    })
  }

  const createWordDocument = async (text: string): Promise<Blob> => {
    const docxModule = await loadDocxLib()
    if (!docxModule) throw new Error("Failed to load DOCX library")

    const { Document, Packer, Paragraph, TextRun } = docxModule
    
    // Clean text: remove extra whitespace and create paragraphs
    const paragraphs = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim())
    
    // Create document with JUST the extracted text, no headers/footers
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.map(text => 
          new Paragraph({
            children: [
              new TextRun({
                text: text,
                size: 24, // 12pt
              }),
            ],
          })
        ),
      }],
    })

    return await Packer.toBlob(doc)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError("Please select a PDF file")
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("Converting PDF to Word:", file.name)
      
      // Extract clean text
      const text = await extractTextFromPDF(file)
      
      // Create Word document with JUST the text
      const blob = await createWordDocument(text)
      
      // Create download URL
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setSuccess(true)
      
    } catch (err: any) {
      console.error("Conversion error:", err)
      
      if (err.message.includes("password")) {
        setError("Password-protected PDFs cannot be converted")
      } else if (err.message.includes("corrupted")) {
        setError("The PDF file appears to be corrupted")
      } else {
        setError("Failed to convert PDF. Please try another file.")
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl && file) {
      const link = document.createElement("a")
      const fileName = file.name.replace(/\.pdf$/i, '') + '.docx'
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleReset = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">PDF to Word</h1>
            <p className="text-gray-600 text-sm">
              Convert PDF to Word document
            </p>
          </div>

          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-lg mb-6 ${
              file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-300"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="p-8 text-center">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {file ? (
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="font-medium text-gray-900 truncate mb-1">{file.name}</div>
                  <div className="text-sm text-gray-600">{formatFileSize(file.size)}</div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-gray-700">Select PDF file</div>
                  <div className="text-sm text-gray-500 mt-1">or drag and drop</div>
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleSubmit}
            disabled={uploading || !file}
            className={`w-full py-3 rounded-lg font-medium mb-4 ${
              uploading || !file
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Convert to Word"
            )}
          </button>

          {/* Download Section */}
          {success && downloadUrl && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Ready to download</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Word Document
              </button>
            </div>
          )}

          {/* Reset Button */}
          {file && (
            <button
              onClick={handleReset}
              className="w-full py-2.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Convert Another File
            </button>
          )}

          {/* Back Link */}
          <div className="mt-6 pt-4 border-t text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to All Tools
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>• Files never leave your browser</p>
          <p>• No watermarks or headers added</p>
          <p>• Maximum file size: 10MB</p>
        </div>
      </div>
    </div>
  )
}

// Add global type
declare global {
  interface Window {
    pdfjsLib: any;
  }
}