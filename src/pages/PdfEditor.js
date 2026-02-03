/**
 * PdfEditor Page
 * Upload existing PDF and add fillable fields
 */

import React, { useState, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FieldPalette from '../components/FieldPalette';
import PropertiesPanel from '../components/PropertiesPanel';
import PdfCanvas from '../components/PdfCanvas';
import axios from 'axios';
import './PdfEditor.css';

const API_URL = 'http://localhost:5000/api/pdf';

function PdfEditor() {
  const [pdfData, setPdfData] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef(null);

  // Handle PDF upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPdfData(response.data.pdfBase64);
      setPdfPages(response.data.pages);
      setCurrentPage(1);
      setFields([]);
      setSelectedFieldId(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PDF. Make sure the server is running.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add field to canvas
  const handleFieldAdd = useCallback((field) => {
    setFields(prev => [...prev, field]);
    setSelectedFieldId(field.id);
  }, []);

  // Update field properties
  const handleFieldUpdate = useCallback((id, updatedField) => {
    if (!id) {
      setSelectedFieldId(null);
      return;
    }
    
    setFields(prev => prev.map(f => f.id === id ? updatedField : f));
  }, []);

  // Delete field
  const handleFieldDelete = useCallback((id) => {
    setFields(prev => prev.filter(f => f.id !== id));
    setSelectedFieldId(null);
  }, []);

  // Export as fillable PDF
  const handleExport = async () => {
    if (!pdfData || fields.length === 0) {
      alert('Upload a PDF and add some fields before exporting!');
      return;
    }

    setIsExporting(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/generate-from-existing`,
        { pdfBase64: pdfData, fields },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'formforge-edited.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export PDF. Make sure the server is running.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);
  const currentPageInfo = pdfPages.find(p => p.pageNumber === currentPage);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="pdf-editor">
        {!pdfData ? (
          // Upload Screen
          <div className="upload-screen">
            <div className="upload-card">
              <div className="upload-icon">📄</div>
              <h2>Upload Your PDF</h2>
              <p>Add fillable form fields to an existing PDF document</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              
              <button
                className="btn-primary upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? '⏳ Uploading...' : '📁 Choose PDF File'}
              </button>

              <div className="upload-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Add text fields</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Add checkboxes</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Add signature fields</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Multi-page support</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Editor Screen
          <>
            {/* Toolbar */}
            <div className="toolbar">
              <div className="toolbar-section">
                <button
                  className="btn-secondary toolbar-btn"
                  onClick={() => {
                    if (window.confirm('Upload a new PDF? Current work will be lost.')) {
                      setPdfData(null);
                      setFields([]);
                      setPdfPages([]);
                    }
                  }}
                >
                  ← New PDF
                </button>
              </div>

              <div className="toolbar-section">
                {pdfPages.length > 1 && (
                  <div className="page-navigation">
                    <button
                      className="btn-ghost"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>
                    <span className="page-info">
                      Page {currentPage} of {pdfPages.length}
                    </span>
                    <button
                      className="btn-ghost"
                      onClick={() => setCurrentPage(Math.min(pdfPages.length, currentPage + 1))}
                      disabled={currentPage === pdfPages.length}
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              <div className="toolbar-section">
                <div className="field-count">
                  {fields.length} field{fields.length !== 1 ? 's' : ''}
                </div>
                
                <button
                  className="btn-primary toolbar-btn"
                  onClick={handleExport}
                  disabled={isExporting || fields.length === 0}
                >
                  {isExporting ? '⏳ Exporting...' : '⬇ Export PDF'}
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="editor-content">
              <FieldPalette />
              
              <PdfCanvas
                pdfBase64={pdfData}
                fields={fields}
                onFieldAdd={handleFieldAdd}
                onFieldUpdate={handleFieldUpdate}
                onFieldDelete={handleFieldDelete}
                selectedFieldId={selectedFieldId}
                onFieldSelect={setSelectedFieldId}
                currentPage={currentPage}
                pageSize={currentPageInfo}
              />
              
              <PropertiesPanel
                selectedField={selectedField}
                onFieldUpdate={handleFieldUpdate}
                onFieldDelete={handleFieldDelete}
              />
            </div>
          </>
        )}
      </div>
    </DndProvider>
  );
}

export default PdfEditor;
