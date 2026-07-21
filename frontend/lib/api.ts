// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Constants for file size limits
export const FILE_LIMITS = {
  MAX_SINGLE_FILE_SIZE: 25 * 1024 * 1024,
  MAX_TOTAL_UPLOAD_SIZE: 100 * 1024 * 1024,
  MAX_FILES_COUNT: 20,
  MAX_IMAGES_COUNT: 20,
  MAX_MERGE_FILES: 20,
} as const;

export const ALLOWED_FILE_TYPES = {
  PDF: ['application/pdf', '.pdf'],
  WORD: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-word.document.macroEnabled.12',
    'application/vnd.ms-word.template.macroEnabled.12',
    'text/plain',
    'application/rtf',
    '.doc',
    '.docx',
    '.txt',
    '.rtf'
  ],
  IMAGES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp'
  ]
} as const;

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateFileSize = (file: File, maxSize: number = FILE_LIMITS.MAX_SINGLE_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(file.type) || allowedTypes.includes(fileExtension || '');
};

export const validateMultipleFiles = (
  files: File[], 
  maxCount: number = FILE_LIMITS.MAX_FILES_COUNT, 
  maxTotalSize: number = FILE_LIMITS.MAX_TOTAL_UPLOAD_SIZE
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (files.length > maxCount) {
    errors.push(`Maximum ${maxCount} files allowed. You selected ${files.length} files.`);
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalSize) {
    errors.push(`Total file size exceeds ${formatFileSize(maxTotalSize)} limit. Current total: ${formatFileSize(totalSize)}`);
  }

  files.forEach((file) => {
    if (!validateFileSize(file)) {
      errors.push(`File "${file.name}" exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit. Size: ${formatFileSize(file.size)}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting helper for API calls
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkClientRateLimit = (endpoint: string): { success: boolean; remaining?: number; resetTime?: number } => {
  const now = Date.now();
  const windowMs = parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS || '60000');
  const maxRequests = parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_REQUESTS || '10');
  const key = `api:${endpoint}`;

  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  rateLimitStore.set(key, entry);
  return { success: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
};

// Helper to make API calls with rate limiting
const makeApiCall = async <T>(
  endpoint: string, 
  options: RequestInit
): Promise<T> => {
  // Check rate limit before making the call
  const rateLimit = checkClientRateLimit(endpoint);
  
  if (!rateLimit.success) {
    throw new Error(`Rate limit exceeded. Please wait before making more requests.`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Helper for file downloads with rate limiting
const makeFileApiCall = async (
  endpoint: string, 
  formData: FormData
): Promise<Blob> => {
  const rateLimit = checkClientRateLimit(endpoint);
  
  if (!rateLimit.success) {
    throw new Error(`Rate limit exceeded. Please wait before making more requests.`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return await response.blob();
  } catch (error) {
    throw error;
  }
};

// Main API functions with rate limiting
export const api = {
  mergePDFs: async (files: File[]) => {
    const validation = validateMultipleFiles(files, FILE_LIMITS.MAX_MERGE_FILES);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const formData = new FormData();
    files.forEach(file => formData.append("pdfs", file));
    
    return await makeFileApiCall("/merge-pdf", formData);
  },

  pdfToWord: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    
    return await makeFileApiCall("/pdf-to-word", formData);
  },

  wordToPDF: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("docx", file);
    
    return await makeFileApiCall("/word-to-pdf", formData);
  },

  extractText: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    
    return await makeApiCall<{ text: string }>("/extract-text", {
      method: "POST",
      body: formData,
    });
  },

  detectPDFType: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    
    return await makeApiCall<{ type: string }>("/detect-pdf-type", {
      method: "POST",
      body: formData,
    });
  },

  splitPDF: async (file: File, ranges: string) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("ranges", ranges);
    
    return await makeFileApiCall("/split-pdf-ranges", formData);
  },

  compressPDF: async (file: File, quality: number = 70) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("quality", quality.toString());
    
    return await makeFileApiCall("/compress-pdf", formData);
  },

  imagesToPDF: async (files: File[]) => {
    const validation = validateMultipleFiles(files, FILE_LIMITS.MAX_IMAGES_COUNT);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    
    return await makeFileApiCall("/image-to-pdf", formData);
  },

  imageToText: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("image", file);
    
    return await makeApiCall<{ text: string }>("/image-to-text", {
      method: "POST",
      body: formData,
    });
  },

  rearrangePDF: async (file: File, newOrder: number[]) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("newOrder", JSON.stringify(newOrder));
    
    return await makeFileApiCall("/rearrange-pdf", formData);
  },

  // Batch operations with rate limiting
  batchWordToPDF: async (files: File[]) => {
    const validation = validateMultipleFiles(files, FILE_LIMITS.MAX_FILES_COUNT);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const results: { fileName: string; blob: Blob | null; error?: string }[] = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("docx", file);
        
        const blob = await makeFileApiCall("/word-to-pdf", formData);
        results.push({ fileName: file.name, blob });
      } catch (error: any) {
        results.push({ 
          fileName: file.name, 
          blob: null, 
          error: error.message || "Unknown error" 
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  },

  batchPDFToWord: async (files: File[]) => {
    const validation = validateMultipleFiles(files, FILE_LIMITS.MAX_FILES_COUNT);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const results: { fileName: string; blob: Blob | null; error?: string }[] = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("pdf", file);
        
        const blob = await makeFileApiCall("/pdf-to-word", formData);
        results.push({ fileName: file.name, blob });
      } catch (error: any) {
        results.push({ 
          fileName: file.name, 
          blob: null, 
          error: error.message || "Unknown error" 
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  },

  batchCompressPDF: async (files: File[], quality: number = 70) => {
    const validation = validateMultipleFiles(files, FILE_LIMITS.MAX_FILES_COUNT);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const results: { fileName: string; blob: Blob | null; error?: string }[] = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("quality", quality.toString());
        
        const blob = await makeFileApiCall("/compress-pdf", formData);
        results.push({ fileName: file.name, blob });
      } catch (error: any) {
        results.push({ 
          fileName: file.name, 
          blob: null, 
          error: error.message || "Unknown error" 
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
};

// Download utilities
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const downloadMultipleFiles = (files: { name: string; blob: Blob }[]) => {
  files.forEach(file => {
    if (file.blob) {
      downloadBlob(file.blob, file.name);
    }
  });
};

export const batchDownloadMultiple = async (files: { name: string; blob: Blob }[]) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.blob) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      downloadBlob(file.blob, file.name);
    }
  }
};

export const createZipFromFiles = async (files: { name: string; blob: Blob }[]): Promise<Blob> => {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    files.forEach(file => {
      if (file.blob) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        zip.file(cleanName, file.blob);
      }
    });
    
    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6
      }
    });
    
    return zipBlob;
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw new Error('Failed to create ZIP file. Please try downloading files individually.');
  }
};

export const batchDownloadAsZip = async (
  files: { name: string; blob: Blob }[], 
  zipName: string = "downloads.zip"
): Promise<boolean> => {
  try {
    const zipBlob = await createZipFromFiles(files);
    downloadBlob(zipBlob, zipName);
    return true;
  } catch (error) {
    console.error('Error downloading ZIP:', error);
    
    try {
      await batchDownloadMultiple(files);
      return false;
    } catch (fallbackError) {
      console.error('Fallback download also failed:', fallbackError);
      throw new Error('Failed to download files. Please try downloading individually.');
    }
  }
};

export const getFileInfo = (file: File) => {
  return {
    name: file.name,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleString(),
  };
};

export const filterFilesByType = (files: File[], allowedTypes: string[]): File[] => {
  return files.filter(file => validateFileType(file, allowedTypes));
};

export const calculateTotalSize = (files: File[]): number => {
  return files.reduce((total, file) => total + file.size, 0);
};

export const formatFileList = (files: File[]): string => {
  if (files.length === 0) return 'No files selected';
  if (files.length === 1) return files[0].name;
  if (files.length <= 3) return files.map(f => f.name).join(', ');
  return `${files.length} files selected`;
};

export interface FileConversionResult {
  fileName: string;
  blob: Blob | null;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileInfo {
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  lastModified: string;
}

export default {
  api,
  FILE_LIMITS,
  ALLOWED_FILE_TYPES,
  formatFileSize,
  validateFileSize,
  validateFileType,
  validateMultipleFiles,
  downloadBlob,
  downloadMultipleFiles,
  batchDownloadMultiple,
  createZipFromFiles,
  batchDownloadAsZip,
  getFileInfo,
  filterFilesByType,
  calculateTotalSize,
  formatFileList,
};