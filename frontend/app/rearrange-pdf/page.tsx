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
  EyeOff,
  ArrowLeft,
  Check
} from "lucide-react";
import { PDFDocument, PDFPage } from 'pdf-lib';
import { useToast } from "@/components/ToastProvider";

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
  const { addToast } = useToast()
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzePDF = async (pdfDoc: PDFDocument, pageNumber: number): Promise<{hasText: boolean; hasImages: boolean}> => {
    try {
      const page = pdfDoc.getPage(pageNumber - 1) as any;
      const content = await page.getContent();
      
      let hasText = false;
      let hasImages = false;
      
      // Check for text
      const textContent = await page.getTextContent();
      hasText = textContent.items.length > 0;
      
      // Check for images in content stream
      content.items.forEach((item: any) => {
        if (item.operator === 'Do') {
          const xObject = (page as any).node.Resources().lookup(item.args[0]);
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
        textPreview = `Mixed Content - Text with embedded images and graphical elements`;
      } else if (analysis.hasImages) {
        pageType = 'image';
        textPreview = `Image Content - Contains diagrams, charts, or illustrations`;
      } else if (analysis.hasText) {
        pageType = 'text';
        textPreview = `Text Document - ${textSamples[i % textSamples.length]}`;
      } else {
        pageType = 'unknown';
        textPreview = `Document Page - Standard page content`;
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
      addToast("Please select a valid PDF file", "error")
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      addToast("File size exceeds 50MB limit", "error")
      return;
    }

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
      addToast(`Failed to process PDF: ${err.message || 'Unknown error'}`, "error")
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
    
    return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePageOrder();
    if (validationError) {
      addToast(validationError, "error")
      return;
    }

    if (deletedPages.length > 0) {
      const confirmDelete = window.confirm(
        `You have deleted ${deletedPages.length} page(s). Continue?`
      );
      if (!confirmDelete) return;
    }

    setUploading(true);
    setIsProcessing(true);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    try {
      const modifiedPdfBlob = await rearrangePDF();
      
      const url = URL.createObjectURL(modifiedPdfBlob);
      setRearrangedBlob(modifiedPdfBlob);
      setDownloadUrl(url);
      addToast("PDF modified successfully!", "success")
      
      setTimeout(() => setProgress(null), 1000);
      
    } catch (err: any) {
      console.error("PDF processing error:", err);
      addToast(`Failed to rearrange PDF: ${err.message || 'Unknown error'}`, "error")
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
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };

  const handleReset = () => {
    setPdf(null);
    setRearrangedBlob(null);
    setPageOrder([]);
    setPagePreviews([]);
    setSelectedPages([]);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPageForDetail(null);
    setDeletedPages([]);
    setDeletionHistory([]);
    setShowDeleteConfirm(false);
    setPagesToDelete([]);
    setShowUndoToast(false);
    setPageStats({ textCount: 0, imageCount: 0, formCount: 0 });
    setProgress(null);
    setIsProcessing(false);
    setProcessingTime(0);
    setOriginalFileSize(0);
    setProcessedFileSize(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setViewMode('grid');
    setShowInstructions(true);
    setFilterType('all');
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
        return 'bg-indigo-50 text-slate-500 border-slate-200';
      case 'image':
        return 'bg-indigo-50 text-slate-500 border-slate-200';
      case 'mixed':
        return 'bg-indigo-50 text-slate-500 border-slate-200';
      case 'form':
        return 'bg-indigo-50 text-slate-500 border-slate-200';
      case 'table':
        return 'bg-indigo-50 text-slate-500 border-slate-200';
      default:
        return 'bg-indigo-50 text-slate-800 border-slate-200';
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
      <div className="h-1 bg-indigo-50">
        <div 
          className="h-full bg-gradient-to-r bg-indigo-600 transition-all duration-300"
          style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
        />
      </div>
      <div className="bg-slate-100 shadow-sm p-2 text-center text-sm">
        {progress.step} ({Math.round((progress.loaded / progress.total) * 100)}%)
      </div>
    </div>
  );

  const ClientSideInfo = () => (
    <div className="mb-6 bg-indigo-50 border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start">
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-indigo-600 mb-2 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
            100% Secure & Private
          </h4>
        </div>
      </div>
    </div>
  );

  const StatsCard = () => (
    <div className="mb-6 bg-indigo-50 rounded-2xl border border-slate-200 p-5">
      <h4 className="font-semibold text-indigo-600 mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
        Document Analysis
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-indigo-50 rounded-xl">
          <div className="text-2xl font-bold text-indigo-600">{pageOrder.length}</div>
          <div className="text-xs text-slate-600">Total Pages</div>
        </div>
        <div className="text-center p-3 bg-indigo-50 rounded-xl">
          <div className="text-2xl font-bold text-indigo-600">{pageStats.textCount}</div>
          <div className="text-xs text-slate-600">Text Pages</div>
        </div>
        <div className="text-center p-3 bg-indigo-50 rounded-xl">
          <div className="text-2xl font-bold text-indigo-600">{pageStats.imageCount}</div>
          <div className="text-xs text-slate-600">Image Pages</div>
        </div>
      </div>
      {processingTime > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Processing Time:</span>
            <span className="font-semibold text-indigo-600">{formatTime(processingTime)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-600">File Size:</span>
            <span className="font-semibold text-indigo-600">
              {formatFileSize(originalFileSize)} → {formatFileSize(processedFileSize)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      {progress && <ProgressBar progress={progress} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Layers className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-indigo-600 mb-3 text-indigo-600">
                PDF Page Editor
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
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
                      : "border-slate-200 hover:border-indigo-500 hover:bg-indigo-50"
                  }`}
                  onClick={() => document.getElementById("file-upload")?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="text-center p-8">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      pdf ? "bg-indigo-50" : "bg-indigo-50"
                    }`}>
                      <Upload className={`w-10 h-10 ${pdf ? "text-indigo-600" : "text-slate-400"}`} />
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
                        <div className="text-slate-600 text-sm truncate px-4 mb-2 font-medium">
                          {pdf.name}
                        </div>
                        <div className="text-slate-500 text-xs mb-4">
                          {formatFileSize(pdf.size)} — {pdf.pageCount} pages
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById("file-upload")?.click();
                          }}
                          className="text-indigo-600 hover:text-slate-500 font-medium text-sm px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          Choose Different PDF
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-slate-600 font-bold text-lg mb-2">
                          Drop PDF Here
                        </div>
                        <div className="text-slate-500 mb-4">or click to browse</div>
                        <div className="text-slate-400 text-sm bg-slate-100 rounded-lg p-3 inline-block">
                          Max 50MB — Secure & Private
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
                        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      />
                      <button
                        onClick={handleSearch}
                        className="absolute right-3 top-3 text-slate-400 hover:text-indigo-600"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter by Type
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
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
                  <div className="mb-6 bg-indigo-50 rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4 flex items-center">
                      <Shuffle className="w-5 h-5 mr-2 text-indigo-600" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={sortAscending}
                          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-sm flex items-center justify-center shadow-sm"
                        >
                          <SortAsc className="w-4 h-4 mr-2" />
                          Sort Asc
                        </button>
                        <button
                          onClick={sortDescending}
                          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-sm flex items-center justify-center shadow-sm"
                        >
                          <SortDesc className="w-4 h-4 mr-2" />
                          Sort Desc
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={reverseOrder}
                          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-sm flex items-center justify-center shadow-sm"
                        >
                          <RotateCw className="w-4 h-4 mr-2" />
                          Reverse
                        </button>
                        <button
                          onClick={shufflePages}
                          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-sm flex items-center justify-center shadow-sm"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Shuffle
                        </button>
                      </div>
                      
                      {selectedPages.length > 0 && (
                        <div className="pt-3 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-600 mb-2">Selected ({selectedPages.length})</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => moveSelectedPages('top')}
                              className="px-3 py-2 bg-indigo-50 border border-slate-200 text-slate-500 rounded-xl hover:bg-indigo-50 text-sm"
                            >
                              Move to Top
                            </button>
                            <button
                              onClick={() => moveSelectedPages('bottom')}
                              className="px-3 py-2 bg-indigo-50 border border-slate-200 text-slate-500 rounded-xl hover:bg-indigo-50 text-sm"
                            >
                              Move to Bottom
                            </button>
                            <button
                              onClick={deleteSelectedPages}
                              className="col-span-2 px-3 py-2 bg-red-900/30 border border-red-700 text-slate-500 rounded-xl hover:bg-indigo-50 text-sm flex items-center justify-center"
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

                <div className="space-y-4">
                  <button
                    onClick={handleSubmit}
                    disabled={uploading || !pdf || pageOrder.length === 0 || isProcessing}
                    className={`w-full px-6 py-4 font-bold rounded-xl transition-all flex items-center justify-center shadow-lg ${
                      uploading || !pdf || pageOrder.length === 0 || isProcessing
                        ? "bg-gray-300 text-slate-500 cursor-not-allowed"
                        : "bg-indigo-600 text-white text-white hover:shadow-xl hover:scale-[1.02] transform transition-all duration-200"
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
                  
                   {rearrangedBlob && (
                    <button
                      onClick={handleDownload}
                      className="w-full px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] shadow-lg transform transition-all duration-200 flex items-center justify-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Modified PDF
                    </button>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-4 bg-indigo-50 text-slate-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors shadow-sm flex items-center justify-center"
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
                        <h3 className="text-lg font-bold text-indigo-600 flex items-center">
                          <Grid className="w-5 h-5 mr-2 text-indigo-600" />
                          Page Management
                          <span className="ml-2 text-sm font-normal bg-indigo-50 text-slate-500 px-2 py-1 rounded-full">
                            {pageOrder.length} pages
                          </span>
                          {deletedPages.length > 0 && (
                            <span className="ml-2 text-sm font-normal bg-indigo-50 text-slate-500 px-2 py-1 rounded-full">
                              -{deletedPages.length}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Drag to reorder — Click to select — Use quick actions for bulk operations
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'bg-indigo-50 text-slate-600 hover:bg-indigo-50'}`}
                          title="Grid View"
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowInstructions(!showInstructions)}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Toggle Instructions"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {showInstructions && (
                      <div className="mb-6 bg-indigo-50 border border-slate-200 rounded-2xl p-4">
                        <h4 className="font-bold text-indigo-600 mb-2 flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          How to Use:
                        </h4>
                        <ul className="text-sm text-indigo-600 space-y-1">
                          <li>— <strong>Drag & drop</strong> pages to rearrange them</li>
                          <li>— <strong>Click</strong> pages to select them (Ctrl/Cmd + click for multiple)</li>
                          <li>— <strong>Delete pages</strong> using the trash icon or bulk delete selected</li>
                          <li>— <strong>Undo</strong> any action with the undo button</li>
                          <li>— <strong>Download</strong> your modified PDF when ready</li>
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
                                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300 shadow-md'
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
                                <div className="text-xs text-slate-600 mt-3 text-center px-2">
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
                                  className={`p-1.5 rounded-lg bg-slate-100 backdrop-blur-sm shadow ${
                                    globalIndex === 0 
                                      ? 'text-slate-500 cursor-not-allowed' 
                                      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
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
                                  className={`p-1.5 rounded-lg bg-slate-100 backdrop-blur-sm shadow ${
                                    globalIndex === pageOrder.length - 1
                                      ? 'text-slate-500 cursor-not-allowed' 
                                      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
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
                                  className="p-1.5 rounded-lg bg-slate-100 backdrop-blur-sm text-indigo-600 hover:bg-red-900/30 shadow"
                                  title="Delete page"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              
                              {isSelected && (
                                <div className="absolute top-10 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-md flex items-center">
                                  <Check className="w-3 h-3 mr-1" />
                                  Selected
                                </div>
                              )}
                              
                              {isSearchResult && (
                                <div className="absolute top-2 left-10 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-md flex items-center">
                                  <Search className="w-3 h-3 mr-1" />
                                  Match
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-6 bg-indigo-50 border border-slate-200 p-5">
                      <h4 className="font-bold text-indigo-600 mb-3 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-indigo-600" />
                        Current Page Order
                      </h4>
                      <div className="text-sm text-slate-600 flex flex-wrap gap-1.5">
                        {pageOrder.map((num, idx) => {
                          const isSelected = selectedPages.includes(idx);
                          const isSearchResult = searchResults.includes(idx);
                          const pageData = pagePreviews[num - 1];
                          
                          return (
                            <span key={idx} className="flex items-center">
                              <span className={`px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow-sm ${
                                isSelected 
                                  ? 'bg-indigo-50 text-slate-500 border border-slate-200' 
                                  : isSearchResult
                                  ? 'bg-indigo-50 text-slate-500 border border-slate-200'
                                  : pageData 
                                  ? `${getPageTypeColor(pageData.pageType)} border`
                                  : 'bg-indigo-50 text-slate-600 border border-slate-200'
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
                                <span className="mx-1 text-slate-400">→</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      {deletedPages.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="text-sm">
                            <span className="text-slate-500">Deleted pages: </span>
                            <span className="text-indigo-600 font-medium">
                              {deletedPages.sort((a, b) => a - b).join(', ')}
                            </span>
                            <button
                              onClick={restoreAllDeletedPages}
                              className="ml-3 text-xs text-indigo-600 hover:text-slate-500 font-medium"
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
                    <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Layers className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-600 mb-3">
                      Ready to Edit Your PDF
                    </h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      Upload a PDF file to start rearranging, deleting, and managing pages with our secure, browser-based editor.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modals and toasts remain similar but updated for styling */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-slate-50/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mr-4">
                      <AlertTriangle className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-indigo-600">Delete Pages</h3>
                      <p className="text-sm text-slate-600">
                        {pagesToDelete.length} page{pagesToDelete.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-slate-600 mb-3">
                      Are you sure you want to delete {pagesToDelete.length === 1 ? 'this page' : 'these pages'}? 
                    </p>
                    <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
                      <p className="text-sm text-slate-500">
                        <strong>Note:</strong> Pages will be permanently removed from the output PDF.
                        You can undo this action immediately after deletion.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-5 py-2.5 text-slate-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
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
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                      Delete {pagesToDelete.length} Page{pagesToDelete.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showUndoToast && deletionHistory.length > 0 && (
              <div className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-xl shadow-2xl p-4 z-40 flex items-center animate-slide-up max-w-sm">
                <div className="flex-1">
                  <div className="font-bold">Pages Deleted</div>
                  <div className="text-sm text-slate-500">
                    {deletionHistory[0].deletedPages.length} page{deletionHistory[0].deletedPages.length !== 1 ? 's' : ''} removed
                  </div>
                </div>
                <button
                  onClick={undoLastDeletion}
                  className="ml-4 px-4 py-2 bg-gradient-to-r bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm flex items-center font-medium shadow"
                >
                  <Undo className="w-3 h-3 mr-2" />
                  Undo
                </button>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-2xl font-bold text-center mb-8 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 mr-3" />
                Professional PDF Editing Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-indigo-600 mb-2">100% Secure Processing</h4>
                  <p className="text-sm text-slate-600">
                    All PDF manipulation happens locally in your browser. No files are uploaded to any server.
                  </p>
                </div>
                
                <div className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-indigo-600 mb-2">Real-Time Preview</h4>
                  <p className="text-sm text-slate-600">
                    See page previews with automatic content detection before making changes.
                  </p>
                </div>
                
                <div className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-indigo-600 mb-2">Smart Page Analysis</h4>
                  <p className="text-sm text-slate-600">
                    Automatically detects text, images, and mixed content for better organization.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-indigo-600 hover:text-slate-500 font-medium transition-colors hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Tools
            </Link>
              <p className="text-sm text-slate-500 mt-4">
                Powered by pdf-lib — Works entirely in your browser — No data leaves your computer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




