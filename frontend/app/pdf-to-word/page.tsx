"use client"

import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from "react"
import Link from "next/link"
import { Upload, FileText, Download, AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ToastProvider"

export default function PDFToWord() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const { addToast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const loadDocxLib = async () => {
    if (typeof window === 'undefined') return null

    try {
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
        addToast("Only PDF files are supported (.pdf)", "error")
        return
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        addToast("File size exceeds 10MB limit", "error")
        return
      }

      setFile(selectedFile)
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

    const paragraphs = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim())

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.map(text =>
          new Paragraph({
            children: [
              new TextRun({
                text: text,
                size: 24,
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
      addToast("Please select a PDF file", "error")
      return
    }

    setUploading(true)
    setSuccess(false)

    try {
      console.log("Converting PDF to Word:", file.name)

      const text = await extractTextFromPDF(file)
      const blob = await createWordDocument(text)

      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      addToast("Conversion complete!", "success")
      setSuccess(true)

    } catch (err: any) {
      console.error("Conversion error:", err)

      if (err.message.includes("password")) {
        addToast("Password-protected PDFs cannot be converted", "error")
      } else if (err.message.includes("corrupted")) {
        addToast("The PDF file appears to be corrupted", "error")
      } else {
        addToast("Failed to convert PDF. Please try another file.", "error")
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
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="card p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">PDF to Word</h1>
            <p className="text-slate-500 text-sm">
              Convert PDF to Word document
            </p>
          </div>

          <div
            className={`dropzone ${file ? 'dropzone-active' : 'dropzone-idle'} p-6`}
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
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="font-medium text-slate-800 truncate mb-1">{file.name}</div>
                  <div className="text-sm text-slate-500">{formatFileSize(file.size)}</div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-slate-700">Select PDF file</div>
                  <div className="text-sm text-slate-400 mt-1">or drag and drop</div>
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading || !file}
            className={`w-full mt-6 ${uploading || !file ? 'btn-disabled' : 'btn-primary'}`}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Convert to Word"
            )}
          </button>

          {success && downloadUrl && (
            <div className="mb-4 mt-6">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                <span className="font-medium text-slate-800">Ready to download</span>
              </div>
              <button
                onClick={handleDownload}
                className="btn-primary w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Word Document
              </button>
            </div>
          )}

          {file && (
            <button
              onClick={handleReset}
              className="w-full mt-4 btn-secondary"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Convert Another File
            </button>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <Link href="/" className="link-brand text-sm">
              ← Back to All Tools
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          <p>— Files never leave your browser</p>
          <p>— No watermarks or headers added</p>
          <p>— Maximum file size: 10MB</p>
        </div>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}
