"use client"

import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from "react"
import Link from "next/link"
import { Upload, FileText, Download, AlertCircle, CheckCircle, Loader2, RefreshCw, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ToastProvider"

export default function PDFToText() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extractedText, setExtractedText] = useState<string>("")
  const [copySuccess, setCopySuccess] = useState(false)
  const { addToast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  
  const loadPdfLib = async () => {
    if (typeof window === 'undefined') return null
    
    try {
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const isPdf = selectedFile.type === 'application/pdf' || 
                   selectedFile.name.toLowerCase().endsWith('.pdf')
      
      if (!isPdf) {
        addToast("Only PDF files are supported (.pdf)", "error")
        return
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        addToast("File size exceeds 10MB limit", "error")
        return
      }
      
      setFile(selectedFile)
      setExtractedText("")
      setCopySuccess(false)
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
            text += `Page ${i}:\n${pageText}\n\n`
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      addToast("Please select a PDF file", "error")
      return
    }

    setUploading(true)
    setExtractedText("")
    setCopySuccess(false)

    try {
      console.log("Extracting text from PDF:", file.name)
      
      // Extract text
      const text = await extractTextFromPDF(file)
      setExtractedText(text)
      addToast("Text extracted successfully!", "success")
      
    } catch (err: any) {
      console.error("Extraction error:", err)
      
      if (err.message.includes("password")) {
        addToast("Cannot extract text from password-protected PDFs", "error")
      } else if (err.message.includes("corrupted")) {
        addToast("The PDF file appears to be corrupted", "error")
      } else if (err.message.includes("format")) {
        addToast("Unsupported PDF format", "error")
      } else {
        addToast("Failed to extract text. Please try another file.", "error")
      }
    } finally {
      setUploading(false)
    }
  }

  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText)
        .then(() => {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        })
        .catch(err => {
          console.error("Failed to copy text:", err)
        })
    }
  }

  const handleDownloadText = () => {
    if (extractedText && file) {
      const blob = new Blob([extractedText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const fileName = file.name.replace(/\.pdf$/i, '') + '.txt'
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleReset = () => {
    setFile(null)
    setExtractedText("")
    setCopySuccess(false)
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
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-indigo-600 mb-2">PDF to Text</h1>
            <p className="text-slate-600">
              Extract text from PDF files - preserves page structure
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Upload & Controls */}
            <div>
              {/* File Upload */}
              <div
                className={`border-2 border-dashed rounded-lg mb-4 ${
                  file ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-500"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="p-6 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div>
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="font-medium text-indigo-600 truncate mb-1">{file.name}</div>
                      <div className="text-sm text-slate-600">{formatFileSize(file.size)}</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="text-slate-600">Select PDF file</div>
                      <div className="text-sm text-slate-500 mt-1">or drag and drop</div>
                      <div className="text-xs text-slate-400 mt-2">Max 10MB</div>
                    </button>
                  )}
                </div>
              </div>

              {/* Convert Button */}
              <button
                onClick={handleSubmit}
                disabled={uploading || !file}
                className={`w-full py-3 rounded-lg font-medium mb-4 ${
                  uploading || !file
                    ? "bg-gray-300 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Extract Text"
                )}
              </button>

              {/* Action Buttons */}
              {extractedText && (
                <div className="space-y-3">
                  <button
                    onClick={handleCopyText}
                    className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text to Clipboard
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadText}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download as .txt File
                  </button>
                </div>
              )}

              {/* Reset Button */}
              {file && (
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 mt-3 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Process Another File
                </button>
              )}

              {/* Back Link */}
              <div className="mt-6 pt-4 border-t">
                <Link
                  href="/"
                  className="text-indigo-600 hover:text-slate-500 text-sm flex items-center justify-center"
                >
                  ? Back to All Tools
                </Link>
              </div>
            </div>

            {/* Right Column - Extracted Text */}
            <div>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-indigo-600">Extracted Text</h3>
                  {extractedText && (
                    <div className="text-sm text-slate-500">
                      {extractedText.split(/\s+/).length} words, {extractedText.length} characters
                    </div>
                  )}
                </div>

                <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                  {extractedText ? (
                    <textarea
                      ref={textAreaRef}
                      value={extractedText}
                      readOnly
                      className="w-full h-full p-4 text-slate-800 bg-slate-100 resize-none focus:outline-none min-h-[300px] md:min-h-[400px] font-mono text-sm"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                      <FileText className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-center">
                        {file 
                          ? "Click 'Extract Text' to process the PDF" 
                          : "Upload a PDF file to extract text"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-xs text-slate-500">
          <p>— 100% private - processing happens in your browser only</p>
          <p>— No text limits - extract all text from your PDF</p>
          <p>— Preserves page structure with page markers</p>
          <p>— Maximum file size: 10MB</p>
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




