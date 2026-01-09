const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Constants for file size limits
export const FILE_LIMITS = {
  MAX_SINGLE_FILE_SIZE: 25 * 1024 * 1024, // 25MB per file
  MAX_TOTAL_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB total for multiple files
  MAX_FILES_COUNT: 20, // Maximum number of files users can upload
  MAX_IMAGES_COUNT: 20, // Maximum number of images
  MAX_MERGE_FILES: 20, // Maximum number of PDFs for merging
} as const;

// Allowed file types
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

  // Check file count
  if (files.length > maxCount) {
    errors.push(`Maximum ${maxCount} files allowed. You selected ${files.length} files.`);
  }

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalSize) {
    errors.push(`Total file size exceeds ${formatFileSize(maxTotalSize)} limit. Current total: ${formatFileSize(totalSize)}`);
  }

  // Check individual file sizes
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

// Helper to chunk files for large uploads
export const chunkFiles = (files: File[], chunkSize: number = 5): File[][] => {
  const chunks: File[][] = [];
  for (let i = 0; i < files.length; i += chunkSize) {
    chunks.push(files.slice(i, i + chunkSize));
  }
  return chunks;
};

// Main API functions
export const api = {
  // Merge PDFs - Now supports up to 20 files
  mergePDFs: async (files: File[]) => {
    const validation = validateMultipleFiles(files, FILE_LIMITS.MAX_MERGE_FILES);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const formData = new FormData();
    files.forEach(file => formData.append("pdfs", file));
    
    const response = await fetch(`${API_BASE_URL}/merge-pdf`, {
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
      throw new Error(errorData.error || "Failed to merge PDFs");
    }
    
    return await response.blob();
  },

  // PDF to Word - Single file
  pdfToWord: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    
    const response = await fetch(`${API_BASE_URL}/pdf-to-word`, {
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
      throw new Error(errorData.error || "Failed to convert PDF to Word");
    }
    
    return await response.blob();
  },

  // Word to PDF - Single file
  wordToPDF: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("docx", file);
    
    const response = await fetch(`${API_BASE_URL}/word-to-pdf`, {
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
      throw new Error(errorData.error || "Failed to convert Word to PDF");
    }
    
    return await response.blob();
  },

  // Extract Text - Single file
  extractText: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    
    const response = await fetch(`${API_BASE_URL}/extract-text`, {
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
      throw new Error(errorData.error || "Failed to extract text");
    }
    
    return await response.json();
  },

  // Detect PDF type - Single file
  detectPDFType: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    
    const response = await fetch(`${API_BASE_URL}/detect-pdf-type`, {
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
      throw new Error(errorData.error || "Failed to detect PDF type");
    }
    
    return await response.json();
  },

  // Split PDF - Single file
  splitPDF: async (file: File, ranges: string) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("ranges", ranges);
    
    const response = await fetch(`${API_BASE_URL}/split-pdf-ranges`, {
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
      throw new Error(errorData.error || "Failed to split PDF");
    }
    
    return await response.blob();
  },

  // Compress PDF - Single file
  compressPDF: async (file: File, quality: number = 70) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("quality", quality.toString());
    
    const response = await fetch(`${API_BASE_URL}/compress-pdf`, {
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
      throw new Error(errorData.error || "Failed to compress PDF");
    }
    
    return await response.blob();
  },

  // Images to PDF - Now supports up to 20 images
  imagesToPDF: async (files: File[]) => {
    const validation = validateMultipleFiles(files, FILE_LIMITS.MAX_IMAGES_COUNT);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    
    const response = await fetch(`${API_BASE_URL}/image-to-pdf`, {
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
      throw new Error(errorData.error || "Failed to create PDF from images");
    }
    
    return await response.blob();
  },

  // Image to Text (OCR) - Single file
  imageToText: async (file: File) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("image", file);
    
    const response = await fetch(`${API_BASE_URL}/image-to-text`, {
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
      throw new Error(errorData.error || "Failed to extract text from image");
    }
    
    return await response.json();
  },

  // Rearrange PDF - Single file
  rearrangePDF: async (file: File, newOrder: number[]) => {
    if (!validateFileSize(file)) {
      throw new Error(`File size exceeds ${formatFileSize(FILE_LIMITS.MAX_SINGLE_FILE_SIZE)} limit`);
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("newOrder", JSON.stringify(newOrder));
    
    const response = await fetch(`${API_BASE_URL}/rearrange-pdf`, {
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
      throw new Error(errorData.error || "Failed to rearrange PDF");
    }
    
    return await response.blob();
  },

  // Batch Word to PDF - Process multiple Word files (up to 20)
  batchWordToPDF: async (files: File[]) => {
    const validation = validateMultipleFiles(files, FILE_LIMITS.MAX_FILES_COUNT);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Process files sequentially to avoid overwhelming the server
    const results: { fileName: string; blob: Blob | null; error?: string }[] = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("docx", file);
        
        const response = await fetch(`${API_BASE_URL}/word-to-pdf`, {
          method: "POST",
          body: formData,
        });
        
        if (response.ok) {
          const blob = await response.blob();
          results.push({ fileName: file.name, blob });
        } else {
          const errorText = await response.text();
          results.push({ 
            fileName: file.name, 
            blob: null, 
            error: `Failed: ${errorText.slice(0, 100)}...` 
          });
        }
      } catch (error: any) {
        results.push({ 
          fileName: file.name, 
          blob: null, 
          error: error.message || "Unknown error" 
        });
      }
      
      // Small delay between requests to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  },

  // Batch PDF to Word - Process multiple PDF files (up to 20)
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
        
        const response = await fetch(`${API_BASE_URL}/pdf-to-word`, {
          method: "POST",
          body: formData,
        });
        
        if (response.ok) {
          const blob = await response.blob();
          results.push({ fileName: file.name, blob });
        } else {
          const errorText = await response.text();
          results.push({ 
            fileName: file.name, 
            blob: null, 
            error: `Failed: ${errorText.slice(0, 100)}...` 
          });
        }
      } catch (error: any) {
        results.push({ 
          fileName: file.name, 
          blob: null, 
          error: error.message || "Unknown error" 
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  },

  // Batch Compress PDFs - Process multiple PDF files (up to 20)
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
        
        const response = await fetch(`${API_BASE_URL}/compress-pdf`, {
          method: "POST",
          body: formData,
        });
        
        if (response.ok) {
          const blob = await response.blob();
          results.push({ fileName: file.name, blob });
        } else {
          const errorText = await response.text();
          results.push({ 
            fileName: file.name, 
            blob: null, 
            error: `Failed: ${errorText.slice(0, 100)}...` 
          });
        }
      } catch (error: any) {
        results.push({ 
          fileName: file.name, 
          blob: null, 
          error: error.message || "Unknown error" 
        });
      }
      
      // Small delay between requests
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

// Helper to download multiple files individually
export const downloadMultipleFiles = (files: { name: string; blob: Blob }[]) => {
  files.forEach(file => {
    if (file.blob) {
      downloadBlob(file.blob, file.name);
    }
  });
};

// Helper to trigger multiple downloads with delay
export const batchDownloadMultiple = async (files: { name: string; blob: Blob }[]) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.blob) {
      // Small delay between downloads to avoid browser restrictions
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      downloadBlob(file.blob, file.name);
    }
  }
};

// Helper to create a ZIP from multiple files using JSZip
export const createZipFromFiles = async (files: { name: string; blob: Blob }[]): Promise<Blob> => {
  try {
    // Dynamic import to avoid SSR issues and bundle optimization
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add files to zip
    files.forEach(file => {
      if (file.blob) {
        // Clean up file name for ZIP
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        zip.file(cleanName, file.blob);
      }
    });
    
    // Generate zip file with compression
    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6 // Medium compression level
      }
    });
    
    return zipBlob;
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw new Error('Failed to create ZIP file. Please try downloading files individually.');
  }
};

// Helper to batch download multiple files as ZIP
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
    
    // Fallback to individual downloads if ZIP fails
    console.log('ZIP creation failed, falling back to individual downloads...');
    try {
      await batchDownloadMultiple(files);
      return false; // Return false to indicate fallback was used
    } catch (fallbackError) {
      console.error('Fallback download also failed:', fallbackError);
      throw new Error('Failed to download files. Please try downloading individually.');
    }
  }
};

// Helper to get file information
export const getFileInfo = (file: File) => {
  return {
    name: file.name,
    size: file.size,
    formattedSize: formatFileSize(file.size),
    type: file.type,
    lastModified: new Date(file.lastModified).toLocaleString(),
  };
};

// Helper to filter files by type
export const filterFilesByType = (files: File[], allowedTypes: string[]): File[] => {
  return files.filter(file => validateFileType(file, allowedTypes));
};

// Helper to calculate total size of files
export const calculateTotalSize = (files: File[]): number => {
  return files.reduce((total, file) => total + file.size, 0);
};

// Helper to format file list for display
export const formatFileList = (files: File[]): string => {
  if (files.length === 0) return 'No files selected';
  if (files.length === 1) return files[0].name;
  if (files.length <= 3) return files.map(f => f.name).join(', ');
  return `${files.length} files selected`;
};

// Type definitions for better TypeScript support
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

// Export types for external use
export type {
  // Re-export types if needed
};

// Default export for convenience
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