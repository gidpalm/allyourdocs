// C:\Users\Servn\allyourdocs\backend\index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mammoth = require('mammoth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== FILE UPLOAD ====================
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Word documents (.doc, .docx) are supported.'), false);
    }
  }
});

// ==================== HELPER FUNCTIONS ====================
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ==================== ROUTES ====================

// 1. ROOT ENDPOINT - Check if server is running
app.get('/', (req, res) => {
  res.json({
    message: '📚 AllYourDocs Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/word-to-pdf',
      'POST /api/merge-pdf',
      'POST /api/pdf-to-word'
    ],
    timestamp: new Date().toISOString()
  });
});

// 2. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 3. WORD TO PDF - MAIN ENDPOINT
app.post('/api/word-to-pdf', upload.single('file'), async (req, res) => {
  console.log('📥 Word to PDF request received');
  
  try {
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a Word document'
      });
    }
    
    console.log(`📄 Processing file: ${req.file.originalname} (${formatBytes(req.file.size)})`);
    console.log(`📝 Mime type: ${req.file.mimetype}`);
    
    let extractedText = '';
    
    // Extract text from Word document
    try {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
      console.log(`✅ Extracted ${extractedText.length} characters from document`);
    } catch (mammothError) {
      console.error('❌ Error extracting text:', mammothError.message);
      extractedText = `Document: ${req.file.originalname}\n\nError: Could not extract text from this document.\n\nFile processed: ${new Date().toLocaleString()}`;
    }
    
    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Converted: ${req.file.originalname}`,
        Author: 'AllYourDocs Converter',
        CreationDate: new Date()
      }
    });
    
    const chunks = [];
    
    // Collect PDF chunks
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      console.log(`✅ PDF created: ${formatBytes(pdfBuffer.length)}`);
      
      // Send PDF as response
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${req.file.originalname.replace(/\.[^/.]+$/, '')}_converted.pdf"`,
        'Content-Length': pdfBuffer.length,
        'X-Conversion-Success': 'true',
        'X-File-Name': req.file.originalname,
        'X-PDF-Size': formatBytes(pdfBuffer.length)
      });
      
      res.send(pdfBuffer);
    });
    
    // Add content to PDF
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Converted Document', { align: 'center' })
       .moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Original: ${req.file.originalname}`, { align: 'center' })
       .text(`Converted: ${new Date().toLocaleString()}`, { align: 'center' })
       .moveDown(2);
    
    // Add separator line
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .lineWidth(1)
       .strokeColor('#CCCCCC')
       .stroke()
       .moveDown(1.5);
    
    // Add the extracted text
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#000000')
       .text(extractedText);
    
    // Add footer
    doc.addPage();
    doc.fontSize(10)
       .fillColor('#999999')
       .text('─'.repeat(50), { align: 'center' })
       .moveDown(0.5)
       .text('Converted using AllYourDocs Document Converter', { align: 'center' });
    
    doc.end();
    
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 4. TEST UPLOAD ENDPOINT
app.post('/api/test-upload', upload.single('file'), (req, res) => {
  console.log('🧪 Test upload received');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    success: true,
    message: 'File upload test successful',
    file: {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      encoding: req.file.encoding
    }
  });
});

// 5. ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 10MB'
      });
    }
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// 6. 404 HANDLER
app.use('*', (req, res) => {
  console.log(`🔍 404 Not Found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    error: 'Endpoint not found',
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/word-to-pdf',
      'POST /api/test-upload'
    ],
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         📚 AllYourDocs Backend Server                   ║
╠══════════════════════════════════════════════════════════╣
║ Status:    ✅ RUNNING                                    ║
║ Port:      ${PORT}                                         ║
║ URL:       http://localhost:${PORT}                         ║
║ API Base:  http://localhost:${PORT}/api                     ║
╠══════════════════════════════════════════════════════════╣
║ Endpoints:                                               ║
║ 🔗 GET  /                 - API information             ║
║ 🔗 GET  /api/health       - Health check                ║
║ 📤 POST /api/word-to-pdf  - Convert Word to PDF         ║
║ 🧪 POST /api/test-upload  - Test file upload            ║
╚══════════════════════════════════════════════════════════╝
  `);
});