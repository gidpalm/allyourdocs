// app/merge-pdf/page.tsx - CLIENT-SIDE VERSION (No backend needed)
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Upload, X, FileText, Download, AlertCircle, CheckCircle, Loader2, RefreshCw, ArrowUp, ArrowDown } from "lucide-react"

// Import PDF libraries
let PDFLib: any = null;
if (typeof window !== 'undefined') {
  import('pdf-lib').then(module => {
    PDFLib = module;
  });
}

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load PDF-lib
  useEffect(() => {
    const loadPdfLib = async () => {
      if (typeof window !== 'undefined' && !window.pdfLib) {
        try {
          const module = await import('pdf-lib');
          window.pdfLib = module;
          setPdfLibLoaded(true);
        } catch (err) {
          console.error('Failed to load PDF library:', err);
          setError('Failed to load PDF converter. Please refresh the page.');
        }
      } else {
        setPdfLibLoaded(true);
      }
    };

    loadPdfLib();

    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (files.length + selectedFiles.length > 20) {
      setError("Maximum 20 files allowed")
      return
    }
    
    // Validate each file
    for (const file of selectedFiles) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        setError("Only PDF files are allowed")
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError(`File ${file.name} is too large. Maximum size is 10MB`)
        return
      }
    }
    
    setFiles([...files, ...selectedFiles])
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    
    if (files.length + droppedFiles.length > 20) {
      setError("Maximum 20 files allowed")
      return
    }
    
    // Validate each file
    for (const file of droppedFiles) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        setError("Only PDF files are allowed")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 10MB`)
        return
      }
    }
    
    setFiles([...files, ...droppedFiles])
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (files.length < 2) {
      setError("Please select at least 2 PDF files")
      return
    }

    if (!pdfLibLoaded || !window.pdfLib) {
      setError("PDF converter not ready. Please wait a moment and try again.")
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("Starting merge of", files.length, "PDF files")
      
      const { PDFDocument } = window.pdfLib;
      const mergedPdf = await PDFDocument.create();
      
      let totalPages = 0;
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);
        
        try {
          // Read file as array buffer
          const arrayBuffer = await file.arrayBuffer();
          
          // Load PDF
          const pdf = await PDFDocument.load(arrayBuffer);
          const pageCount = pdf.getPageCount();
          
          // Copy all pages
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
          
          totalPages += pageCount;
          console.log(`Added ${pageCount} pages from ${file.name}`);
          
        } catch (fileError: any) {
          console.error(`Error processing ${file.name}:`, fileError);
          throw new Error(`Failed to process "${file.name}". It may be corrupted or not a valid PDF.`);
        }
      }
      
      // Save merged PDF
      console.log("Saving merged PDF...");
      const mergedPdfBytes = await mergedPdf.save();
      
      // Create blob and URL
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setSuccess(true);
      
      console.log(`Merge successful! Total pages: ${totalPages}, File size: ${blob.size} bytes`);
      
      // Alert user
      alert(`✅ Merge successful!\n\nMerged ${files.length} PDFs into one document.\nTotal pages: ${totalPages}\nFile size: ${formatFileSize(blob.size)}`);
      
    } catch (err: any) {
      console.error("Merge error:", err);
      
      let errorMessage = "Failed to merge PDFs";
      
      if (err.message.includes('corrupted') || err.message.includes('valid')) {
        errorMessage = err.message;
      } else if (err.message.includes('memory') || err.message.includes('heap')) {
        errorMessage = "Insufficient memory. Try merging fewer or smaller files.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setFiles([])
    setError(null)
    setSuccess(false)
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatTotalSize = () => {
    const total = files.reduce((sum, file) => sum + file.size, 0)
    return formatFileSize(total)
  }

  const reorderFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files]
    if (direction === 'up' && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]]
      setFiles(newFiles)
    } else if (direction === 'down' && index < files.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
      setFiles(newFiles)
    }
  }

  const getMergeButtonText = () => {
    if (uploading) {
      return `Merging ${files.length} PDF${files.length > 1 ? 's' : ''}...`;
    }
    if (!pdfLibLoaded) {
      return 'Loading PDF converter...';
    }
    return `Merge ${files.length} PDF${files.length > 1 ? 's' : ''}`;
  };

  const isMergeButtonDisabled = () => {
    return !pdfLibLoaded || uploading || files.length < 2;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Merge PDF Files</h1>
            <p className="text-gray-600">
              Combine multiple PDF files into a single document in the order you want
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
              Client-Side • No server needed
            </div>
          </div>

          {/* Converter Loading Status */}
          {!pdfLibLoaded && (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-start">
              <Loader2 className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1">
                <div className="font-medium">Loading PDF converter...</div>
                <div className="text-sm mt-1">
                  Initializing PDF merger. This should only take a moment.
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`border-3 border-dashed rounded-2xl transition-colors cursor-pointer mb-6 ${
              files.length > 0 ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="text-center py-12">
              <input
                type="file"
                id="file-upload"
                ref={fileInputRef}
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                files.length > 0 ? "bg-green-100" : "bg-blue-100"
              }`}>
                <Upload className={`w-8 h-8 ${files.length > 0 ? "text-green-600" : "text-blue-600"}`} />
              </div>
              <div className={`font-semibold text-lg mb-2 ${
                files.length > 0 ? "text-green-600" : "text-blue-600"
              }`}>
                {files.length === 0 ? "Click to select PDF files" : "Add More Files"}
              </div>
              <div className="text-gray-500 mb-4">or drag and drop them here</div>
              <div className="text-sm text-gray-400">
                Maximum 20 files • Each file up to 10MB
              </div>
              {files.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Total: {files.length} files • {formatTotalSize()}
                </div>
              )}
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Selected Files ({files.length})
                </h3>
                <button
                  onClick={handleReset}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div key={index} className="group flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • Position {index + 1}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          reorderFile(index, 'up')
                        }}
                        disabled={index === 0}
                        className={`p-1.5 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          reorderFile(index, 'down')
                        }}
                        disabled={index === files.length - 1}
                        className={`p-1.5 rounded ${index === files.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="text-gray-400 hover:text-red-500 p-1.5"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-500">
                Drag to reorder or use arrows to arrange files in desired merge order
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Error</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Success!</div>
                <div className="text-sm mt-1">PDFs merged successfully! Ready to download.</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {files.length > 0 && (
              <button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Upload className="w-5 h-5 mr-2" />
                Add More Files
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isMergeButtonDisabled()}
              className={`flex-1 px-6 py-4 font-medium rounded-lg transition-all flex items-center justify-center ${
                isMergeButtonDisabled()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] shadow-md"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {getMergeButtonText()}
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  {getMergeButtonText()}
                </>
              )}
            </button>
            {files.length > 0 && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reset
              </button>
            )}
          </div>

          {/* Download Section */}
          {downloadUrl && (
            <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">PDFs Merged Successfully!</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {files.length} file{files.length > 1 ? "s" : ""} combined • Ready to download
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.open(downloadUrl, '_blank')}
                    className="px-6 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = downloadUrl;
                      link.download = 'merged_document.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-10 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
              Tips for Best Results
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Files are merged in the order shown above. Use arrows to rearrange.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>All PDFs must be valid and not password-protected.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Maximum 20 files, 10MB each. Works entirely in your browser.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Files never leave your computer - 100% private.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>If merge fails, try with fewer or smaller files.</span>
              </li>
            </ul>
          </div>

          {/* Back to Home */}
          <div className="mt-8 pt-6 border-t text-center">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Back to All Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add global type declaration
declare global {
  interface Window {
    pdfLib: any;
  }
}