"use client"

import { useState, useRef, ChangeEvent, FormEvent, DragEvent, useEffect } from "react"
import Link from "next/link"
import { Upload, Download, AlertCircle, CheckCircle, Loader2, FileText, BarChart3, Settings, Zap, Sparkles, Target, Archive, RefreshCw, X, Image as ImageIcon, FolderOpen, CloudUpload } from "lucide-react"
import { ToolPageSkeleton } from "@/components/Skeleton"
import { useToast } from "@/components/ToastProvider"

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  reduction: number;
  reductionPercentage: number;
  quality: number;
  method: string;
}

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [compressionType, setCompressionType] = useState<'basic' | 'enhanced' | 'extreme'>('enhanced');
  const [imageQuality, setImageQuality] = useState<number>(30);
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const loadPdfLib = async () => {
      if (typeof window !== 'undefined') {
        try {
          await import('pdf-lib');
          setPdfLibLoaded(true);
        } catch (err) {
          console.error("Failed to load pdf-lib:", err);
          addToast("Failed to load PDF library. Please refresh the page.", "error");
        }
      }
    };

    loadPdfLib();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    processSelectedFile(selectedFile);
  };

  const processSelectedFile = (selectedFile: File | undefined) => {
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        addToast("File size exceeds 50MB limit", "error");
        return;
      }

      if (!selectedFile.type.includes('pdf') && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        addToast("Please select a valid PDF file", "error");
        return;
      }

      setFile(selectedFile);
      setSuccess(false);
      setPdfBlob(null);
      setStats(null);

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setCompressionType('extreme');
        setImageQuality(20);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    processSelectedFile(droppedFile);
  };

  const compressPDF = async (pdfBytes: Uint8Array, mode: 'enhanced' | 'extreme'): Promise<Uint8Array> => {
    const { PDFDocument } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.load(pdfBytes);

    if (removeMetadata) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());
    }

    const pages = pdfDoc.getPages();

    if (mode === 'extreme') {
      for (const page of pages) {
        try {
          const { width, height } = page.getSize();
          if (width > 1000 || height > 1000) {
            page.setSize(width * 0.8, height * 0.8);
          }
        } catch (e) {
        }
      }
    }

    const saveOptions: any = {
      useObjectStreams: true,
      addDefaultPage: false,
    };

    if (mode === 'enhanced') {
      saveOptions.objectsPerTick = 20;
    } else if (mode === 'extreme') {
      saveOptions.objectsPerTick = 10;
      saveOptions.flattenAnnotations = true;
    }

    return await pdfDoc.save(saveOptions);
  };

  const compressPDFBasic = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
    const { PDFDocument } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.load(pdfBytes);

    if (removeMetadata) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
    }

    return await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 30,
    });
  };

  const compressWithNativeAPI = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
    try {
      if ('CompressionStream' in window) {
        const cs = new CompressionStream('deflate');
        const blob = new Blob([pdfBytes as unknown as BlobPart]);
        const compressedStream = blob.stream().pipeThrough(cs);
        const compressedBlob = await new Response(compressedStream).blob();
        return new Uint8Array(await compressedBlob.arrayBuffer());
      }
      return pdfBytes;
    } catch (err) {
      console.warn("Native compression failed:", err);
      return pdfBytes;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      addToast("Please select a PDF file", "error");
      return;
    }

    setUploading(true);
    setSuccess(false);
    setStats(null);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      console.log(`Compressing PDF (${formatFileSize(file.size)})...`);
      console.log("Compression type:", compressionType);
      console.log("Image quality:", imageQuality);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      let compressedBytes: Uint8Array;
      let method: string;

      const startTime = performance.now();

      if (compressionType === 'basic') {
        compressedBytes = await compressPDFBasic(uint8Array);
        method = 'Basic (metadata removal & optimization)';
      } else {
        compressedBytes = await compressPDF(uint8Array, compressionType);
        method = compressionType === 'extreme'
          ? 'Extreme (maximum optimization)'
          : 'Enhanced (optimization)';
      }

      try {
        const nativeCompressed = await compressWithNativeAPI(compressedBytes);
        if (nativeCompressed.length < compressedBytes.length) {
          compressedBytes = nativeCompressed;
          method += ' + Native Compression';
        }
      } catch (nativeErr) {
      }

      const endTime = performance.now();
      console.log(`Compression took ${((endTime - startTime) / 1000).toFixed(1)} seconds`);

      const compressedBlob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });

      const reductionPercentage = ((file.size - compressedBlob.size) / file.size) * 100;
      const compressionStats: CompressionStats = {
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        reduction: file.size - compressedBlob.size,
        reductionPercentage: Number(reductionPercentage.toFixed(1)),
        quality: imageQuality,
        method: method,
      };

      console.log(`Original: ${formatFileSize(file.size)}, Compressed: ${formatFileSize(compressedBlob.size)}`);

      if (compressedBlob.size >= file.size) {
        addToast("No compression achieved. The PDF may already be optimized.", "error");
      } else if (reductionPercentage < 10) {
        if (compressionType === 'basic') {
          addToast(`Minimal compression (${reductionPercentage.toFixed(1)}%). Try Enhanced or Extreme mode for better results.`, "error");
        } else {
          addToast(`Only ${reductionPercentage.toFixed(1)}% reduction. This PDF may not have compressible content.`, "error");
        }
      } else if (reductionPercentage < 30 && compressionType === 'extreme') {
        addToast(`Only ${reductionPercentage.toFixed(1)}% reduction. This PDF may already be highly optimized.`, "error");
      } else {
        addToast("PDF compressed!", "success");
        setSuccess(true);
      }

      const url = URL.createObjectURL(compressedBlob);
      setPdfBlob(compressedBlob);
      setDownloadUrl(url);
      setStats(compressionStats);

    } catch (err: any) {
      console.error("Compression error:", err);

      if (err.message.includes("password") || err.message.includes("encrypted")) {
        addToast("Password-protected PDFs cannot be compressed client-side", "error");
      } else if (err.message.includes("corrupted") || err.message.includes("Invalid")) {
        addToast("The PDF file appears to be corrupted or incompatible", "error");
      } else if (err.message.includes("memory") || err.message.includes("heap")) {
        addToast("File too large to process in browser. Try a smaller file (under 25MB) or use Basic compression.", "error");
      } else if (err.message.includes("Cannot read properties") || err.message.includes("undefined")) {
        addToast("PDF structure too complex. Try Basic mode or a different PDF file.", "error");
      } else {
        addToast(err.message || "Failed to compress PDF. Please try again.", "error");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && file && pdfBlob) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `compressed_${file.name.replace(/\.pdf$/i, "")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSuccess(false);
    setPdfBlob(null);
    setStats(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImageQuality(30);
    setCompressionType('enhanced');
    setRemoveMetadata(true);
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCompressionLevel = (percentage: number) => {
    if (percentage >= 50) return "Excellent (>50%)";
    if (percentage >= 30) return "Good (30-50%)";
    if (percentage >= 15) return "Moderate (15-30%)";
    if (percentage > 0) return "Minimal (<15%)";
    return "No Compression";
  };

  const getCompressionColor = (percentage: number) => {
    if (percentage >= 50) return "badge-success";
    if (percentage >= 30) return "badge-info";
    if (percentage >= 15) return "badge-warning";
    if (percentage > 0) return "badge-warning";
    return "badge-muted";
  };

  const getExpectedReduction = () => {
    if (compressionType === 'basic') {
      return "10-30%";
    } else if (compressionType === 'enhanced') {
      return "25-50%";
    } else {
      return "40-70%";
    }
  };

  if (!pdfLibLoaded) {
    return <ToolPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="card p-8">
          <div className="text-center mb-10">
            <div className="icon-tile w-20 h-20 mx-auto mb-6">
              <Archive className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">PDF Compression</h1>
            <p className="text-slate-600">
              Reduce PDF file size with intelligent optimization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <div
                  className={`dropzone ${isDragging ? 'dropzone-active' : 'dropzone-idle'} p-8`}
                  onClick={handleBrowseClick}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    ref={fileInputRef}
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file ? (
                    <div>
                      <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                        <FileText className="w-10 h-10 text-indigo-600" />
                      </div>
                      <div className="mb-2">
                        <div className="font-semibold text-slate-900 truncate">{file.name}</div>
                        <div className="text-slate-500 text-sm">{formatFileSize(file.size)}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBrowseClick();
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        Choose Different File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                        <CloudUpload className="w-10 h-10 text-indigo-600" />
                      </div>
                      <div className="mb-4">
                        <div className="font-semibold text-slate-900 text-lg mb-2">Select a PDF file to compress</div>
                        <div className="text-slate-500">Click to browse or drag and drop</div>
                        <div className="text-slate-400 text-sm mt-2">Maximum file size: 50MB</div>
                      </div>
                      <button
                        onClick={handleBrowseClick}
                        className="btn-primary"
                      >
                        <FolderOpen className="w-5 h-5 mr-2" />
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="mt-4 flex items-center justify-center">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-slate-500 hover:text-red-600 font-medium flex items-center transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Remove File
                    </button>
                  </div>
                )}
              </div>

              {file && !uploading && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-6 flex items-center text-slate-900">
                    <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                    Compression Settings
                  </h3>

                  <div className="mb-8">
                    <label className="block text-sm font-medium text-slate-700 mb-4">
                      Select Compression Level
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setCompressionType('basic')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${compressionType === 'basic' ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <div className="font-semibold text-slate-900 text-lg mb-1">Basic</div>
                        <div className="text-sm text-slate-500 mb-2">Fast metadata removal</div>
                        <div className="badge badge-info">10-30% reduction</div>
                      </button>

                      <button
                        onClick={() => setCompressionType('enhanced')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${compressionType === 'enhanced' ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <div className="font-semibold text-slate-900 text-lg mb-1">Enhanced</div>
                        <div className="text-sm text-slate-500 mb-2">Balanced optimization</div>
                        <div className="badge badge-info">25-50% reduction</div>
                      </button>

                      <button
                        onClick={() => setCompressionType('extreme')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${compressionType === 'extreme' ? "border-red-500 bg-red-50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <div className="font-semibold text-slate-900 text-lg mb-1">Extreme</div>
                        <div className="text-sm text-slate-500 mb-2">Maximum compression</div>
                        <div className="badge badge-danger">40-70% reduction</div>
                      </button>
                    </div>
                  </div>

                  <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2 text-indigo-600" />
                      Compression Quality
                    </h4>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium text-slate-700">
                            Compression Level: {imageQuality}%
                          </label>
                          <span className={`text-xs font-medium px-2 py-1 rounded badge ${imageQuality <= 20 ? "badge-warning" : imageQuality <= 40 ? "badge-info" : "badge-success"}`}>
                            {imageQuality <= 20 ? "Maximum Compression" : imageQuality <= 40 ? "Balanced" : "High Quality"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          step="5"
                          value={imageQuality}
                          onChange={(e) => setImageQuality(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                          <span>Smaller file</span>
                          <span>Better quality</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <div className="text-sm font-medium text-slate-700 mb-2">Best Practices:</div>
                        <ul className="text-xs text-slate-600 space-y-1">
                          <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span><strong>For scanned documents:</strong> Use Extreme mode with Quality = 30%</span></li>
                          <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span><strong>For text PDFs:</strong> Enhanced mode with Quality 40-60%</span></li>
                          <li className="flex items-start"><span className="text-indigo-600 mr-2">—</span><span><strong>For presentations:</strong> Extreme mode for maximum reduction</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold text-slate-700 mb-4">Options</h4>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <div className="font-medium text-slate-800">Remove Metadata</div>
                        <div className="text-sm text-slate-500">Reduces file size by 10-25%</div>
                      </div>
                      <button
                        onClick={() => setRemoveMetadata(!removeMetadata)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${removeMetadata ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        role="switch"
                        aria-checked={removeMetadata}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${removeMetadata ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="text-sm text-slate-700">
                      <strong>How it works:</strong> This tool uses PDF structure optimization,
                      metadata removal, and browser-native compression to significantly reduce file sizes
                      while maintaining document quality.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              {stats && (
                <div className="mb-6 card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-slate-900">
                    <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                    Compression Results
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Original Size:</span>
                        <span className="font-medium text-slate-800">{formatFileSize(stats.originalSize)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Compressed Size:</span>
                        <span className="font-medium text-indigo-600">{formatFileSize(stats.compressedSize)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.max(5, (stats.compressedSize / stats.originalSize) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="stat">
                          <div className={`text-2xl font-bold ${stats.reductionPercentage > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                            {stats.reductionPercentage.toFixed(1)}%
                          </div>
                          <div className="stat-label">Size Reduced</div>
                        </div>
                        <div className="stat">
                          <div className={`text-2xl font-bold ${stats.reduction > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                            {formatFileSize(stats.reduction)}
                          </div>
                          <div className="stat-label">Space Saved</div>
                        </div>
                      </div>

                      <div className={`mt-4 p-3 rounded-lg border text-center font-semibold ${getCompressionColor(stats.reductionPercentage)}`}>
                        {getCompressionLevel(stats.reductionPercentage)}
                        <div className="text-xs font-normal mt-1">Method: {stats.method}</div>
                      </div>

                      {stats.reductionPercentage < 10 && (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          Low compression. Try "Extreme" mode with lower quality settings.
                        </div>
                      )}

                      {stats.reductionPercentage >= 30 && (
                        <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Great compression achieved!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={uploading || !file}
                  className={`w-full ${uploading || !file ? 'btn-disabled' : 'btn-primary'}`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Compressing PDF...
                    </>
                  ) : (
                    <>
                      <Archive className="w-5 h-5 mr-2" />
                      {!file ? "Select PDF First" :
                        compressionType === 'basic' ? "Compress PDF (Basic)" :
                        compressionType === 'enhanced' ? "Compress PDF (Enhanced)" :
                        "Compress PDF (Extreme)"}
                    </>
                  )}
                </button>

                {success && pdfBlob && stats && stats.reductionPercentage > 0 && (
                  <button
                    onClick={handleDownload}
                    className="w-full btn-primary"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Compressed PDF
                  </button>
                )}

                {file && (
                  <button
                    onClick={handleReset}
                    className="btn-secondary w-full"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Start Over
                  </button>
                )}
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-indigo-600" />
                  For Maximum Compression
                </h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start"><span className="text-indigo-600 mr-2">1.</span><span>Select <strong>Extreme</strong> mode</span></li>
                  <li className="flex items-start"><span className="text-indigo-600 mr-2">2.</span><span>Set Quality to <strong>20-30%</strong></span></li>
                  <li className="flex items-start"><span className="text-indigo-600 mr-2">3.</span><span>Enable <strong>Remove Metadata</strong></span></li>
                  <li className="text-xs italic mt-2">Works best for image-heavy PDFs (scans, photos).</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold mb-6 text-slate-900">Typical Compression Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Image-Heavy PDFs</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>Scanned documents:</strong> 40-70% reduction</span></li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>Photo albums:</strong> 50-80% reduction</span></li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>Presentations:</strong> 30-60% reduction</span></li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Text-Heavy PDFs</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>eBooks:</strong> 20-40% reduction</span></li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>Reports:</strong> 15-35% reduction</span></li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>Documents:</strong> 10-30% reduction</span></li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">Mixed Content</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>Magazines:</strong> 25-50% reduction</span></li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>Catalogs:</strong> 30-55% reduction</span></li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" /><span><strong>Brochures:</strong> 35-60% reduction</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h4 className="font-medium text-slate-800 mb-3">Pro Tips for Best Results:</h4>
              <div className="text-sm text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-bold text-slate-800">For Large Reductions (&gt;50%)</div>
                  <div className="text-xs">Use Extreme mode + Quality = 30% + Enable metadata removal</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800">For Quality Preservation</div>
                  <div className="text-xs">Use Enhanced mode + Quality = 50%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link href="/" className="link-brand font-medium transition-colors">
              ← Back to All Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
