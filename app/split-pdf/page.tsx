"use client"

import { useState, useRef, ChangeEvent, FormEvent, DragEvent, useEffect } from "react"
import Link from "next/link"
import { Upload, Scissors, Download, AlertCircle, CheckCircle, Loader2, FileText, Trash2, Plus, Minus, Package, RefreshCw, X } from "lucide-react"

interface SplitRange {
  id: number;
  start: number;
  end: number;
  isValid: boolean;
}

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [ranges, setRanges] = useState<SplitRange[]>([
    { id: 1, start: 1, end: 1, isValid: true }
  ]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load pdf-lib dynamically
  useEffect(() => {
    const loadPdfLib = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // Test if pdf-lib can be loaded
        await import('pdf-lib');
        setPdfLibLoaded(true);
      } catch (err) {
        console.error("Failed to load pdf-lib:", err);
        setError("Failed to load PDF library. Please refresh the page.");
      }
    };

    loadPdfLib();

    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError("Only PDF files are allowed");
        return;
      }
      
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError("File size exceeds 25MB limit");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setZipBlob(null);
      setTotalPages(0);
      
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }

      setRanges([{ id: 1, start: 1, end: 1, isValid: true }]);
      
      // Get page count
      await getPageCount(selectedFile);
    }
  };

  const getPageCount = async (pdfFile: File): Promise<number> => {
    try {
      // Use pdf-lib to get page count
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPageCount();
      setTotalPages(pages);
      return pages;
    } catch (err) {
      console.error("Failed to get page count:", err);
      setTotalPages(1);
      return 1;
    }
  };

  const validateRange = (start: number, end: number, maxPages: number): boolean => {
    return start >= 1 && end >= start && end <= maxPages;
  };

  const addRange = () => {
    const lastRange = ranges[ranges.length - 1];
    const newStart = lastRange ? lastRange.end + 1 : 1;
    const newEnd = Math.min(newStart, totalPages);
    
    const newRange: SplitRange = {
      id: Date.now(),
      start: newStart,
      end: newEnd,
      isValid: validateRange(newStart, newEnd, totalPages)
    };
    
    setRanges([...ranges, newRange]);
  };

  const removeRange = (id: number) => {
    if (ranges.length > 1) {
      setRanges(ranges.filter(range => range.id !== id));
    }
  };

  const updateRange = (id: number, field: 'start' | 'end', value: number) => {
    const updatedRanges = ranges.map(range => {
      if (range.id === id) {
        const updatedRange = { ...range, [field]: value };
        updatedRange.isValid = validateRange(
          field === 'start' ? value : updatedRange.start,
          field === 'end' ? value : updatedRange.end,
          totalPages
        );
        return updatedRange;
      }
      return range;
    });
    setRanges(updatedRanges);
  };

  const handleRangeByPages = () => {
    if (totalPages <= 0 || ranges.length === 0) return;
    
    const pagesPerSplit = Math.max(1, Math.floor(totalPages / ranges.length));
    const newRanges: SplitRange[] = [];
    
    for (let i = 0; i < ranges.length; i++) {
      const start = i * pagesPerSplit + 1;
      const end = i === ranges.length - 1 ? totalPages : (i + 1) * pagesPerSplit;
      
      newRanges.push({
        ...ranges[i],
        start,
        end,
        isValid: true
      });
    }
    
    setRanges(newRanges);
  };

  const handleSplitBySinglePages = () => {
    if (totalPages <= 0) return;
    
    const singlePageRanges: SplitRange[] = [];
    for (let i = 1; i <= totalPages; i++) {
      singlePageRanges.push({
        id: i,
        start: i,
        end: i,
        isValid: true
      });
    }
    
    setRanges(singlePageRanges);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    if (!pdfLibLoaded) {
      setError("PDF library not loaded. Please wait or refresh the page.");
      return;
    }

    // Validate all ranges
    const invalidRanges = ranges.filter(range => !range.isValid);
    if (invalidRanges.length > 0) {
      setError("Some page ranges are invalid. Please check your inputs.");
      return;
    }

    // Check for overlapping or missing pages
    const allPages: number[] = [];
    ranges.forEach(range => {
      for (let i = range.start; i <= range.end; i++) {
        allPages.push(i);
      }
    });
    
    const uniquePages = [...new Set(allPages)];
    const sortedPages = uniquePages.sort((a, b) => a - b);
    
    if (sortedPages.length !== totalPages || sortedPages[sortedPages.length - 1] !== totalPages) {
      setError("Page ranges don't cover all pages or have overlaps. Please check your ranges.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      console.log("Splitting PDF:", file.name);
      
      // Load libraries
      const { PDFDocument } = await import('pdf-lib');
      const JSZip = (await import('jszip')).default;
      
      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const zip = new JSZip();
      
      // For each range, create a new PDF with the specified pages
      for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
        const range = ranges[rangeIndex];
        
        // Create a new PDF document
        const newPdf = await PDFDocument.create();
        
        // Get the page indices (0-based)
        const pageIndices = Array.from(
          { length: range.end - range.start + 1 },
          (_, i) => range.start - 1 + i
        );
        
        // Copy pages from original PDF to new PDF
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        // Save the new PDF
        const pdfBytes = await newPdf.save();
        
        // Add to zip
        const fileName = `${file.name.replace(/\.pdf$/i, '')}_part${rangeIndex + 1}_p${range.start}-${range.end}.pdf`;
        zip.file(fileName, pdfBytes);
        
        console.log(`Created: ${fileName} (pages ${range.start}-${range.end})`);
      }
      
      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      setZipBlob(zipBlob);
      setDownloadUrl(url);
      setSuccess(true);
      
      console.log(`Split complete: ${ranges.length} PDF files created`);
      
    } catch (err: any) {
      console.error("Split error:", err);
      
      if (err.message.includes("memory") || err.message.includes("heap")) {
        setError("File too large to process in browser. Try a smaller file or split into fewer parts.");
      } else if (err.message.includes("corrupted") || err.message.includes("Invalid")) {
        setError("The PDF file appears to be corrupted or incompatible.");
      } else if (err.message.includes("password")) {
        setError("Password-protected PDFs cannot be processed.");
      } else {
        setError(err.message || "Failed to split PDF. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && file) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name.replace(/\.pdf$/i, "") + "_split.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = {
        target: { files: [droppedFile] }
      } as unknown as ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setTotalPages(0);
    setRanges([{ id: 1, start: 1, end: 1, isValid: true }]);
    setZipBlob(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPageRangeText = (range: SplitRange) => {
    if (range.start === range.end) {
      return `Page ${range.start}`;
    }
    return `Pages ${range.start}-${range.end}`;
  };

  const truncateFileName = (name: string, maxLength: number = 30): string => {
    if (name.length <= maxLength) return name;
    const extension = name.substring(name.lastIndexOf('.'));
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 3) + '...';
    return truncated + extension;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-purple-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Split PDF Free</h1>
            <p className="text-gray-600">
              Split PDF documents into multiple PDF files by page ranges
            </p>
          </div>

          {/* PDF Library Loading */}
          {!pdfLibLoaded && (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-start">
              <Loader2 className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1">
                <div className="font-medium">Loading PDF splitter...</div>
                <div className="text-sm mt-1">
                  Initializing PDF tools. This should only take a moment.
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div className="mb-8">
            <div
              className={`border-3 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                file ? "border-purple-400 bg-purple-50" : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  file ? "bg-purple-100" : "bg-purple-100"
                }`}>
                  <Upload className={`w-8 h-8 ${file ? "text-purple-600" : "text-purple-600"}`} />
                </div>
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!pdfLibLoaded}
                />
                {file ? (
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <FileText className="w-5 h-5 text-purple-600 mr-2" />
                      <div className="text-purple-600 font-semibold text-lg truncate max-w-xs">
                        {truncateFileName(file.name)}
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {formatFileSize(file.size)} • {totalPages > 0 ? `${totalPages} pages` : 'Detecting pages...'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-purple-600 font-medium mt-4 hover:text-purple-800 text-sm"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-purple-600 font-semibold text-lg mb-2">
                      {pdfLibLoaded ? "Select a PDF file" : "Loading PDF tools..."}
                    </div>
                    <div className="text-gray-500">{pdfLibLoaded ? "Click to browse or drag and drop" : "Please wait..."}</div>
                    <div className="text-gray-400 text-sm mt-2">
                      {pdfLibLoaded ? "Maximum file size: 25MB" : ""}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Ranges Section */}
          {file && totalPages > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Scissors className="w-5 h-5 mr-2 text-purple-600" />
                  Configure Split Ranges
                </h3>
                <div className="text-sm text-gray-500">
                  Total pages: <span className="font-semibold">{totalPages}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={handleRangeByPages}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center"
                  disabled={!pdfLibLoaded}
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Divide equally
                </button>
                <button
                  onClick={handleSplitBySinglePages}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center"
                  disabled={!pdfLibLoaded}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Split into single pages
                </button>
                <button
                  onClick={() => setRanges([{ id: 1, start: 1, end: totalPages, isValid: true }])}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium flex items-center"
                  disabled={!pdfLibLoaded}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset ranges
                </button>
              </div>

              {/* Ranges List */}
              <div className="space-y-4">
                {ranges.map((range, index) => (
                  <div
                    key={range.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      range.isValid 
                        ? "border-gray-200 bg-gray-50 hover:bg-gray-100" 
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-gray-700 flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          range.isValid ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div>Split {index + 1}</div>
                          <div className="text-sm text-gray-500">
                            {getPageRangeText(range)}
                          </div>
                        </div>
                      </div>
                      {ranges.length > 1 && (
                        <button
                          onClick={() => removeRange(range.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Remove this range"
                          disabled={!pdfLibLoaded}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Page
                        </label>
                        <div className="flex items-center">
                          <button
                            onClick={() => updateRange(range.id, 'start', Math.max(1, range.start - 1))}
                            className="px-3 py-2 bg-gray-200 rounded-l-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={range.start <= 1 || !pdfLibLoaded}
                            title="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={range.start}
                            onChange={(e) => updateRange(range.id, 'start', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border-y text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={!pdfLibLoaded}
                          />
                          <button
                            onClick={() => updateRange(range.id, 'start', Math.min(totalPages, range.start + 1))}
                            className="px-3 py-2 bg-gray-200 rounded-r-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={range.start >= totalPages || !pdfLibLoaded}
                            title="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Page
                        </label>
                        <div className="flex items-center">
                          <button
                            onClick={() => updateRange(range.id, 'end', Math.max(1, range.end - 1))}
                            className="px-3 py-2 bg-gray-200 rounded-l-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={range.end <= 1 || !pdfLibLoaded}
                            title="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={range.end}
                            onChange={(e) => updateRange(range.id, 'end', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border-y text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={!pdfLibLoaded}
                          />
                          <button
                            onClick={() => updateRange(range.id, 'end', Math.min(totalPages, range.end + 1))}
                            className="px-3 py-2 bg-gray-200 rounded-r-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={range.end >= totalPages || !pdfLibLoaded}
                            title="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Page Count
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 px-4 py-2 bg-white border rounded-lg flex items-center justify-between">
                            <div>
                              <span className="font-medium text-lg">{range.end - range.start + 1}</span>
                              <span className="text-gray-500 ml-2">pages</span>
                            </div>
                            <div className="text-sm">
                              {!range.isValid && (
                                <span className="text-red-600 flex items-center">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Invalid
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!range.isValid && (
                      <div className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {range.start > range.end ? "Start page must be ≤ end page" : 
                         range.start < 1 ? "Start page must be ≥ 1" :
                         range.end > totalPages ? `End page must be ≤ ${totalPages}` :
                         "Invalid range"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Range Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={addRange}
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium px-4 py-2 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                  disabled={!pdfLibLoaded}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Split Range
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Error</div>
                <div className="text-sm mt-1 whitespace-pre-line">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Success!</div>
                <div className="text-sm mt-1">
                  PDF successfully split into {ranges.length} PDF file{ranges.length !== 1 ? 's' : ''}. Ready to download!
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleSubmit}
              disabled={uploading || !file || !pdfLibLoaded || ranges.some(r => !r.isValid)}
              className={`flex-1 px-6 py-4 font-medium rounded-lg transition-all flex items-center justify-center ${
                uploading || !file || !pdfLibLoaded || ranges.some(r => !r.isValid)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-[1.02] shadow-md"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Splitting PDF...
                </>
              ) : !pdfLibLoaded ? (
                "Loading PDF tools..."
              ) : (
                <>
                  <Scissors className="w-5 h-5 mr-2" />
                  Split PDF
                </>
              )}
            </button>
            
            {success && zipBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] shadow-md transition-all flex items-center justify-center"
              >
                <Package className="w-5 h-5 mr-2" />
                Download ZIP
              </button>
            )}
            
            <button
              onClick={handleReset}
              className="px-6 py-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reset
            </button>
          </div>

          {/* Features & Tips */}
          <div className="mt-10 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-6">✨ Real PDF Splitting</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📄</span>
                </div>
                <div className="font-medium text-gray-900">Upload PDF</div>
                <div className="text-sm text-gray-600 mt-1">Select your PDF file (max 25MB)</div>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✂️</span>
                </div>
                <div className="font-medium text-gray-900">Set Ranges</div>
                <div className="text-sm text-gray-600 mt-1">Define page ranges to split into</div>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="font-medium text-gray-900">Get PDFs</div>
                <div className="text-sm text-gray-600 mt-1">Download multiple PDF files in ZIP</div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Important Notes
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Creates actual PDF files, not text files</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Preserves all formatting, images, and layout</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Large PDFs may take longer to process</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>All processing happens in your browser - 100% private</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Password-protected PDFs cannot be processed</span>
                </li>
              </ul>
            </div>
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
  );
}