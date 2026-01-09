"use client"

import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from "react"
import Link from "next/link"
import { Upload, Image as ImageIcon, Download, AlertCircle, CheckCircle, Loader2, FileText, Trash2, Eye, X, Grid, Settings, ArrowUpDown, Plus, Minus, RefreshCw } from "lucide-react"

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  dimensions?: { width: number; height: number };
}

interface PDFSettings {
  pageSize: 'auto' | 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margin: number;
  quality: number;
}

export default function ImageToPDF() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [settings, setSettings] = useState<PDFSettings>({
    pageSize: 'auto',
    orientation: 'portrait',
    margin: 10,
    quality: 85
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview URLs on unmount
  const cleanupImages = () => {
    images.forEach(image => URL.revokeObjectURL(image.preview));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter for image files
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(ext => 
        file.name.toLowerCase().endsWith(`.${ext}`)
      )
    );

    if (imageFiles.length === 0) {
      setError("Please select valid image files (JPG, PNG, GIF, BMP, WebP)");
      return;
    }

    if (imageFiles.length > 20) {
      setError("Maximum 20 images allowed");
      return;
    }

    // Check total size
    const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 25 * 1024 * 1024) {
      setError("Total file size exceeds 25MB limit");
      return;
    }

    setError(null);
    setSuccess(false);
    setPdfBlob(null);
    
    // Clean up old download URL if exists
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    // Create image objects with previews
    const newImages: ImageFile[] = [];
    
    for (const file of imageFiles) {
      try {
        const preview = URL.createObjectURL(file);
        
        // Get image dimensions
        const dimensions = await getImageDimensions(file);
        
        newImages.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          preview,
          name: file.name,
          size: file.size,
          dimensions
        });
      } catch (err) {
        console.error("Error processing image:", err);
        // Create image entry without dimensions
        newImages.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        });
      }
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setImages(images.filter(img => img.id !== id));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setImages(newImages);
  };

  const createPDFFromImages = async (): Promise<Blob> => {
    // Dynamically import pdf-lib
    const { PDFDocument, rgb } = await import('pdf-lib');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add metadata
    pdfDoc.setTitle(`Images to PDF - ${new Date().toLocaleDateString()}`);
    pdfDoc.setAuthor('AllYourDocs Image to PDF Converter');
    
    // Calculate page dimensions based on settings
    const getPageDimensions = () => {
      switch (settings.pageSize) {
        case 'a4':
          return settings.orientation === 'portrait' 
            ? { width: 595, height: 842 } // A4 portrait in points (72 dpi)
            : { width: 842, height: 595 }; // A4 landscape
        case 'letter':
          return settings.orientation === 'portrait'
            ? { width: 612, height: 792 } // Letter portrait
            : { width: 792, height: 612 }; // Letter landscape
        case 'legal':
          return settings.orientation === 'portrait'
            ? { width: 612, height: 1008 } // Legal portrait
            : { width: 1008, height: 612 }; // Legal landscape
        case 'auto':
        default:
          return settings.orientation === 'portrait'
            ? { width: 612, height: 792 } // Default to Letter portrait
            : { width: 792, height: 612 }; // Default to Letter landscape
      }
    };

    const marginPoints = settings.margin * 2.83465; // Convert mm to points (1mm = 2.83465 points)
    
    for (const image of images) {
      try {
        // Convert image file to Uint8Array
        const arrayBuffer = await image.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Embed the image in the PDF
        let pdfImage;
        const mimeType = image.file.type;
        
        if (mimeType === 'image/jpeg' || image.file.name.toLowerCase().endsWith('.jpg') || image.file.name.toLowerCase().endsWith('.jpeg')) {
          pdfImage = await pdfDoc.embedJpg(uint8Array);
        } else if (mimeType === 'image/png' || image.file.name.toLowerCase().endsWith('.png')) {
          pdfImage = await pdfDoc.embedPng(uint8Array);
        } else {
          // For other image types, try to embed as PNG
          // First, we need to convert to data URL and create a canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = image.preview;
          });
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Convert canvas to PNG data URL
          const pngDataUrl = canvas.toDataURL('image/png');
          const pngResponse = await fetch(pngDataUrl);
          const pngBuffer = await pngResponse.arrayBuffer();
          pdfImage = await pdfDoc.embedPng(new Uint8Array(pngBuffer));
        }
        
        // Calculate page size
        let pageWidth, pageHeight;
        
        if (settings.pageSize === 'auto') {
          // Auto size: use image dimensions + margins
          pageWidth = Math.min(pdfImage.width + marginPoints * 2, 1440); // Max width 20 inches
          pageHeight = Math.min(pdfImage.height + marginPoints * 2, 1440); // Max height 20 inches
        } else {
          const dimensions = getPageDimensions();
          pageWidth = dimensions.width;
          pageHeight = dimensions.height;
        }
        
        // Add a new page
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Calculate image dimensions to fit page with margins
        const availableWidth = pageWidth - marginPoints * 2;
        const availableHeight = pageHeight - marginPoints * 2;
        
        let imageWidth = pdfImage.width;
        let imageHeight = pdfImage.height;
        
        // Scale image to fit available space while maintaining aspect ratio
        const widthRatio = availableWidth / imageWidth;
        const heightRatio = availableHeight / imageHeight;
        const scaleRatio = Math.min(widthRatio, heightRatio, 1); // Don't scale up
        
        imageWidth *= scaleRatio;
        imageHeight *= scaleRatio;
        
        // Center image on page
        const x = (pageWidth - imageWidth) / 2;
        const y = (pageHeight - imageHeight) / 2;
        
        // Draw image on page
        page.drawImage(pdfImage, {
          x,
          y,
          width: imageWidth,
          height: imageHeight,
        });
        
      } catch (err) {
        console.error(`Error processing image ${image.name}:`, err);
        // Skip this image and continue with others
        continue;
      }
    }
    
    // If no pages were added (all images failed), add an error page
    if (pdfDoc.getPageCount() === 0) {
      const page = pdfDoc.addPage([595, 842]);
      page.drawText('No images could be converted to PDF.', {
        x: 50,
        y: 400,
        size: 20,
        color: rgb(0, 0, 0),
      });
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    // Clean up old download URL if exists
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      console.log(`Converting ${images.length} images to PDF...`);
      
      // Create PDF from images
      const pdfBlob = await createPDFFromImages();
      
      // Create download URL
      const url = URL.createObjectURL(pdfBlob);
      setPdfBlob(pdfBlob);
      setDownloadUrl(url);
      setSuccess(true);
      
      console.log("PDF created successfully:", pdfBlob.size, "bytes");
      
    } catch (err: any) {
      console.error("Conversion error:", err);
      
      if (err.message.includes("memory") || err.message.includes("heap")) {
        setError("File too large to process in browser. Try fewer or smaller images.");
      } else {
        setError(err.message || "Failed to convert images to PDF. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && images.length > 0) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = images.length === 1 
        ? `${images[0].name.replace(/\.[^/.]+$/, "")}.pdf` 
        : `images_${new Date().getTime()}.pdf`;
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
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const event = {
        target: { files }
      } as unknown as ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const handleReset = () => {
    // Clean up all preview URLs
    cleanupImages();
    
    setImages([]);
    setError(null);
    setSuccess(false);
    setPdfBlob(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSettings({
      pageSize: 'auto',
      orientation: 'portrait',
      margin: 10,
      quality: 85
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalSize = () => {
    return images.reduce((sum, img) => sum + img.size, 0);
  };

  const updateSetting = <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const truncateFileName = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) return name;
    const extension = name.substring(name.lastIndexOf('.'));
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 3) + '...';
    return truncated + extension;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Image to PDF Converter</h1>
            <p className="text-gray-600">
              Convert multiple images into a single PDF document
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
              <div className="w-2 h-2 rounded-full bg-pink-600 mr-2"></div>
              Client-Side • 100% Private
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload & Preview */}
            <div className="lg:col-span-2">
              {/* File Upload Area */}
              <div
                className={`border-3 border-dashed rounded-2xl transition-all duration-300 cursor-pointer mb-6 ${
                  images.length > 0 
                    ? "border-pink-400 bg-pink-50" 
                    : "border-gray-300 hover:border-pink-300 hover:bg-pink-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    images.length > 0 ? "bg-pink-100" : "bg-pink-100"
                  }`}>
                    <Upload className={`w-8 h-8 ${images.length > 0 ? "text-pink-600" : "text-pink-600"}`} />
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  {images.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-center mb-2">
                        <ImageIcon className="w-5 h-5 text-pink-600 mr-2" />
                        <div className="text-pink-600 font-semibold text-lg">
                          {images.length} image{images.length !== 1 ? 's' : ''} selected
                        </div>
                      </div>
                      <div className="text-gray-500 text-sm">
                        Total size: {formatFileSize(getTotalSize())}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-pink-600 font-medium mt-4 hover:text-pink-800 text-sm"
                      >
                        Add more images
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-pink-600 font-semibold text-lg mb-2">
                        Select images
                      </div>
                      <div className="text-gray-500">Click to browse or drag and drop</div>
                      <div className="text-gray-400 text-sm mt-2">
                        Supports: JPG, PNG, GIF, BMP, WebP • Max 20 images, 25MB total
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Grid className="w-5 h-5 mr-2 text-pink-600" />
                      Images ({images.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center ${
                          showPreview 
                            ? "bg-pink-100 text-pink-700" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreview ? 'Hide' : 'Show'} preview
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear all
                      </button>
                    </div>
                  </div>

                  {showPreview ? (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative group border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-pink-300 transition-colors"
                          >
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-3 bg-gray-50">
                              <div className="text-xs font-medium text-gray-700 truncate">
                                {truncateFileName(image.name, 20)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatFileSize(image.size)}
                                {image.dimensions?.width && (
                                  <span> • {image.dimensions.width}×{image.dimensions.height}</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Controls */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => removeImage(image.id)}
                                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <div className="absolute left-2 top-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {index > 0 && (
                                <button
                                  onClick={() => moveImage(index, 'up')}
                                  className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
                                  title="Move up"
                                >
                                  <ArrowUpDown className="w-3.5 h-3.5 rotate-90" />
                                </button>
                              )}
                              {index < images.length - 1 && (
                                <button
                                  onClick={() => moveImage(index, 'down')}
                                  className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
                                  title="Move down"
                                >
                                  <ArrowUpDown className="w-3.5 h-3.5 -rotate-90" />
                                </button>
                              )}
                            </div>
                            
                            <div className="absolute top-2 left-10 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-lg font-semibold">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500 flex items-center">
                        <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                        Use buttons to reorder images. Number indicates position in PDF.
                      </div>
                    </div>
                  ) : (
                    /* Compact List View */
                    <div className="space-y-3">
                      {images.map((image, index) => (
                        <div
                          key={image.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{truncateFileName(image.name)}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatFileSize(image.size)}
                                {image.dimensions?.width && (
                                  <span> • {image.dimensions.width}×{image.dimensions.height}px</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              {index > 0 && (
                                <button
                                  onClick={() => moveImage(index, 'up')}
                                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Move up"
                                >
                                  <ArrowUpDown className="w-4 h-4 rotate-90" />
                                </button>
                              )}
                              {index < images.length - 1 && (
                                <button
                                  onClick={() => moveImage(index, 'down')}
                                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Move down"
                                >
                                  <ArrowUpDown className="w-4 h-4 -rotate-90" />
                                </button>
                              )}
                            </div>
                            <button
                              onClick={() => removeImage(image.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Settings & Actions */}
            <div className="lg:col-span-1">
              {/* PDF Settings */}
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-pink-600" />
                  PDF Settings
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Page Size
                    </label>
                    <select
                      value={settings.pageSize}
                      onChange={(e) => updateSetting('pageSize', e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    >
                      <option value="auto">Auto (Fit to image)</option>
                      <option value="a4">A4 (210 × 297 mm)</option>
                      <option value="letter">Letter (8.5 × 11 in)</option>
                      <option value="legal">Legal (8.5 × 14 in)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Orientation
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateSetting('orientation', 'portrait')}
                        className={`px-4 py-3 rounded-xl border-2 transition-all ${
                          settings.orientation === 'portrait'
                            ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        Portrait
                      </button>
                      <button
                        onClick={() => updateSetting('orientation', 'landscape')}
                        className={`px-4 py-3 rounded-xl border-2 transition-all ${
                          settings.orientation === 'landscape'
                            ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        Landscape
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Margin
                      </label>
                      <span className="text-pink-600 font-semibold">{settings.margin}mm</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateSetting('margin', Math.max(0, settings.margin - 1))}
                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        disabled={settings.margin <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={settings.margin}
                        onChange={(e) => updateSetting('margin', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <button
                        onClick={() => updateSetting('margin', Math.min(50, settings.margin + 1))}
                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        disabled={settings.margin >= 50}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

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
                      {images.length} image{images.length !== 1 ? 's' : ''} converted to PDF!
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={uploading || images.length === 0}
                  className={`w-full px-6 py-4 font-medium rounded-lg transition-all flex items-center justify-center ${
                    uploading || images.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg hover:scale-[1.02] shadow-md"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating PDF...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Create PDF ({images.length})
                    </>
                  )}
                </button>
                
                {success && pdfBlob && (
                  <button
                    onClick={handleDownload}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] shadow-md transition-all flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </button>
                )}
                
                <button
                  onClick={handleReset}
                  className="w-full px-6 py-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset All
                </button>
              </div>

              {/* Statistics */}
              {images.length > 0 && (
                <div className="mt-6 p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-pink-600" />
                    Conversion Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Images:</span>
                      <span className="font-semibold text-gray-900">{images.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total size:</span>
                      <span className="font-semibold text-gray-900">{formatFileSize(getTotalSize())}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">PDF pages:</span>
                      <span className="font-semibold text-gray-900">{images.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Page size:</span>
                      <span className="font-semibold text-gray-900">{settings.pageSize.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Orientation:</span>
                      <span className="font-semibold text-gray-900 capitalize">{settings.orientation}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-6">✨ Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">📄</span>
                </div>
                <div>
                  <div className="font-medium text-blue-800">Real PDF Files</div>
                  <div className="text-sm text-gray-600">
                    Creates actual PDFs, not images embedded in PDF
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">🔒</span>
                </div>
                <div>
                  <div className="font-medium text-green-800">100% Private</div>
                  <div className="text-sm text-gray-600">
                    Files never leave your browser
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">⚡</span>
                </div>
                <div>
                  <div className="font-medium text-purple-800">Fast Processing</div>
                  <div className="text-sm text-gray-600">
                    Convert images to PDF in seconds
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-pink-50 rounded-xl border border-pink-200">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-600 font-bold">🔄</span>
                </div>
                <div>
                  <div className="font-medium text-pink-800">Customizable</div>
                  <div className="text-sm text-gray-600">
                    Adjust page size, margins, and orientation
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 bg-yellow-50 rounded-xl border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Important Notes
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Maximum 20 images, 25MB total for best performance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>SVG files are converted to PNG format</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>"Auto" page size creates a page that fits each image</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Large images may be scaled down to fit the page</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
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