/**
 * PDF Routes
 * Handles PDF upload, generation, and manipulation
 */

const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

/**
 * POST /api/pdf/upload
 * Upload a PDF file
 */
router.post('/upload', (req, res, next) => {
  const upload = req.app.locals.upload.single('pdf');
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Read the PDF file
      const pdfBuffer = fs.readFileSync(req.file.path);
      
      // Get PDF info (page count, dimensions)
      const pdfInfo = await pdfService.getPdfInfo(pdfBuffer);
      
      // Convert PDF to base64 for frontend display
      const pdfBase64 = pdfBuffer.toString('base64');
      
      res.json({
        success: true,
        filename: req.file.filename,
        originalName: req.file.originalname,
        pdfBase64: pdfBase64,
        pageCount: pdfInfo.pageCount,
        pages: pdfInfo.pages
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to process PDF', message: error.message });
    }
  });
});

/**
 * POST /api/pdf/generate-from-layout
 * Generate a fillable PDF from scratch based on layout JSON
 */
router.post('/generate-from-layout', async (req, res) => {
  try {
    const { fields, pageSize } = req.body;
    
    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: 'Invalid fields data' });
    }

    // Generate PDF from layout
    const pdfBuffer = await pdfService.generatePdfFromLayout(fields, pageSize);
    
    // Send as downloadable file
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="formforge-form.pdf"',
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate from layout error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', message: error.message });
  }
});

/**
 * POST /api/pdf/generate-from-existing
 * Add fillable fields to an existing PDF
 */
router.post('/generate-from-existing', async (req, res) => {
  try {
    const { pdfBase64, fields } = req.body;
    
    if (!pdfBase64 || !fields) {
      return res.status(400).json({ error: 'Missing PDF data or fields' });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    // Add fields to existing PDF
    const modifiedPdfBuffer = await pdfService.addFieldsToExistingPdf(pdfBuffer, fields);
    
    // Send as downloadable file
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="formforge-edited.pdf"',
      'Content-Length': modifiedPdfBuffer.length
    });
    
    res.send(modifiedPdfBuffer);
  } catch (error) {
    console.error('Generate from existing error:', error);
    res.status(500).json({ error: 'Failed to modify PDF', message: error.message });
  }
});

/**
 * POST /api/pdf/save-layout
 * Save layout as JSON (for future: could save to database)
 */
router.post('/save-layout', async (req, res) => {
  try {
    const { name, fields, pageSize } = req.body;
    
    const layout = {
      name,
      fields,
      pageSize,
      createdAt: new Date().toISOString()
    };

    // For now, just echo back - in production, save to database
    res.json({
      success: true,
      layout,
      message: 'Layout saved successfully'
    });
  } catch (error) {
    console.error('Save layout error:', error);
    res.status(500).json({ error: 'Failed to save layout', message: error.message });
  }
});

module.exports = router;
