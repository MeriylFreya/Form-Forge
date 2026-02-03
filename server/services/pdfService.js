/**
 * PDF Service
 * Handles PDF generation and manipulation using pdf-lib
 */

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

/**
 * Get information about a PDF (page count, dimensions)
 */
async function getPdfInfo(pdfBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  
  const pagesInfo = pages.map((page, index) => ({
    pageNumber: index + 1,
    width: page.getWidth(),
    height: page.getHeight()
  }));

  return {
    pageCount: pages.length,
    pages: pagesInfo
  };
}

/**
 * Convert HTML coordinates (top-left origin) to PDF coordinates (bottom-left origin)
 */
function convertCoordinates(htmlY, fieldHeight, pageHeight) {
  return pageHeight - htmlY - fieldHeight;
}

/**
 * Generate a fillable PDF from scratch based on layout
 */
async function generatePdfFromLayout(fields, pageSize = { width: 612, height: 792 }) {
  // Create a new PDF document (Letter size default: 612 x 792 points)
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Group fields by page
  const fieldsByPage = {};
  fields.forEach(field => {
    const pageNum = field.page || 1;
    if (!fieldsByPage[pageNum]) {
      fieldsByPage[pageNum] = [];
    }
    fieldsByPage[pageNum].push(field);
  });

  // Get max page number
  const maxPage = Math.max(...Object.keys(fieldsByPage).map(Number), 1);
  
  // Create pages
  const pages = [];
  for (let i = 1; i <= maxPage; i++) {
    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);
    pages.push(page);
  }

  // Get form
  const form = pdfDoc.getForm();

  // Add fields to pages
  for (const [pageNum, pageFields] of Object.entries(fieldsByPage)) {
    const page = pages[parseInt(pageNum) - 1];
    const pageHeight = page.getHeight();

    for (const field of pageFields) {
      const pdfY = convertCoordinates(field.y, field.height, pageHeight);

      try {
        switch (field.type) {
          case 'text':
            const textField = form.createTextField(field.id);
            textField.addToPage(page, {
              x: field.x,
              y: pdfY,
              width: field.width,
              height: field.height,
              borderWidth: 1,
              borderColor: rgb(0.5, 0.5, 0.5)
            });
            if (field.label) {
              textField.setText('');
              textField.setAlignment(0); // Left align
            }
            textField.enableMultiline();
            break;

          case 'date':
            const dateField = form.createTextField(field.id);
            dateField.addToPage(page, {
              x: field.x,
              y: pdfY,
              width: field.width,
              height: field.height,
              borderWidth: 1,
              borderColor: rgb(0.5, 0.5, 0.5)
            });
            dateField.setText('');
            break;

          case 'checkbox':
            const checkbox = form.createCheckBox(field.id);
            checkbox.addToPage(page, {
              x: field.x,
              y: pdfY,
              width: Math.min(field.width, field.height),
              height: Math.min(field.width, field.height),
              borderWidth: 1,
              borderColor: rgb(0, 0, 0)
            });
            break;

          case 'signature':
            // Signature fields are special - we create a button that can be filled
            const sigField = form.createTextField(field.id);
            sigField.addToPage(page, {
              x: field.x,
              y: pdfY,
              width: field.width,
              height: field.height,
              borderWidth: 1,
              borderColor: rgb(0, 0, 0.8)
            });
            sigField.setText('');
            break;

          case 'label':
            // Labels are static text drawn on the page
            page.drawText(field.label || 'Label', {
              x: field.x,
              y: pdfY + (field.height / 2) - 5,
              size: field.fontSize || 12,
              font: field.bold ? boldFont : font,
              color: rgb(0, 0, 0)
            });
            break;
        }

        // Draw label above field if present (except for label type)
        if (field.label && field.type !== 'label') {
          page.drawText(field.label, {
            x: field.x,
            y: pdfY + field.height + 5,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
      } catch (error) {
        console.error(`Error adding field ${field.id}:`, error);
      }
    }
  }

  // Save and return the PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Add fillable fields to an existing PDF
 */
async function addFieldsToExistingPdf(pdfBuffer, fields) {
  // Load the existing PDF
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add fields to the PDF
  for (const field of fields) {
    const pageIndex = (field.page || 1) - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) {
      console.warn(`Field ${field.id} references invalid page ${field.page}`);
      continue;
    }

    const page = pages[pageIndex];
    const pageHeight = page.getHeight();
    const pdfY = convertCoordinates(field.y, field.height, pageHeight);

    try {
      switch (field.type) {
        case 'text':
          const textField = form.createTextField(field.id);
          textField.addToPage(page, {
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
            borderWidth: 1,
            borderColor: rgb(0.5, 0.5, 0.5),
            backgroundColor: rgb(1, 1, 0.9)
          });
          textField.enableMultiline();
          break;

        case 'date':
          const dateField = form.createTextField(field.id);
          dateField.addToPage(page, {
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
            borderWidth: 1,
            borderColor: rgb(0.5, 0.5, 0.5),
            backgroundColor: rgb(1, 1, 0.9)
          });
          break;

        case 'checkbox':
          const checkbox = form.createCheckBox(field.id);
          checkbox.addToPage(page, {
            x: field.x,
            y: pdfY,
            width: Math.min(field.width, field.height),
            height: Math.min(field.width, field.height),
            borderWidth: 1,
            borderColor: rgb(0, 0, 0)
          });
          break;

        case 'signature':
          const sigField = form.createTextField(field.id);
          sigField.addToPage(page, {
            x: field.x,
            y: pdfY,
            width: field.width,
            height: field.height,
            borderWidth: 2,
            borderColor: rgb(0, 0, 0.8),
            backgroundColor: rgb(0.95, 0.95, 1)
          });
          break;
      }

      // Draw label above field if present
      if (field.label && field.type !== 'label') {
        page.drawText(field.label, {
          x: field.x,
          y: pdfY + field.height + 5,
          size: 9,
          font: boldFont,
          color: rgb(0, 0, 0)
        });
      }
    } catch (error) {
      console.error(`Error adding field ${field.id}:`, error);
    }
  }

  // Save and return the modified PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = {
  getPdfInfo,
  generatePdfFromLayout,
  addFieldsToExistingPdf,
  convertCoordinates
};
