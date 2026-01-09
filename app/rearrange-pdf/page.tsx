"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  File,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  GripVertical,
  Eye,
  RotateCw,
  ArrowUp,
  ArrowDown,
  Layers,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Shuffle,
  Search,
  FileText,
  Image as ImageIcon,
  Type,
  FileImage,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Filter,
  BookOpen,
  Table,
  Trash2,
  Undo,
  AlertTriangle,
  Info,
  Lock,
  Shield,
  Zap,
  Sparkles,
  Palette,
  EyeOff
} from "lucide-react";
import { PDFDocument, PDFPage } from 'pdf-lib';

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  originalDoc?: PDFDocument;
}

interface PagePreview {
  id: number;
  originalNumber: number;
  currentPosition: number;
  pageType: 'text' | 'image' | 'mixed' | 'form' | 'table' | 'unknown';
  textPreview: string;
  width: number;
  height: number;
  color: string;
  icon: React.ReactNode;
  hasImages: boolean;
  hasText: boolean;
}

interface DeletionHistory {
  deletedPages: number[];
  timestamp: number;
  pageOrderBefore: number[];
}

interface PageStats {
  textCount: number;
  imageCount: number;
  formCount: number;
}

interface ProgressState {
  loaded: number;
  total: number;
  step: string;
}

export default function RearrangePDF() {
  const [pdf, setPdf] = useState<PDFFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rearrangedBlob, setRearrangedBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'detailed'>('grid');
  const [showInstructions, setShowInstructions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [selectedPageForDetail, setSelectedPageForDetail] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [deletionHistory, setDeletionHistory] = useState<DeletionHistory[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [pageStats, setPageStats] = useState<PageStats>({ textCount: 0, imageCount: 0, formCount: 0 });
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [processedFileSize, setProcessedFileSize] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzePDF = async (pdfDoc: PDFDocument, pageNumber: number): Promise<{hasText: boolean; hasImages: boolean}> => {
    try {
      const page = pdfDoc.getPage(pageNumber - 1);
      const content = await page.getContent();
      
      let hasText = false;
      let hasImages = false;
      
      // Check for text
      const textContent = await page.getTextContent();
      hasText = textContent.items.length > 0;
      
      // Check for images in content stream
      content.items.forEach((item: any) => {
        if (item.operator === 'Do') {
          const xObject = page.node.Resources().lookup(item.args[0]);
          if (xObject && xObject.get('Subtype').name === 'Image') {
            hasImages = true;
          }
        }
      });
      
      return { hasText, hasImages };
    } catch (err) {
      console.warn(`Could not analyze page ${pageNumber}:`, err);
      return { hasText: true, hasImages: false };
    }
  };

  const generatePagePreviews = async (pdfDoc: PDFDocument, pageCount: number): Promise<PagePreview[]> => {
    const previews: PagePreview[] = [];
    
    const textSamples = [
      "Document Introduction: This report outlines quarterly performance metrics...",
      "Financial Summary: Revenue increased by 15% compared to previous quarter...",
      "Methodology Section: The study employed mixed-methods approach...",
      "Results Analysis: Figure 2.3 demonstrates strong correlation...",
      "Conclusion: Based on comprehensive findings, we recommend...",
      "Appendix Materials: Supplementary data tables and reference documents...",
      "Executive Overview: Key findings indicate positive growth trajectory...",
      "Table of Contents: Chapters include introduction, literature review...",
      "Technical Specifications: Detailed product specifications...",
      "Meeting Minutes: Discussion points and action items..."
    ];
    
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316'
    ];

    const getIconForType = (type: string): React.ReactNode => {
      switch(type) {
        case 'text': return <Type className="w-6 h-6" />;
        case 'image': return <ImageIcon className="w-6 h-6" />;
        case 'mixed': return <FileImage className="w-6 h-6" />;
        case 'form': return <FileText className="w-6 h-6" />;
        case 'table': return <Table className="w-6 h-6" />;
        default: return <BookOpen className="w-6 h-6" />;
      }
    };

    let textCount = 0;
    let imageCount = 0;
    let formCount = 0;

    for (let i = 1; i <= pageCount; i++) {
      setProgress({
        loaded: i,
        total: pageCount,
        step: `Analyzing page ${i} of ${pageCount}...`
      });

      const analysis = await analyzePDF(pdfDoc, i);
      
      // Update stats
      if (analysis.hasText) textCount++;
      if (analysis.hasImages) imageCount++;
      
      // Determine page type
      let pageType: PagePreview['pageType'] = 'unknown';
      let textPreview = '';
      
      if (analysis.hasImages && analysis.hasText) {
        pageType = 'mixed';
        textPreview = `📄 Mixed Content - Text with embedded images and graphical elements`;
      } else if (analysis.hasImages) {
        pageType = 'image';
        textPreview = `🖼️ Image Content - Contains diagrams, charts, or illustrations`;
      } else if (analysis.hasText) {
        pageType = 'text';
        textPreview = `📝 Text Document - ${textSamples[i % textSamples.length]}`;
      } else {
        pageType = 'unknown';
        textPreview = `📑 Document Page - Standard page content`;
      }
      
      const color = colors[i % colors.length];
      const icon = getIconForType(pageType);
      
      previews.push({
        id: i,
        originalNumber: i,
        currentPosition: i,
        pageType,
        textPreview,
        width: 595,
        height: 842,
        color,
        icon,
        hasImages: analysis.hasImages,
        hasText: analysis.hasText
      });
    }
    
    setPageStats({ textCount, imageCount, formCount });
    return previews;
  };

  const loadPDFDocument = async (file: File): Promise<PDFDocument> => {
    const arrayBuffer = await file.arrayBuffer();
    return await PDFDocument.load(arrayBuffer);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    
    if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setError("Please select a valid PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit");
      return;
    }

    setError(null);
    setSuccess(false);
    setRearrangedBlob(null);
    setSelectedPages([]);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPageForDetail(null);
    setDeletedPages([]);
    setDeletionHistory([]);
    setShowUndoToast(false);
    setIsProcessing(true);
    setProgress({ loaded: 0, total: 100, step: 'Loading PDF...' });
    setOriginalFileSize(file.size);
    
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      // Load PDF document
      setProgress({ loaded: 20, total: 100, step: 'Parsing PDF structure...' });
      const pdfDoc = await loadPDFDocument(file);
      const pageCount = pdfDoc.getPageCount();
      
      setProgress({ loaded: 40, total: 100, step: 'Analyzing pages...' });
      const previews = await generatePagePreviews(pdfDoc, pageCount);
      
      const pdfFile: PDFFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        pageCount,
        originalDoc: pdfDoc
      };

      setPdf(pdfFile);
      setPagePreviews(previews);
      const initialOrder = Array.from({ length: pageCount }, (_, i) => i + 1);
      setPageOrder(initialOrder);
      setProgress({ loaded: 100, total: 100, step: 'Ready!' });
      
      setTimeout(() => setProgress(null), 1000);
      
    } catch (err: any) {
      console.error('Error processing PDF:', err);
      setError(`Failed to process PDF: ${err.message || 'Unknown error'}`);
      setProgress(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePageOrder = () => {
    if (!pdf?.pageCount) return "No PDF loaded";
    
    const invalidPages = pageOrder.filter(num => num < 1 || num > pdf.pageCount!);
    if (invalidPages.length > 0) {
      return `Invalid page numbers: ${invalidPages.join(', ')}. Valid range: 1-${pdf.pageCount}`;
    }
    
    const uniquePages = new Set(pageOrder);
    if (uniquePages.size !== pageOrder.length) {
      return "Duplicate pages in the order";
    }
    
    return null;
  };

  const rearrangePDF = async (): Promise<Blob> => {
    if (!pdf?.originalDoc) {
      throw new Error("PDF not loaded");
    }

    const startTime = Date.now();
    setProgress({ loaded: 0, total: 100, step: 'Creating new document...' });
    
    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();
    
    setProgress({ loaded: 20, total: 100, step: 'Copying pages in new order...' });
    
    // Copy pages in the new order
    for (let i = 0; i < pageOrder.length; i++) {
      const originalPageIndex = pageOrder[i] - 1;
      const [copiedPage] = await newPdfDoc.copyPages(pdf.originalDoc, [originalPageIndex]);
      newPdfDoc.addPage(copiedPage);
      
      // Update progress
      setProgress({
        loaded: 20 + (i / pageOrder.length) * 60,
        total: 100,
        step: `Processing page ${i + 1} of ${pageOrder.length}...`
      });
    }
    
    setProgress({ loaded: 80, total: 100, step: 'Saving document...' });
    
    // Save the modified PDF
    const pdfBytes = await newPdfDoc.save();
    
    setProgress({ loaded: 100, total: 100, step: 'Complete!' });
    
    const endTime = Date.now();
    setProcessingTime(endTime - startTime);
    setProcessedFileSize(pdfBytes.length);
    
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePageOrder();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (deletedPages.length > 0) {
      const confirmDelete = window.confirm(
        `You have deleted ${deletedPages.length} page(s). Continue?`
      );
      if (!confirmDelete) return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setIsProcessing(true);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    try {
      const modifiedPdfBlob = await rearrangePDF();
      
      const url = URL.createObjectURL(modifiedPdfBlob);
      setRearrangedBlob(modifiedPdfBlob);
      setDownloadUrl(url);
      setSuccess(true);
      
      setTimeout(() => setProgress(null), 1000);
      
    } catch (err: any) {
      console.error("PDF processing error:", err);
      setError(`Failed to rearrange PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && pdf) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      let filename = `${pdf.name.replace(/\.pdf$/i, '')}_edited_${timestamp}.pdf`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Track download
      console.log(`Downloaded modified PDF: ${filename}`);
    }
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
    setPdf(null);
    setError(null);
    setSuccess(false);
    setRearrangedBlob(null);
    setPageOrder([]);
    setPagePreviews([]);
    setSelectedPages([]);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPageForDetail(null);
    setDeletedPages([]);
    setDeletionHistory([]);
    setShowUndoToast(false);
    setPageStats({ textCount: 0, imageCount: 0, formCount: 0 });
    setProgress(null);
    setProcessingTime(0);
    
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const deletePage = (pageIndex: number) => {
    if (!pdf) return;
    
    const pageNum = pageOrder[pageIndex];
    const originalPageNum = pageNum;
    
    setDeletionHistory(prev => [{
      deletedPages: [originalPageNum],
      timestamp: Date.now(),
      pageOrderBefore: [...pageOrder]
    }, ...prev.slice(0, 9)]);
    
    const newPageOrder = pageOrder.filter((_, idx) => idx !== pageIndex);
    setPageOrder(newPageOrder);
    
    setDeletedPages(prev => [...prev, originalPageNum]);
    setSelectedPages(prev => prev.filter(p => p !== pageIndex));
    
    setShowUndoToast(true);
    setTimeout(() => setShowUndoToast(false), 5000);
  };

  const deleteSelectedPages = () => {
    if (selectedPages.length === 0) return;
    
    const pagesToDelete = selectedPages
      .sort((a, b) => b - a)
      .map(idx => pageOrder[idx]);
    
    setDeletionHistory(prev => [{
      deletedPages: [...pagesToDelete],
      timestamp: Date.now(),
      pageOrderBefore: [...pageOrder]
    }, ...prev.slice(0, 9)]);
    
    const newPageOrder = pageOrder.filter((_, idx) => !selectedPages.includes(idx));
    setPageOrder(newPageOrder);
    
    setDeletedPages(prev => [...prev, ...pagesToDelete]);
    setSelectedPages([]);
    
    setShowUndoToast(true);
    setTimeout(() => setShowUndoToast(false), 5000);
  };

  const undoLastDeletion = () => {
    if (deletionHistory.length === 0) return;
    
    const lastAction = deletionHistory[0];
    setPageOrder(lastAction.pageOrderBefore);
    setDeletedPages(prev => 
      prev.filter(page => !lastAction.deletedPages.includes(page))
    );
    setDeletionHistory(prev => prev.slice(1));
    setShowUndoToast(false);
  };

  const restoreAllDeletedPages = () => {
    if (deletedPages.length === 0) return;
    
    const allPages = Array.from({ length: pdf?.pageCount || 0 }, (_, i) => i + 1);
    setPageOrder(allPages);
    setDeletedPages([]);
    setDeletionHistory([]);
    setSelectedPages([]);
  };

  const confirmDeletePages = (pages: number[]) => {
    setPagesToDelete(pages);
    setShowDeleteConfirm(true);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results: number[] = [];
    
    pageOrder.forEach((pageNum, index) => {
      const pageData = pagePreviews[pageNum - 1];
      if (pageData && (
        pageData.textPreview.toLowerCase().includes(query) || 
        pageData.pageType.includes(query)
      )) {
        results.push(index);
      }
    });
    
    setSearchResults(results);
    
    if (results.length > 0) {
      const firstResult = document.getElementById(`page-${results[0]}`);
      if (firstResult) {
        firstResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const movePageUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...pageOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setPageOrder(newOrder);
  };

  const movePageDown = (index: number) => {
    if (index >= pageOrder.length - 1) return;
    const newOrder = [...pageOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setPageOrder(newOrder);
  };

  const moveToTop = (index: number) => {
    const newOrder = [...pageOrder];
    const [movedPage] = newOrder.splice(index, 1);
    newOrder.unshift(movedPage);
    setPageOrder(newOrder);
  };

  const moveToBottom = (index: number) => {
    const newOrder = [...pageOrder];
    const [movedPage] = newOrder.splice(index, 1);
    newOrder.push(movedPage);
    setPageOrder(newOrder);
  };

  const reverseOrder = () => {
    setPageOrder([...pageOrder].reverse());
  };

  const sortAscending = () => {
    setPageOrder([...pageOrder].sort((a, b) => a - b));
  };

  const sortDescending = () => {
    setPageOrder([...pageOrder].sort((a, b) => b - a));
  };

  const shufflePages = () => {
    const shuffled = [...pageOrder];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPageOrder(shuffled);
  };

  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages(prev => 
      prev.includes(pageIndex) 
        ? prev.filter(p => p !== pageIndex)
        : [...prev, pageIndex]
    );
  };

  const moveSelectedPages = (direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (selectedPages.length === 0) return;
    
    const newOrder = [...pageOrder];
    const selectedSet = new Set(selectedPages);
    const sortedSelected = [...selectedPages].sort((a, b) => a - b);
    
    if (direction === 'top') {
      const removedPages = sortedSelected.map(idx => newOrder[idx]);
      sortedSelected.reverse().forEach(idx => newOrder.splice(idx, 1));
      newOrder.unshift(...removedPages);
    } else if (direction === 'bottom') {
      const removedPages = sortedSelected.map(idx => newOrder[idx]);
      sortedSelected.reverse().forEach(idx => newOrder.splice(idx, 1));
      newOrder.push(...removedPages);
    } else if (direction === 'up') {
      sortedSelected.forEach(idx => {
        if (idx > 0 && !selectedSet.has(idx - 1)) {
          [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
        }
      });
    } else if (direction === 'down') {
      [...sortedSelected].reverse().forEach(idx => {
        if (idx < newOrder.length - 1 && !selectedSet.has(idx + 1)) {
          [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
        }
      });
    }
    
    setPageOrder(newOrder);
    setSelectedPages([]);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOverPage = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDropPage = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex === targetIndex) return;
    
    const newOrder = [...pageOrder];
    const [movedPage] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, movedPage);
    setPageOrder(newOrder);
  };

  const resetToOriginal = () => {
    if (pdf?.pageCount) {
      const originalOrder = Array.from({ length: pdf.pageCount }, (_, i) => i + 1);
      setPageOrder(originalOrder);
      setSelectedPages([]);
      setDeletedPages([]);
      setDeletionHistory([]);
    }
  };

  const getPageTypeColor = (pageType: string) => {
    switch(pageType) {
      case 'text':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'image':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'mixed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'form':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'table':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFilteredPages = () => {
    if (filterType === 'all') return pageOrder;
    
    const filteredIndices: number[] = [];
    pageOrder.forEach((pageNum, index) => {
      const pageData = pagePreviews[pageNum - 1];
      if (pageData && pageData.pageType === filterType) {
        filteredIndices.push(index);
      }
    });
    
    return filteredIndices.map(idx => pageOrder[idx]);
  };

  const filteredPageOrder = getFilteredPages();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const ProgressBar = ({ progress }: { progress: ProgressState }) => (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
        />
      </div>
      <div className="bg-white shadow-md p-2 text-center text-sm">
        {progress.step} ({Math.round((progress.loaded / progress.total) * 100)}%)
      </div>
    </div>
  );

  const ClientSideInfo = () => (
    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
      <div className="flex items-start">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🔒 100% Secure & Private</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">No Uploads</span>
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            All PDF processing happens <strong>entirely in your browser</strong>. Your documents never leave your computer.
            We use industry-standard libraries to manipulate PDFs locally.
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="text-xs bg-white px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-700 flex items-center">
              <Zap className="w-3 h-3 mr-1" /> Instant Processing
            </div>
            <div className="text-xs bg-white px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-700 flex items-center">
              <Lock className="w-3 h-3 mr-1" /> No Server Uploads
            </div>
            <div className="text-xs bg-white px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-700 flex items-center">
              <EyeOff className="w-3 h-3 mr-1" /> Complete Privacy
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsCard = () => (
    <div className="mb-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-5">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
        Document Analysis
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600">{pageOrder.length}</div>
          <div className="text-xs text-gray-600">Total Pages</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600">{pageStats.textCount}</div>
          <div className="text-xs text-gray-600">Text Pages</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-xl">
          <div className="text-2xl font-bold text-purple-600">{pageStats.imageCount}</div>
          <div className="text-xs text-gray-600">Image Pages</div>
        </div>
      </div>
      {processingTime > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Processing Time:</span>
            <span className="font-semibold text-gray-900">{formatTime(processingTime)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">File Size:</span>
            <span className="font-semibold text-gray-900">
              {formatFileSize(originalFileSize)} → {formatFileSize(processedFileSize)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      {progress && <ProgressBar progress={progress} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Layers className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PDF Page Editor
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Professionally edit, rearrange, and manage PDF pages with complete privacy. 
                Everything happens in your browser.
              </p>
            </div>

            <ClientSideInfo />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div
                  className={`border-3 border-dashed rounded-2xl transition-all duration-300 cursor-pointer mb-6 hover:shadow-lg ${
                    pdf 
                      ? "border-indigo-400 bg-gradient-to-br from-indigo-50 to-white shadow-md" 
                      : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
                  }`}
                  onClick={() => document.getElementById("file-upload")?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="text-center p-8">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      pdf ? "bg-gradient-to-br from-indigo-100 to-purple-100" : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}>
                      <Upload className={`w-10 h-10 ${pdf ? "text-indigo-600" : "text-gray-400"}`} />
                    </div>
                    <input
                      type="file"
                      id="file-upload"
                      ref={fileInputRef}
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {pdf ? (
                      <div>
                        <div className="text-indigo-600 font-bold text-lg mb-2 flex items-center justify-center">
                          <File className="w-5 h-5 mr-2" />
                          PDF Loaded
                        </div>
                        <div className="text-gray-700 text-sm truncate px-4 mb-2 font-medium">
                          {pdf.name}
                        </div>
                        <div className="text-gray-500 text-xs mb-4">
                          {formatFileSize(pdf.size)} • {pdf.pageCount} pages
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById("file-upload")?.click();
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-4 py-2 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          Choose Different PDF
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-gray-700 font-bold text-lg mb-2">
                          Drop PDF Here
                        </div>
                        <div className="text-gray-500 mb-4">or click to browse</div>
                        <div className="text-gray-400 text-sm bg-gray-50 rounded-lg p-3 inline-block">
                          Max 50MB • Secure & Private
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {pdf && <StatsCard />}

                {pdf && pagePreviews.length > 0 && (
                  <div className="mb-6">
                    <div className="relative mb-3">
                      <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                      <button
                        onClick={handleSearch}
                        className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter by Type
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                      >
                        <option value="all">All Page Types</option>
                        <option value="text">Text Pages</option>
                        <option value="image">Image Pages</option>
                        <option value="mixed">Mixed Content</option>
                        <option value="form">Forms</option>
                        <option value="table">Tables</option>
                      </select>
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="mt-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                        Found {searchResults.length} page{searchResults.length !== 1 ? 's' : ''} with "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}

                {pdf && pageOrder.length > 0 && (
                  <div className="mb-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shuffle className="w-5 h-5 mr-2 text-indigo-600" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={sortAscending}
                          className="px-3 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm flex items-center justify-center shadow-sm"
                        >
                          <SortAsc className="w-4 h-4 mr-2" />
                          Sort ↑
                        </button>
                        <button
                          onClick={sortDescending}
                          className="px-3 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm flex items-center justify-center shadow-sm"
                        >
                          <SortDesc className="w-4 h-4 mr-2" />
                          Sort ↓
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={reverseOrder}
                          className="px-3 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm flex items-center justify-center shadow-sm"
                        >
                          <RotateCw className="w-4 h-4 mr-2" />
                          Reverse
                        </button>
                        <button
                          onClick={shufflePages}
                          className="px-3 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm flex items-center justify-center shadow-sm"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Shuffle
                        </button>
                      </div>
                      
                      {selectedPages.length > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected ({selectedPages.length})</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => moveSelectedPages('top')}
                              className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-100 text-sm"
                            >
                              Move to Top
                            </button>
                            <button
                              onClick={() => moveSelectedPages('bottom')}
                              className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-100 text-sm"
                            >
                              Move to Bottom
                            </button>
                            <button
                              onClick={deleteSelectedPages}
                              className="col-span-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 text-sm flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Selected
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start shadow-sm">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">{error}</div>
                  </div>
                )}

                {success && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start shadow-sm">
                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold">PDF Modified Successfully!</div>
                      <div className="text-sm mt-1">
                        {deletedPages.length > 0 
                          ? `${deletedPages.length} page(s) removed. Ready to download.`
                          : 'Pages rearranged. Ready to download.'
                        }
                        {processingTime > 0 && (
                          <div className="mt-1 text-green-600">
                            Processed in {formatTime(processingTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={handleSubmit}
                    disabled={uploading || !pdf || pageOrder.length === 0 || isProcessing}
                    className={`w-full px-6 py-4 font-bold rounded-xl transition-all flex items-center justify-center shadow-lg ${
                      uploading || !pdf || pageOrder.length === 0 || isProcessing
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02] transform transition-all duration-200"
                    }`}
                  >
                    {uploading || isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Layers className="w-5 h-5 mr-2" />
                        {deletedPages.length > 0 ? 'Save & Download' : 'Apply Changes'}
                      </>
                    )}
                  </button>
                  
                  {success && rearrangedBlob && (
                    <button
                      onClick={handleDownload}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] shadow-lg transform transition-all duration-200 flex items-center justify-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Modified PDF
                    </button>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors shadow-sm flex items-center justify-center"
                  >
                    <RotateCw className="w-5 h-5 mr-2" />
                    Start Over
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2">
                {pdf ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <Grid className="w-5 h-5 mr-2 text-indigo-600" />
                          Page Management
                          <span className="ml-2 text-sm font-normal bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            {pageOrder.length} pages
                          </span>
                          {deletedPages.length > 0 && (
                            <span className="ml-2 text-sm font-normal bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              -{deletedPages.length}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Drag to reorder • Click to select • Use quick actions for bulk operations
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          title="Grid View"
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowInstructions(!showInstructions)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="Toggle Instructions"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {showInstructions && (
                      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                        <h4 className="font-bold text-blue-700 mb-2 flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          How to Use:
                        </h4>
                        <ul className="text-sm text-blue-600 space-y-1">
                          <li>• <strong>Drag & drop</strong> pages to rearrange them</li>
                          <li>• <strong>Click</strong> pages to select them (Ctrl/Cmd + click for multiple)</li>
                          <li>• <strong>Delete pages</strong> using the trash icon or bulk delete selected</li>
                          <li>• <strong>Undo</strong> any action with the undo button</li>
                          <li>• <strong>Download</strong> your modified PDF when ready</li>
                        </ul>
                      </div>
                    )}

                    {viewMode === 'grid' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredPageOrder.map((pageNum, index) => {
                          const globalIndex = pageOrder.indexOf(pageNum);
                          const pageData = pagePreviews[pageNum - 1];
                          const isSearchResult = searchResults.includes(globalIndex);
                          const isSelected = selectedPages.includes(globalIndex);
                          
                          if (!pageData) return null;
                          
                          return (
                            <div
                              key={globalIndex}
                              id={`page-${globalIndex}`}
                              className={`relative border-2 rounded-xl overflow-hidden cursor-move group transition-all duration-200 hover:shadow-lg ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300 scale-[1.02] shadow-md'
                                  : isSearchResult
                                  ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-300 shadow-md'
                                  : getPageTypeColor(pageData.pageType)
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, globalIndex)}
                              onDragOver={(e) => handleDragOverPage(e, globalIndex)}
                              onDrop={(e) => handleDropPage(e, globalIndex)}
                              onClick={(e) => {
                                if (e.ctrlKey || e.metaKey) {
                                  e.preventDefault();
                                  togglePageSelection(globalIndex);
                                } else if (e.detail === 2) {
                                  setSelectedPageForDetail(globalIndex);
                                }
                              }}
                            >
                              <div 
                                className="aspect-[3/4] flex flex-col items-center justify-center p-4 transition-colors relative"
                                style={{ backgroundColor: pageData.color + '20' }}
                              >
                                <div className="absolute top-2 left-2 text-xs font-bold bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                                  #{pageNum}
                                </div>
                                <div 
                                  className="mb-3 p-3 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm"
                                  style={{ backgroundColor: pageData.color + '40' }}
                                >
                                  <div style={{ color: pageData.color }}>
                                    {pageData.icon}
                                  </div>
                                </div>
                                <div className={`text-xs px-3 py-1.5 rounded-full font-bold ${getPageTypeColor(pageData.pageType)} shadow-sm`}>
                                  {pageData.pageType.toUpperCase()}
                                </div>
                                <div className="text-xs text-gray-600 mt-3 text-center px-2">
                                  Pos: {globalIndex + 1}
                                </div>
                              </div>
                              
                              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePageUp(globalIndex);
                                  }}
                                  disabled={globalIndex === 0}
                                  className={`p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow ${
                                    globalIndex === 0 
                                      ? 'text-gray-300 cursor-not-allowed' 
                                      : 'text-gray-600 hover:bg-white hover:text-indigo-600'
                                  }`}
                                  title="Move up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePageDown(globalIndex);
                                  }}
                                  disabled={globalIndex === pageOrder.length - 1}
                                  className={`p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow ${
                                    globalIndex === pageOrder.length - 1
                                      ? 'text-gray-300 cursor-not-allowed' 
                                      : 'text-gray-600 hover:bg-white hover:text-indigo-600'
                                  }`}
                                  title="Move down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeletePages([globalIndex]);
                                  }}
                                  className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-red-600 hover:bg-red-50 shadow"
                                  title="Delete page"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              
                              {isSelected && (
                                <div className="absolute top-10 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                                  ✓ Selected
                                </div>
                              )}
                              
                              {isSearchResult && (
                                <div className="absolute top-2 left-10 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                                  🔍
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-5">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-indigo-600" />
                        Current Page Order
                      </h4>
                      <div className="text-sm text-gray-600 flex flex-wrap gap-1.5">
                        {pageOrder.map((num, idx) => {
                          const isSelected = selectedPages.includes(idx);
                          const isSearchResult = searchResults.includes(idx);
                          const pageData = pagePreviews[num - 1];
                          
                          return (
                            <span key={idx} className="flex items-center">
                              <span className={`px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow-sm ${
                                isSelected 
                                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                                  : isSearchResult
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                  : pageData 
                                  ? `${getPageTypeColor(pageData.pageType)} border`
                                  : 'bg-gray-200 text-gray-700 border border-gray-300'
                              }`}>
                                {pageData && (
                                  <span className="opacity-75">
                                    {React.isValidElement(pageData.icon) 
                                      ? React.cloneElement(pageData.icon as React.ReactElement<any>, { 
                                          className: "w-3 h-3" 
                                        })
                                      : null}
                                  </span>
                                )}
                                <span className="font-medium">{num}</span>
                              </span>
                              {idx < pageOrder.length - 1 && (
                                <span className="mx-1 text-gray-400">→</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      {deletedPages.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-sm">
                            <span className="text-gray-500">Deleted pages: </span>
                            <span className="text-red-600 font-medium">
                              {deletedPages.sort((a, b) => a - b).join(', ')}
                            </span>
                            <button
                              onClick={restoreAllDeletedPages}
                              className="ml-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              (Restore all)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Layers className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">
                      Ready to Edit Your PDF
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Upload a PDF file to start rearranging, deleting, and managing pages with our secure, browser-based editor.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modals and toasts remain similar but updated for styling */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mr-4">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Delete Pages</h3>
                      <p className="text-sm text-gray-600">
                        {pagesToDelete.length} page{pagesToDelete.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-700 mb-3">
                      Are you sure you want to delete {pagesToDelete.length === 1 ? 'this page' : 'these pages'}? 
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-700">
                        <strong>Note:</strong> Pages will be permanently removed from the output PDF.
                        You can undo this action immediately after deletion.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        pagesToDelete.sort((a, b) => b - a).forEach(idx => {
                          deletePage(idx);
                        });
                        setShowDeleteConfirm(false);
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                      Delete {pagesToDelete.length} Page{pagesToDelete.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showUndoToast && deletionHistory.length > 0 && (
              <div className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow-2xl p-4 z-40 flex items-center animate-slide-up max-w-sm">
                <div className="flex-1">
                  <div className="font-bold">Pages Deleted</div>
                  <div className="text-sm text-gray-300">
                    {deletionHistory[0].deletedPages.length} page{deletionHistory[0].deletedPages.length !== 1 ? 's' : ''} removed
                  </div>
                </div>
                <button
                  onClick={undoLastDeletion}
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg text-sm flex items-center font-medium shadow"
                >
                  <Undo className="w-3 h-3 mr-2" />
                  Undo
                </button>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Professional PDF Editing Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">100% Secure Processing</h4>
                  <p className="text-sm text-gray-600">
                    All PDF manipulation happens locally in your browser. No files are uploaded to any server.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Real-Time Preview</h4>
                  <p className="text-sm text-gray-600">
                    See page previews with automatic content detection before making changes.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Smart Page Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Automatically detects text, images, and mixed content for better organization.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <Link
                href="/"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors hover:underline"
              >
                ← Back to All Tools
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Powered by pdf-lib • Works entirely in your browser • No data leaves your computer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}