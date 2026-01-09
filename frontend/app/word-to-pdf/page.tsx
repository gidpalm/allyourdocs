// app/word-to-pdf/page.tsx - COMPLETE FIXED VERSION
"use client";

import { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { Download, AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react';

// Import html2canvas dynamically to avoid SSR issues
let html2canvas: any = null;
if (typeof window !== 'undefined') {
  import('html2canvas').then(module => {
    html2canvas = module.default;
  });
}

export default function WordToPDF() {
  const [converting, setConverting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [conversionTime, setConversionTime] = useState<number | null>(null);
  
  const tempContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up download URL on unmount
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setError(null);
    setSuccess(false);
    setPdfBlob(null);
    setConversionTime(null);
    
    // Clean up old download URL
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const convertToPDF = async () => {
    if (!file || !html2canvas) return;
    
    setConverting(true);
    setError(null);
    setSuccess(false);
    setConversionTime(null);
    
    const startTime = Date.now();
    
    try {
      console.log('Starting conversion...');
      
      // Step 1: Convert Word to HTML
      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded, converting to HTML...');
      
      const result = await mammoth.convertToHtml({ arrayBuffer });
      console.log('Word converted to HTML successfully');
      
      // Step 2: Clean HTML to avoid CSS issues
      const cleanedHTML = cleanHTML(result.value);
      
      // Step 3: Create temporary container
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-conversion-container';
      tempDiv.style.cssText = `
        position: fixed;
        left: -10000px;
        top: -10000px;
        width: 800px;
        min-height: 100px;
        padding: 40px;
        background: white;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12pt;
        line-height: 1.5;
        color: black;
        box-sizing: border-box;
      `;
      
      // Add simple CSS reset to avoid CSS parsing errors
      tempDiv.innerHTML = `
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif !important;
            color: #000000 !important;
            background: white !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
          }
          th, td {
            border: 1px solid #cccccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0 !important;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 10px auto;
          }
          p {
            margin: 8px 0;
          }
          h1, h2, h3, h4, h5, h6 {
            margin: 16px 0 8px 0;
            font-weight: bold;
          }
          ul, ol {
            margin: 8px 0 8px 20px;
          }
        </style>
        <div style="width: 100%;">${cleanedHTML}</div>
      `;
      
      document.body.appendChild(tempDiv);
      console.log('Temporary container created');
      
      // Step 4: Convert to canvas with safe options
      try {
        const canvas = await html2canvas(tempDiv, {
          scale: 1.5,
          useCORS: false,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
        });
        
        console.log('Canvas created successfully');
        
        // Step 5: Create PDF with PROPER pagination
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 190; // A4 width minus margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Calculate how many pages we need
        const pageHeight = 297; // A4 height in mm
        const margin = 10; // Top/bottom margin
        const usablePageHeight = pageHeight - (2 * margin);
        
        let totalHeight = imgHeight;
        let yPosition = 0;
        let pageNumber = 0;
        
        while (yPosition < totalHeight) {
          if (pageNumber > 0) {
            pdf.addPage();
          }
          
          // Calculate how much of the image fits on this page
          const remainingHeight = totalHeight - yPosition;
          const heightOnThisPage = Math.min(remainingHeight, usablePageHeight);
          
          // Calculate source crop for this page
          const sourceY = (yPosition / imgHeight) * canvas.height;
          const sourceHeight = (heightOnThisPage / imgHeight) * canvas.height;
          
          // Create a temporary canvas for this page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');
          
          if (ctx) {
            // Draw only the portion needed for this page
            ctx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
            
            // Add to PDF
            pdf.addImage(
              pageCanvas.toDataURL('image/png'),
              'PNG',
              margin,
              margin,
              imgWidth,
              heightOnThisPage
            );
          }
          
          yPosition += heightOnThisPage;
          pageNumber++;
        }
        
        console.log(`PDF created with ${pageNumber} pages`);
        
        // Step 6: Save PDF as Blob
        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        
        setPdfBlob(pdfBlob);
        setDownloadUrl(url);
        setSuccess(true);
        setConversionTime(Date.now() - startTime);
        
        // Clean up
        document.body.removeChild(tempDiv);
        
        // Show success alert
        alert(`✅ Conversion successful! ${pageNumber} page${pageNumber !== 1 ? 's' : ''} created. Click "Download PDF" to save.`);
        
      } catch (canvasError: any) {
        console.error('Canvas conversion error:', canvasError);
        
        // Fallback: Create simple text-based PDF
        console.log('Trying fallback text conversion...');
        await createTextOnlyPDF(result.value, file.name);
      }
      
    } catch (error: any) {
      console.error('Conversion failed:', error);
      setError(`Conversion failed: ${error.message || 'Unknown error'}. Try a simpler document.`);
    } finally {
      setConverting(false);
    }
  };

  // Helper function to clean HTML
  const cleanHTML = (html: string): string => {
    // Remove problematic CSS
    let cleaned = html
      .replace(/color:\s*lab\([^)]+\)/gi, 'color: #000000')
      .replace(/background:\s*lab\([^)]+\)/gi, 'background: #ffffff')
      .replace(/rgb\([^)]+\)/gi, (match) => {
        const matches = match.match(/\d+/g);
        if (matches && matches.length >= 3) {
          const r = parseInt(matches[0]);
          const g = parseInt(matches[1]);
          const b = parseInt(matches[2]);
          return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        }
        return match;
      })
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/class="[^"]*"/gi, '')
      .replace(/style="[^"]*"/gi, '');
    
    return cleaned;
  };

  // Fallback: Create text-only PDF
  const createTextOnlyPDF = async (html: string, filename: string) => {
    // Extract text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(text, 180);
    
    let y = 20;
    const lineHeight = 7;
    
    for (let i = 0; i < lines.length; i++) {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(lines[i], 10, y);
      y += lineHeight;
    }
    
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    setPdfBlob(pdfBlob);
    setDownloadUrl(url);
    setSuccess(true);
    setConversionTime(Date.now() - Date.now()); // Rough estimate
    
    alert('✅ Document converted to text-based PDF (images not preserved). Click "Download PDF" to save.');
  };

  const handleDownload = () => {
    if (downloadUrl && file) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setPdfBlob(null);
    setConversionTime(null);
    
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
              <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Word to PDF Converter</h1>
            <p className="text-gray-600 text-sm md:text-base">
              Convert Word documents to PDF while preserving formatting
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <div
              className={`border-3 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="text-center py-8 md:py-12">
                <input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {file ? (
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <div className="text-green-600 font-semibold text-lg truncate max-w-xs">{file.name}</div>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {formatFileSize(file.size)} • Ready to convert
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('file-input')?.click();
                      }}
                      className="text-blue-600 font-medium mt-4 hover:text-blue-800 text-sm"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-blue-600 font-semibold text-lg mb-2">Select a Word file</div>
                    <div className="text-gray-500">Click to browse or drag and drop</div>
                    <div className="text-gray-400 text-sm mt-2">
                      Supports: .doc, .docx • No file size limit
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Conversion Error</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Conversion successful!</div>
                <div className="text-sm mt-1">
                  PDF is ready to download.
                  {conversionTime && (
                    <span className="ml-2">Processed in {formatTime(conversionTime)}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={convertToPDF}
              disabled={!file || converting || !html2canvas}
              className={`flex-1 px-6 py-4 font-medium rounded-lg transition-all flex items-center justify-center ${
                !file || converting || !html2canvas
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-[1.02] shadow-md'
              }`}
            >
              {converting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Converting...
                </>
              ) : !html2canvas ? (
                'Loading converter...'
              ) : (
                'Convert to PDF'
              )}
            </button>
            
            {success && pdfBlob && (
              <button
                onClick={handleDownload}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] shadow-md transition-all flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </button>
            )}
            
            <button
              onClick={handleReset}
              className="px-6 py-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Reset
            </button>
          </div>

          {/* Conversion Details */}
          {success && pdfBlob && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 truncate max-w-xs">
                      {file?.name.replace(/\.[^/.]+$/, '')}.pdf
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatFileSize(pdfBlob.size)} • Ready to download
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (downloadUrl) {
                        window.open(downloadUrl, '_blank');
                      }
                    }}
                    className="flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 px-6 py-3 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    Preview
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-10 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Preserves images and diagrams</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Maintains tables and borders</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Keeps basic text formatting</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Works entirely in your browser</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>No file size limits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Files never leave your computer</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hidden container for temp conversion */}
          <div ref={tempContainerRef} className="hidden"></div>
        </div>
      </div>
    </div>
  );
}