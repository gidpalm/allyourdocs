"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Image as ImageIcon,
  Copy,
  Check,
  Eye,
  Trash2,
  Settings,
  RotateCw,
  Maximize2,
  Minimize2,
  Languages,
  FileCode,
  Shield,
  Globe,
  Brain,
  Battery,
  Clock,
  Zap
} from "lucide-react";
import { createWorker } from 'tesseract.js';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  dimensions?: { width: number; height: number };
}

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  pageInfo: string;
}

interface OCRSettings {
  language: string;
  preserveFormatting: boolean;
  includeConfidence: boolean;
  pageSegmentation: string;
  useMultiLang: boolean;
}

export default function ImageToText() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [combinedText, setCombinedText] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fullscreenText, setFullscreenText] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentImageProgress, setCurrentImageProgress] = useState(0);
  const [currentProcessingImage, setCurrentProcessingImage] = useState<string>("");
  const [settings, setSettings] = useState<OCRSettings>({
    language: "eng",
    preserveFormatting: true,
    includeConfidence: false,
    pageSegmentation: 'auto',
    useMultiLang: false,
  });
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [engineLoadProgress, setEngineLoadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const workerRef = useRef<Tesseract.Worker | null>(null);

  // Language options for Tesseract.js
  const languageOptions = [
    { code: "eng", name: "English", icon: "🇬🇧", lang: "English" },
    { code: "spa", name: "Spanish", icon: "🇪🇸", lang: "Español" },
    { code: "fra", name: "French", icon: "🇫🇷", lang: "Français" },
    { code: "deu", name: "German", icon: "🇩🇪", lang: "Deutsch" },
    { code: "ita", name: "Italian", icon: "🇮🇹", lang: "Italiano" },
    { code: "por", name: "Portuguese", icon: "🇵🇹", lang: "Português" },
    { code: "rus", name: "Russian", icon: "🇷🇺", lang: "Русский" },
    { code: "chi_sim", name: "Chinese Simplified", icon: "🇨🇳", lang: "中文" },
    { code: "jpn", name: "Japanese", icon: "🇯🇵", lang: "日本語" },
    { code: "kor", name: "Korean", icon: "🇰🇷", lang: "한국어" },
    { code: "ara", name: "Arabic", icon: "🇸🇦", lang: "العربية" },
    { code: "hin", name: "Hindi", icon: "🇮🇳", lang: "हिन्दी" },
  ];

  // Multi-language combinations for common scenarios
  const multiLanguageOptions = [
    { code: "eng+spa", name: "English + Spanish", icon: "🇬🇧🇪🇸", description: "For bilingual documents" },
    { code: "eng+fra", name: "English + French", icon: "🇬🇧🇫🇷", description: "For bilingual documents" },
    { code: "eng+deu", name: "English + German", icon: "🇬🇧🇩🇪", description: "For bilingual documents" },
    { code: "eng+chi_sim", name: "English + Chinese", icon: "🇬🇧🇨🇳", description: "For bilingual documents" },
    { code: "eng+jpn", name: "English + Japanese", icon: "🇬🇧🇯🇵", description: "For bilingual documents" },
    { code: "eng+ara", name: "English + Arabic", icon: "🇬🇧🇸🇦", description: "For bilingual documents" },
    { code: "spa+fra", name: "Spanish + French", icon: "🇪🇸🇫🇷", description: "For multilingual documents" },
    { code: "deu+fra", name: "German + French", icon: "🇩🇪🇫🇷", description: "For multilingual documents" },
  ];

  const pageSegmentationOptions = [
    { value: 'auto', label: 'Auto (OSD)', description: 'Automatic page segmentation with orientation detection' },
    { value: 'single_block', label: 'Single Block', description: 'Treat image as single text block' },
    { value: 'single_line', label: 'Single Line', description: 'Treat image as single text line' },
    { value: 'sparse_text', label: 'Sparse Text', description: 'Find as much text as possible in no particular order' },
  ];

  // Initialize Tesseract.js worker on component mount
  useEffect(() => {
    const initializeOCR = async () => {
      try {
        console.log("Initializing Tesseract.js OCR engine...");
        
        // Track loading progress manually
        const loadingInterval = setInterval(() => {
          setEngineLoadProgress(prev => {
            if (prev >= 90) {
              clearInterval(loadingInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 300);

        try {
          console.log("Creating Tesseract.js worker...");
          
          // Create worker with English language (default)
          const worker = await createWorker('eng');
          workerRef.current = worker;
          
          console.log("Worker created successfully");
          
          clearInterval(loadingInterval);
          setEngineLoadProgress(100);
          setIsEngineReady(true);
          console.log("OCR engine ready");
        } catch (loadError: any) {
          console.error("Failed to create worker:", loadError);
          setError(`Failed to initialize OCR engine: ${loadError.message}. Please refresh the page.`);
        }
        
      } catch (err: any) {
        console.error("Failed to initialize OCR engine:", err);
        setError(`Failed to initialize OCR engine: ${err.message}. Please refresh the page.`);
      }
    };

    initializeOCR();

    // Cleanup worker on component unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate().then(() => {
          console.log("Tesseract.js worker terminated");
        });
      }
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter for image files
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'].some(ext => 
        file.name.toLowerCase().endsWith(`.${ext}`)
      )
    );

    if (imageFiles.length === 0) {
      setError("Please select valid image files (JPG, PNG, GIF, BMP, WebP, TIFF)");
      return;
    }

    if (imageFiles.length > 10) {
      setError("Maximum 10 images allowed for OCR processing");
      return;
    }

    // Check total size
    const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      setError("Total file size exceeds 50MB limit");
      return;
    }

    setError(null);
    setSuccess(false);
    setResults([]);
    setCombinedText("");
    setOverallProgress(0);

    // Create image objects with previews
    const newImages: ImageFile[] = [];
    
    for (const file of imageFiles) {
      try {
        const preview = URL.createObjectURL(file);
        const dimensions = await getImageDimensions(file);
        
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          name: file.name,
          size: file.size,
          dimensions
        });
      } catch (err) {
        console.error("Error processing image:", err);
      }
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
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
    // Remove corresponding result if exists
    const index = images.findIndex(img => img.id === id);
    if (index !== -1 && results[index]) {
      const newResults = [...results];
      newResults.splice(index, 1);
      setResults(newResults);
    }
  };

  const processSingleImage = async (
    image: ImageFile, 
    index: number, 
    total: number
  ): Promise<OCRResult> => {
    if (!workerRef.current) {
      throw new Error("OCR engine not initialized");
    }

    const startTime = performance.now();
    let progress = 0;
    
    try {
      setCurrentProcessingImage(image.name);
      
      // Set up progress monitoring
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + 5, 90);
        setCurrentImageProgress(progress);
      }, 100);

      // Determine the language to use
      let languageToUse = settings.language;
      
      // If multi-language mode is enabled, use the combined language string
      if (settings.useMultiLang) {
        languageToUse = settings.language;
      }

      // Recreate worker if language changed or multi-language mode
      if (languageToUse !== 'eng' || settings.useMultiLang) {
        console.log(`Switching to language: ${languageToUse}`);
        await workerRef.current.terminate();
        
        // For multi-language, we need to handle it differently
        if (settings.useMultiLang && languageToUse.includes('+')) {
          // For multi-language, create with first language and load additional
          const langs = languageToUse.split('+');
          const worker = await createWorker(langs[0]);
          for (let i = 1; i < langs.length; i++) {
            await worker.loadLanguage(langs[i]);
          }
          await worker.initialize(langs.join('+'));
          workerRef.current = worker;
        } else {
          // Single language
          const worker = await createWorker(languageToUse);
          workerRef.current = worker;
        }
      }

      // Set parameters for best document structure preservation
      await workerRef.current.setParameters({
        tessedit_pageseg_mode: settings.pageSegmentation === 'single_block' ? 6 : 
                              settings.pageSegmentation === 'single_line' ? 7 :
                              settings.pageSegmentation === 'sparse_text' ? 11 : 3, // 3 = AUTO_OSD
        preserve_interword_spaces: settings.preserveFormatting ? '1' : '0',
        tessedit_char_whitelist: '', // Allow all characters
        tessedit_ocr_engine_mode: 3, // Default + LSTM mode
      });

      // Perform OCR
      const result = await workerRef.current.recognize(image.file);

      clearInterval(progressInterval);
      setCurrentImageProgress(100);

      const processingTime = Math.round(performance.now() - startTime);
      
      return {
        text: result.data.text,
        confidence: result.data.confidence,
        language: settings.useMultiLang ? getMultiLanguageName(languageToUse) : getLanguageName(languageToUse),
        processingTime,
        pageInfo: `Image ${index + 1} of ${total}`,
      };
      
    } catch (err: any) {
      console.error(`Error processing ${image.name}:`, err);
      throw new Error(`Failed to process ${image.name}: ${err.message}`);
    } finally {
      setCurrentImageProgress(0);
      setCurrentProcessingImage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError("Please select at least one image");
      return;
    }

    if (!isEngineReady) {
      setError("OCR engine is still loading. Please wait...");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setResults([]);
    setCombinedText("");
    setOverallProgress(0);
    setCurrentImageProgress(0);

    try {
      const allResults: OCRResult[] = [];
      let combinedText = "";
      
      // Process images sequentially
      for (let i = 0; i < images.length; i++) {
        try {
          // Update overall progress
          const newProgress = Math.round((i / images.length) * 100);
          setOverallProgress(newProgress);
          
          const result = await processSingleImage(images[i], i, images.length);
          allResults.push(result);
          
          // Build combined text WITHOUT headers - just the extracted text
          combinedText += result.text;
          
          // Add spacing between images if not the last one
          if (i < images.length - 1) {
            combinedText += "\n\n";
          }
          
        } catch (err: any) {
          console.error(`Failed to process ${images[i].name}:`, err);
          
          const errorResult: OCRResult = {
            text: `ERROR: ${err.message}`,
            confidence: 0,
            language: settings.useMultiLang ? getMultiLanguageName(settings.language) : getLanguageName(settings.language),
            processingTime: 0,
            pageInfo: `Image ${i + 1} of ${images.length}`,
          };
          
          allResults.push(errorResult);
          combinedText += `ERROR processing ${images[i].name}: ${err.message}\n\n`;
          
          if (i < images.length - 1) {
            combinedText += "\n\n";
          }
        }
      }
      
      setOverallProgress(100);
      setResults(allResults);
      setCombinedText(combinedText.trim());
      setSuccess(true);
      
    } catch (err: any) {
      console.error("OCR processing error:", err);
      setError(err.message || "Failed to extract text from images. Please try again.");
    } finally {
      setUploading(false);
      setOverallProgress(0);
      setCurrentImageProgress(0);
    }
  };

  const copyToClipboard = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (combinedText) {
      navigator.clipboard.writeText(combinedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsText = () => {
    if (!combinedText) return;
    
    const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted_text_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsJSON = () => {
    if (!results.length) return;
    
    const jsonData = {
      processedAt: new Date().toISOString(),
      settings: settings,
      images: images.map(img => ({
        name: img.name,
        size: img.size,
        dimensions: img.dimensions
      })),
      results: results.map((result, index) => ({
        image: images[index]?.name,
        text: result.text,
        confidence: result.confidence,
        processingTime: result.processingTime,
        language: result.language,
        pageInfo: result.pageInfo
      }))
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr_results_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const event = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const handleReset = () => {
    // Clean up all preview URLs
    images.forEach(image => URL.revokeObjectURL(image.preview));
    
    setImages([]);
    setError(null);
    setSuccess(false);
    setResults([]);
    setCombinedText("");
    setCopied(false);
    setShowPreview(false);
    setFullscreenText(false);
    setOverallProgress(0);
    setCurrentImageProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalSize = () => {
    return images.reduce((sum, img) => sum + img.size, 0);
  };

  const updateSetting = <K extends keyof OCRSettings>(key: K, value: OCRSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getLanguageName = (code: string) => {
    const lang = languageOptions.find(l => l.code === code);
    return lang ? lang.name : "English";
  };

  const getLanguageIcon = (code: string) => {
    const lang = languageOptions.find(l => l.code === code);
    return lang ? lang.icon : "🇬🇧";
  };

  const getMultiLanguageName = (code: string) => {
    if (!code.includes('+')) return getLanguageName(code);
    const multiLang = multiLanguageOptions.find(l => l.code === code);
    return multiLang ? multiLang.name : code.split('+').map(lang => getLanguageName(lang)).join(' + ');
  };

  const getMultiLanguageIcon = (code: string) => {
    if (!code.includes('+')) return getLanguageIcon(code);
    const multiLang = multiLanguageOptions.find(l => l.code === code);
    return multiLang ? multiLang.icon : "🌐";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Image to Text Converter (OCR)</h1>
            <p className="text-gray-600">
              Extract text from images while preserving original document structure
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
              <div className="w-2 h-2 rounded-full bg-green-600 mr-2 animate-pulse"></div>
              {isEngineReady ? "OCR Engine Ready" : "Loading OCR Engine..."}
            </div>
          </div>

          {/* Engine Loading Indicator */}
          {!isEngineReady && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-4" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 mb-2">Loading Tesseract.js OCR Engine</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Downloading OCR engine and language data. This only happens once.
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${engineLoadProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-600 mt-2 text-right">
                    {engineLoadProgress}% loaded
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload & Preview */}
            <div className="lg:col-span-2">
              {/* File Upload Area */}
              <div
                className={`border-3 border-dashed rounded-2xl transition-all duration-300 cursor-pointer mb-6 ${
                  images.length > 0 
                    ? "border-blue-400 bg-blue-50" 
                    : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                }`}
                onClick={() => document.getElementById("file-upload")?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    images.length > 0 ? "bg-blue-100" : "bg-blue-100"
                  }`}>
                    <Upload className={`w-8 h-8 ${images.length > 0 ? "text-blue-600" : "text-blue-600"}`} />
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
                        <ImageIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <div className="text-blue-600 font-semibold text-lg">
                          {images.length} image{images.length !== 1 ? 's' : ''} selected
                        </div>
                      </div>
                      <div className="text-gray-500 text-sm">
                        Total size: {formatFileSize(getTotalSize())}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById("file-upload")?.click();
                        }}
                        className="text-blue-600 font-medium mt-4 hover:text-blue-800 text-sm"
                      >
                        Add more images
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-blue-600 font-semibold text-lg mb-2">
                        Select images for OCR
                      </div>
                      <div className="text-gray-500">Click to browse or drag and drop</div>
                      <div className="text-gray-400 text-sm mt-2">
                        Supports: JPG, PNG, GIF, BMP, WebP, TIFF • Max 10 images, 50MB total
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Selected Images ({images.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center ${
                          showPreview 
                            ? "bg-blue-100 text-blue-700" 
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

                  {showPreview && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative group border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-blue-300 transition-colors"
                          >
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-3 bg-gray-50">
                              <div className="text-xs font-medium text-gray-700 truncate">
                                {image.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatFileSize(image.size)}
                                {image.dimensions?.width && (
                                  <span> • {image.dimensions.width}×{image.dimensions.height}</span>
                                )}
                              </div>
                              {results[index] && (
                                <div className="mt-1 text-xs font-medium text-green-600">
                                  ✓ {results[index].confidence?.toFixed(1)}% confidence
                                </div>
                              )}
                            </div>
                            
                            {/* Remove button */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => removeImage(image.id)}
                                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            {/* Image number */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-lg font-semibold">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image List (Compact View) */}
                  {!showPreview && (
                    <div className="space-y-3">
                      {images.map((image, index) => (
                        <div
                          key={image.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                  src={image.preview}
                                  alt={image.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{image.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {formatFileSize(image.size)}
                                  {image.dimensions?.width && (
                                    <span> • {image.dimensions.width}×{image.dimensions.height}px</span>
                                  )}
                                </div>
                                {results[index] && (
                                  <div className="mt-2">
                                    <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                      <Check className="w-3 h-3 mr-1" />
                                      OCR complete ({results[index].confidence?.toFixed(1)}% confidence)
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeImage(image.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* OCR Progress */}
              {(uploading || currentProcessingImage) && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {currentProcessingImage ? `Processing: ${currentProcessingImage}` : "Processing Images..."}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-blue-700">Overall Progress</span>
                        <span className="font-medium text-blue-800">{overallProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${overallProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {currentProcessingImage && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-blue-700">Current Image</span>
                          <span className="font-medium text-blue-800">{currentImageProgress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${currentImageProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-blue-700">
                      <div className="font-medium mb-2">Processing with Tesseract.js:</div>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Preserving original document structure and formatting</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>{settings.useMultiLang ? 'Multi-language mode' : 'Single language mode'}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Processing 100% locally in your browser</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Settings & Actions */}
            <div className="lg:col-span-1">
              {/* OCR Settings */}
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  OCR Settings
                </h3>
                
                <div className="space-y-6">
                  {/* Multi-language Toggle */}
                  <div className="mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                      <input
                        type="checkbox"
                        checked={settings.useMultiLang}
                        onChange={(e) => updateSetting('useMultiLang', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={uploading}
                      />
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">
                          Multi-language Mode
                        </span>
                      </div>
                    </label>
                    <div className="text-xs text-gray-600 mt-2 pl-10">
                      Enable this for documents with multiple languages or unknown languages
                    </div>
                  </div>
                  
                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {settings.useMultiLang ? 'Language Combination' : 'Language'}
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={uploading}
                    >
                      {settings.useMultiLang ? (
                        <>
                          <optgroup label="Common Combinations">
                            {multiLanguageOptions.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.icon} {lang.name}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Custom Combinations">
                            <option value="eng+spa+fra">🇬🇧🇪🇸🇫🇷 English + Spanish + French</option>
                            <option value="eng+deu+fra">🇬🇧🇩🇪🇫🇷 English + German + French</option>
                          </optgroup>
                        </>
                      ) : (
                        languageOptions.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.icon} {lang.name}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="text-xs text-gray-500 mt-2 flex items-center">
                      <span className="mr-2">
                        {settings.useMultiLang ? getMultiLanguageIcon(settings.language) : getLanguageIcon(settings.language)}
                      </span>
                      <span>
                        {settings.useMultiLang ? getMultiLanguageName(settings.language) : getLanguageName(settings.language)}
                      </span>
                      {settings.useMultiLang && multiLanguageOptions.find(l => l.code === settings.language)?.description && (
                        <span className="ml-2 text-gray-400">
                          • {multiLanguageOptions.find(l => l.code === settings.language)?.description}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.preserveFormatting}
                        onChange={(e) => updateSetting('preserveFormatting', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={uploading}
                      />
                      <span className="text-sm text-gray-700">
                        Preserve document structure
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.includeConfidence}
                        onChange={(e) => updateSetting('includeConfidence', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={uploading}
                      />
                      <span className="text-sm text-gray-700">
                        Show confidence scores
                      </span>
                    </label>
                  </div>
                  
                  {/* Tips for Unknown Languages */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="text-sm text-amber-800">
                      <div className="font-medium mb-2 flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Tips for unknown languages:
                      </div>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Use <strong>Multi-language Mode</strong> with language combinations</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Try <strong>English + Spanish</strong> for Latin script languages</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>For Asian languages, use appropriate combinations</span>
                        </li>
                      </ul>
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
                    <div className="font-medium">OCR completed successfully!</div>
                    <div className="text-sm mt-1">
                      Extracted text from {images.length} image{images.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={uploading || images.length === 0 || !isEngineReady}
                  className={`w-full px-6 py-4 font-medium rounded-lg transition-all flex items-center justify-center ${
                    uploading || images.length === 0 || !isEngineReady
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:scale-[1.02] shadow-md"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing... ({overallProgress}%)
                    </>
                  ) : !isEngineReady ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading Engine...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Extract Text ({images.length})
                    </>
                  )}
                </button>
                
                {success && combinedText && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Text
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={downloadAsText}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        .TXT File
                      </button>
                    </div>
                    
                    <button
                      onClick={downloadAsJSON}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                    >
                      <FileCode className="w-4 h-4 mr-2" />
                      Download as JSON
                    </button>
                    
                    <button
                      onClick={() => setFullscreenText(!fullscreenText)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                    >
                      {fullscreenText ? (
                        <>
                          <Minimize2 className="w-4 h-4 mr-2" />
                          Exit Fullscreen
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-4 h-4 mr-2" />
                          Fullscreen View
                        </>
                      )}
                    </button>
                  </>
                )}
                
                <button
                  onClick={handleReset}
                  className="w-full px-6 py-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <RotateCw className="w-5 h-5 mr-2" />
                  Start Over
                </button>
              </div>

              {/* Statistics */}
              {images.length > 0 && (
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    OCR Summary
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
                      <span className="text-gray-600">Language:</span>
                      <span className="font-semibold text-gray-900 flex items-center">
                        <span className="mr-2">
                          {settings.useMultiLang ? getMultiLanguageIcon(settings.language) : getLanguageIcon(settings.language)}
                        </span>
                        {settings.useMultiLang ? getMultiLanguageName(settings.language) : getLanguageName(settings.language)}
                      </span>
                    </div>
                    {results.length > 0 && (
                      <>
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Avg. confidence:</span>
                            <span className="font-semibold text-green-600">
                              {(
                                results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
                              ).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-600">Total characters:</span>
                            <span className="font-semibold text-gray-900">
                              {combinedText.length.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Text Display */}
          {combinedText && (
            <div className={`mt-8 ${fullscreenText ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : ''}`}>
              {fullscreenText && (
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setFullscreenText(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Extracted Text
                </h3>
                <div className="text-sm text-gray-500 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium mr-2">
                    {combinedText.length.toLocaleString()} characters
                  </span>
                  {results.length > 0 && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      Avg. {(
                        results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
                      ).toFixed(1)}% confidence
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm ${
                fullscreenText ? 'h-[calc(100vh-120px)]' : ''
              }`}>
                <textarea
                  ref={textAreaRef}
                  value={combinedText}
                  readOnly
                  className={`w-full bg-white p-4 font-mono text-sm focus:outline-none resize-none ${
                    fullscreenText ? 'h-full' : 'h-96'
                  }`}
                  spellCheck={false}
                />
              </div>
              
              {/* Individual Results */}
              {results.length > 1 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Individual Image Results
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((result, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900 flex items-center">
                              <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-semibold mr-3">
                                {index + 1}
                              </div>
                              <span className="truncate">{images[index]?.name}</span>
                            </div>
                            {result.confidence && (
                              <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                result.confidence >= 90 ? "bg-green-100 text-green-800" :
                                result.confidence >= 70 ? "bg-yellow-100 text-yellow-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {result.confidence.toFixed(1)}% confidence
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-2 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{result.processingTime}ms • </span>
                            <span className="ml-2">🌐</span>
                            <span className="ml-1">{result.language}</span>
                          </div>
                        </div>
                        <div className="p-4 max-h-48 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 leading-relaxed">
                            {result.text || "No text extracted"}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Simple Footer */}
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