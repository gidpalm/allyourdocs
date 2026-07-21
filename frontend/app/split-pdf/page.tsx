"use client"

import { useState, useRef, ChangeEvent, FormEvent, DragEvent, useEffect } from "react"
import Link from "next/link"
import { Upload, Scissors, Download, AlertCircle, CheckCircle, Loader2, FileText, Trash2, Plus, Minus, Package, RefreshCw, X } from "lucide-react"
import { ToolPageSkeleton } from "@/components/Skeleton"
import { useToast } from "@/components/ToastProvider"

interface SplitRange {
  id: number;
  start: number;
  end: number;
  isValid: boolean;
}

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [ranges, setRanges] = useState<SplitRange[]>([
    { id: 1, start: 1, end: 1, isValid: true }
  ]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const loadPdfLib = async () => {
      if (typeof window === 'undefined') return;

      try {
        await import('pdf-lib');
        setPdfLibLoaded(true);
      } catch (err) {
        console.error("Failed to load pdf-lib:", err);
        addToast("Failed to load PDF library. Please refresh the page.", "error");
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
        addToast("Only PDF files are allowed", "error");
        return;
      }

      if (selectedFile.size > 25 * 1024 * 1024) {
        addToast("File size exceeds 25MB limit", "error");
        return;
      }

      setFile(selectedFile);
      setSuccess(false);
      setZipBlob(null);
      setTotalPages(0);

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }

      setRanges([{ id: 1, start: 1, end: 1, isValid: true }]);

      await getPageCount(selectedFile);
    }
  };

  const getPageCount = async (pdfFile: File): Promise<number> => {
    try {
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
      addToast("Please select a PDF file", "error");
      return;
    }

    if (!pdfLibLoaded) {
      addToast("PDF library not loaded. Please wait or refresh the page.", "error");
      return;
    }

    const invalidRanges = ranges.filter(range => !range.isValid);
    if (invalidRanges.length > 0) {
      addToast("Some page ranges are invalid. Please check your inputs.", "error");
      return;
    }

    const allPages: number[] = [];
    ranges.forEach(range => {
      for (let i = range.start; i <= range.end; i++) {
        allPages.push(i);
      }
    });

    const uniquePages = [...new Set(allPages)];
    const sortedPages = uniquePages.sort((a, b) => a - b);

    if (sortedPages.length !== totalPages || sortedPages[sortedPages.length - 1] !== totalPages) {
      addToast("Page ranges don't cover all pages or have overlaps. Please check your ranges.", "error");
      return;
    }

    setUploading(true);
    setSuccess(false);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      console.log("Splitting PDF:", file.name);

      const { PDFDocument } = await import('pdf-lib');
      const JSZip = (await import('jszip')).default;

      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const zip = new JSZip();

      for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
        const range = ranges[rangeIndex];

        const newPdf = await PDFDocument.create();

        const pageIndices = Array.from(
          { length: range.end - range.start + 1 },
          (_, i) => range.start - 1 + i
        );

        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();

        const fileName = `${file.name.replace(/\.pdf$/i, '')}_part${rangeIndex + 1}_p${range.start}-${range.end}.pdf`;
        zip.file(fileName, pdfBytes);

        console.log(`Created: ${fileName} (pages ${range.start}-${range.end})`);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);

      setZipBlob(zipBlob);
      setDownloadUrl(url);
      addToast("PDF split successfully!", "success");
      setSuccess(true);

      console.log(`Split complete: ${ranges.length} PDF files created`);

    } catch (err: any) {
      console.error("Split error:", err);

      if (err.message.includes("memory") || err.message.includes("heap")) {
        addToast("File too large to process in browser. Try a smaller file or split into fewer parts.", "error");
      } else if (err.message.includes("corrupted") || err.message.includes("Invalid")) {
        addToast("The PDF file appears to be corrupted or incompatible.", "error");
      } else if (err.message.includes("password")) {
        addToast("Password-protected PDFs cannot be processed.", "error");
      } else {
        addToast(err.message || "Failed to split PDF. Please try again.", "error");
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

  if (!pdfLibLoaded) {
    return <ToolPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="card p-8">
          <div className="text-center mb-10">
            <div className="icon-tile w-20 h-20 mx-auto mb-6">
              <Scissors className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Split PDF Free</h1>
            <p className="text-slate-600">
              Split PDF documents into multiple PDF files by page ranges
            </p>
          </div>

          {!pdfLibLoaded && (
            <div className="mb-6 alert alert-info flex items-start">
              <Loader2 className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1">
                <div className="font-medium">Loading PDF splitter...</div>
                <div className="text-sm mt-1">
                  Initializing PDF tools. This should only take a moment.
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div
              className={`dropzone ${file ? 'dropzone-active' : 'dropzone-idle'} p-8`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-center py-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${file ? 'bg-indigo-50' : 'bg-indigo-50'}`}>
                  <Upload className={`w-8 h-8 text-indigo-600`} />
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
                      <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                      <div className="text-slate-900 font-semibold text-lg truncate max-w-xs">
                        {truncateFileName(file.name)}
                      </div>
                    </div>
                    <div className="text-slate-500 text-sm">
                      {formatFileSize(file.size)} — {totalPages > 0 ? `${totalPages} pages` : 'Detecting pages...'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium mt-4 text-sm"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-slate-900 font-semibold text-lg mb-2">
                      {pdfLibLoaded ? "Select a PDF file" : "Loading PDF tools..."}
                    </div>
                    <div className="text-slate-500">{pdfLibLoaded ? "Click to browse or drag and drop" : "Please wait..."}</div>
                    <div className="text-slate-400 text-sm mt-2">
                      {pdfLibLoaded ? "Maximum file size: 25MB" : ""}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {file && totalPages > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Scissors className="w-5 h-5 mr-2 text-indigo-600" />
                  Configure Split Ranges
                </h3>
                <div className="text-sm text-slate-500">
                  Total pages: <span className="font-semibold text-slate-700">{totalPages}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={handleRangeByPages}
                  className="btn-secondary !py-2 !px-4 text-sm"
                  disabled={!pdfLibLoaded}
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Divide equally
                </button>
                <button
                  onClick={handleSplitBySinglePages}
                  className="btn-secondary !py-2 !px-4 text-sm"
                  disabled={!pdfLibLoaded}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Split into single pages
                </button>
                <button
                  onClick={() => setRanges([{ id: 1, start: 1, end: totalPages, isValid: true }])}
                  className="btn-secondary !py-2 !px-4 text-sm"
                  disabled={!pdfLibLoaded}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset ranges
                </button>
              </div>

              <div className="space-y-4">
                {ranges.map((range, index) => (
                  <div
                    key={range.id}
                    className={`p-4 rounded-xl border transition-colors ${range.isValid ? "border-slate-200 bg-slate-50 hover:bg-indigo-50" : "border-red-300 bg-red-50"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-slate-800 flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${range.isValid ? 'bg-indigo-50 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                          <span className="text-sm font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <div>Split {index + 1}</div>
                          <div className="text-sm text-slate-500">
                            {getPageRangeText(range)}
                          </div>
                        </div>
                      </div>
                      {ranges.length > 1 && (
                        <button
                          onClick={() => removeRange(range.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Remove this range"
                          disabled={!pdfLibLoaded}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Start Page
                        </label>
                        <div className="flex items-center">
                          <button
                            onClick={() => updateRange(range.id, 'start', Math.max(1, range.start - 1))}
                            className="px-3 py-2 bg-slate-100 rounded-l-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="input !py-2 !px-2 text-center rounded-none"
                            disabled={!pdfLibLoaded}
                          />
                          <button
                            onClick={() => updateRange(range.id, 'start', Math.min(totalPages, range.start + 1))}
                            className="px-3 py-2 bg-slate-100 rounded-r-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={range.start >= totalPages || !pdfLibLoaded}
                            title="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          End Page
                        </label>
                        <div className="flex items-center">
                          <button
                            onClick={() => updateRange(range.id, 'end', Math.max(1, range.end - 1))}
                            className="px-3 py-2 bg-slate-100 rounded-l-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="input !py-2 !px-2 text-center rounded-none"
                            disabled={!pdfLibLoaded}
                          />
                          <button
                            onClick={() => updateRange(range.id, 'end', Math.min(totalPages, range.end + 1))}
                            className="px-3 py-2 bg-slate-100 rounded-r-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={range.end >= totalPages || !pdfLibLoaded}
                            title="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Page Count
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="font-medium text-lg text-slate-800">{range.end - range.start + 1}</span>
                              <span className="text-slate-500 ml-2">pages</span>
                            </div>
                            <div className="text-sm">
                              {!range.isValid && (
                                <span className="text-amber-600 flex items-center">
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
                      <div className="mt-2 text-sm text-amber-600 flex items-center">
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

              <div className="mt-6 text-center">
                <button
                  onClick={addRange}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                  disabled={!pdfLibLoaded}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Split Range
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleSubmit}
              disabled={uploading || !file || !pdfLibLoaded || ranges.some(r => !r.isValid)}
              className={`flex-1 ${uploading || !file || !pdfLibLoaded || ranges.some(r => !r.isValid) ? 'btn-disabled' : 'btn-primary'}`}
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
                className="flex-1 btn-primary"
              >
                <Package className="w-5 h-5 mr-2" />
                Download ZIP
              </button>
            )}

            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reset
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold mb-6 text-slate-900">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="font-medium text-slate-900">Upload PDF</div>
                <div className="text-sm text-slate-500 mt-1">Select your PDF file (max 25MB)</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scissors className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="font-medium text-slate-900">Set Ranges</div>
                <div className="text-sm text-slate-500 mt-1">Define page ranges to split into</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="font-medium text-slate-900">Get PDFs</div>
                <div className="text-sm text-slate-500 mt-1">Download multiple PDF files in ZIP</div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-indigo-600" />
                Important Notes
              </h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>Creates actual PDF files, not text files</span></li>
                <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>Preserves all formatting, images, and layout</span></li>
                <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>Large PDFs may take longer to process</span></li>
                <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>All processing happens in your browser - 100% private</span></li>
                <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span>Password-protected PDFs cannot be processed</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link
              href="/"
              className="link-brand font-medium transition-colors"
            >
              ← Back to All Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
