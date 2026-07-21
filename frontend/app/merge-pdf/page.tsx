// app/merge-pdf/page.tsx - CLIENT-SIDE VERSION (No backend needed)
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Upload, X, FileText, Download, AlertCircle, CheckCircle, Loader2, RefreshCw, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react"
import { ToolPageSkeleton } from "@/components/Skeleton"
import { useToast } from "@/components/ToastProvider"

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
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false)
  const { addToast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadPdfLib = async () => {
      if (typeof window !== 'undefined' && !window.pdfLib) {
        try {
          const module = await import('pdf-lib');
          window.pdfLib = module;
          setPdfLibLoaded(true);
         } catch (err) {
           console.error('Failed to load PDF library:', err);
           addToast('Failed to load PDF converter. Please refresh the page.', "error")
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
      addToast("Maximum 20 files allowed", "error")
      return
    }

    for (const file of selectedFiles) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        addToast("Only PDF files are allowed", "error")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        addToast(`File ${file.name} is too large. Maximum size is 10MB`, "error")
        return
      }
    }

    setFiles([...files, ...selectedFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)

    if (files.length + droppedFiles.length > 20) {
      addToast("Maximum 20 files allowed", "error")
      return
    }

    for (const file of droppedFiles) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        addToast("Only PDF files are allowed", "error")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        addToast(`File ${file.name} is too large. Maximum size is 10MB`, "error")
        return
      }
    }

    setFiles([...files, ...droppedFiles])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length < 2) {
      addToast("Please select at least 2 PDF files", "error")
      return
    }

    if (!pdfLibLoaded || !window.pdfLib) {
      addToast("PDF converter not ready. Please wait a moment and try again.", "error")
      return
    }

    setUploading(true)

    try {
      console.log("Starting merge of", files.length, "PDF files")

      const { PDFDocument } = window.pdfLib;
      const mergedPdf = await PDFDocument.create();

      let totalPages = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);

        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const pageCount = pdf.getPageCount();
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page: any) => mergedPdf.addPage(page));
          totalPages += pageCount;
          console.log(`Added ${pageCount} pages from ${file.name}`);
        } catch (fileError: any) {
          console.error(`Error processing ${file.name}:`, fileError);
          throw new Error(`Failed to process "${file.name}". It may be corrupted or not a valid PDF.`);
        }
      }

      console.log("Saving merged PDF...");
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      addToast(`Merge successful! ${files.length} PDFs merged.`, "success")
      console.log(`Merge successful! Total pages: ${totalPages}, File size: ${blob.size} bytes`);
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
      addToast(errorMessage, "error")
    } finally {
      setUploading(false);
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setFiles([])
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

  if (!pdfLibLoaded) {
    return <ToolPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card p-8">
          <div className="text-center mb-10">
            <div className="icon-tile w-20 h-20 mx-auto mb-6">
              <FileText className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Merge PDF Files</h1>
            <p className="text-slate-600">
              Combine multiple PDF files into a single document in the order you want
            </p>
          </div>

          {!pdfLibLoaded && (
            <div className="mb-6 alert alert-info flex items-start">
              <Loader2 className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1">
                <div className="font-medium">Loading PDF converter...</div>
                <div className="text-sm mt-1">Initializing PDF merger. This should only take a moment.</div>
              </div>
            </div>
          )}

          <div
            className={`dropzone ${files.length > 0 ? 'dropzone-active' : 'dropzone-idle'} p-8`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="text-center py-8">
              <input
                type="file"
                id="file-upload"
                ref={fileInputRef}
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-indigo-50`}>
                <Upload className={`w-8 h-8 text-indigo-600`} />
              </div>
              <div className={`font-semibold text-lg mb-2 text-slate-900`}>
                {files.length === 0 ? "Click to select PDF files" : "Add More Files"}
              </div>
              <div className="text-slate-500 mb-4">or drag and drop them here</div>
              <div className="text-sm text-slate-400">Maximum 20 files — Each file up to 10MB</div>
              {files.length > 0 && (
                <div className="mt-4 text-sm text-slate-600">
                  Total: {files.length} files — {formatTotalSize()}
                </div>
              )}
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center text-slate-900">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Selected Files ({files.length})
                </h3>
                <button
                  onClick={handleReset}
                  className="text-slate-500 hover:text-red-600 text-sm flex items-center transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div key={index} className="group flex items-center justify-between bg-slate-50 p-4 rounded-xl hover:bg-indigo-50 transition-colors border border-slate-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-100">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-slate-800">{file.name}</div>
                        <div className="text-sm text-slate-500">{formatFileSize(file.size)} — Position {index + 1}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); reorderFile(index, 'up') }}
                        disabled={index === 0}
                        className={`p-1.5 rounded ${index === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); reorderFile(index, 'down') }}
                        disabled={index === files.length - 1}
                        className={`p-1.5 rounded ${index === files.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                        className="text-slate-500 hover:text-red-600 p-1.5 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-slate-500">
                Drag to reorder or use arrows to arrange files in desired merge order
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            {files.length > 0 && (
              <button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="btn-secondary flex-1"
              >
                <Upload className="w-5 h-5 mr-2" />
                Add More Files
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isMergeButtonDisabled()}
              className={`flex-1 ${isMergeButtonDisabled() ? 'btn-disabled' : 'btn-primary'}`}
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
                className="btn-secondary"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reset
              </button>
            )}
          </div>

          {downloadUrl && (
            <div className="mt-8 alert alert-success">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 border border-indigo-200">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">PDFs Merged Successfully!</div>
                    <div className="text-sm text-green-700 mt-1">{files.length} file{files.length > 1 ? "s" : ""} combined — Ready to download</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.open(downloadUrl, '_blank')}
                    className="btn-secondary"
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
                    className="btn-primary"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-900">
              <AlertCircle className="w-5 h-5 mr-2 text-slate-400" />
              Tips for Best Results
            </h3>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>Files are merged in the order shown above. Use arrows to rearrange.</span></li>
              <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>All PDFs must be valid and not password-protected.</span></li>
              <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>Maximum 20 files, 10MB each. Works entirely in your browser.</span></li>
              <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>Files never leave your computer - 100% private.</span></li>
              <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>If merge fails, try with fewer or smaller files.</span></li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link href="/" className="link-brand font-medium transition-colors inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    pdfLib: any;
  }
}
