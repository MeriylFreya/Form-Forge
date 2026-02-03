/**
 * PdfCanvas Component
 * Displays PDF pages with field overlay
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import FieldRenderer from './FieldRenderer';
import * as pdfjsLib from 'pdfjs-dist';
import './PdfCanvas.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function PdfCanvas({
  pdfBase64,
  fields,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  selectedFieldId,
  onFieldSelect,
  currentPage = 1,
  pageSize
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Load PDF
  useEffect(() => {
    if (!pdfBase64) return;

    const loadPdf = async () => {
      try {
        const pdfData = atob(pdfBase64);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [pdfBase64]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      setRendering(true);
      
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
      } catch (error) {
        console.error('Error rendering page:', error);
      } finally {
        setRendering(false);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, zoom]);

  // Handle dropping a field type from palette
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FIELD_TYPE',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      const x = (offset.x - canvasRect.left) / zoom;
      const y = (offset.y - canvasRect.top) / zoom;
      
      // Create new field
      const newField = {
        id: `field_${Date.now()}`,
        type: item.fieldType,
        x: Math.max(0, x - 50),
        y: Math.max(0, y - 15),
        width: item.fieldType === 'checkbox' ? 20 : 200,
        height: item.fieldType === 'checkbox' ? 20 : 30,
        page: currentPage,
        label: `${item.fieldType.charAt(0).toUpperCase() + item.fieldType.slice(1)} Field`,
        fontSize: 12,
        bold: false
      };
      
      onFieldAdd(newField);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  // Handle field position update
  const handleFieldMove = useCallback((id, x, y) => {
    const field = fields.find(f => f.id === id);
    if (field) {
      onFieldUpdate(id, { ...field, x, y });
    }
  }, [fields, onFieldUpdate]);

  // Handle field resize
  const handleFieldResize = useCallback((id, width, height) => {
    const field = fields.find(f => f.id === id);
    if (field) {
      onFieldUpdate(id, { ...field, width, height });
    }
  }, [fields, onFieldUpdate]);

  // Combine refs
  const setRefs = (element) => {
    containerRef.current = element;
    drop(element);
  };

  // Get fields for current page
  const currentPageFields = fields.filter(f => f.page === currentPage);

  return (
    <div className="pdf-canvas-container">
      <div className="pdf-canvas-controls">
        <button
          className="btn-ghost"
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
        >
          −
        </button>
        <span className="zoom-value">{Math.round(zoom * 100)}%</span>
        <button
          className="btn-ghost"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
        >
          +
        </button>
      </div>

      <div className="pdf-canvas-wrapper">
        <div
          ref={setRefs}
          className={`pdf-canvas-overlay ${isOver ? 'drag-over' : ''}`}
          onClick={(e) => {
            if (e.target.classList.contains('pdf-canvas-overlay')) {
              onFieldSelect(null);
            }
          }}
        >
          <canvas ref={canvasRef} className="pdf-canvas" />
          
          {currentPageFields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              isSelected={selectedFieldId === field.id}
              onSelect={() => onFieldSelect(field.id)}
              onMove={handleFieldMove}
              onResize={handleFieldResize}
              onDelete={() => onFieldDelete(field.id)}
              zoom={zoom}
            />
          ))}

          {rendering && (
            <div className="pdf-loading">
              <div className="spinner"></div>
              <p>Rendering page...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PdfCanvas;
