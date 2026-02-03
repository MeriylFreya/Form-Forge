/**
 * FormBuilder Page
 * Main page for building forms from scratch with drag-and-drop
 */

import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FieldPalette from '../components/FieldPalette';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import axios from 'axios';
import './FormBuilder.css';

const API_URL = 'http://localhost:5000/api/pdf';

function FormBuilder() {
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState({ width: 612, height: 792 }); // Letter size
  const [zoom, setZoom] = useState(0.8);
  const [showGrid, setShowGrid] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Add field to canvas
  const handleFieldAdd = useCallback((field) => {
    setFields(prev => {
      const newFields = [...prev, field];
      addToHistory(newFields);
      return newFields;
    });
    setSelectedFieldId(field.id);
  }, []);

  // Update field properties
  const handleFieldUpdate = useCallback((id, updatedField) => {
    if (!id) {
      setSelectedFieldId(null);
      return;
    }
    
    setFields(prev => {
      const newFields = prev.map(f => f.id === id ? updatedField : f);
      addToHistory(newFields);
      return newFields;
    });
  }, []);

  // Delete field
  const handleFieldDelete = useCallback((id) => {
    setFields(prev => {
      const newFields = prev.filter(f => f.id !== id);
      addToHistory(newFields);
      return newFields;
    });
    setSelectedFieldId(null);
  }, []);

  // History management
  const addToHistory = (newFields) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newFields)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFields(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFields(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Export as PDF
  const handleExport = async () => {
    if (fields.length === 0) {
      alert('Add some fields before exporting!');
      return;
    }

    setIsExporting(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/generate-from-layout`,
        { fields, pageSize },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'formforge-form.pdf');
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

  // Save layout as JSON
  const handleSaveLayout = () => {
    const layout = {
      fields,
      pageSize,
      createdAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(layout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formforge-layout.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Load layout from JSON
  const handleLoadLayout = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layout = JSON.parse(e.target.result);
        setFields(layout.fields || []);
        addToHistory(layout.fields || []);
      } catch (error) {
        alert('Invalid layout file');
      }
    };
    reader.readAsText(file);
  };

  // Clear canvas
  const handleClear = () => {
    if (window.confirm('Clear all fields?')) {
      setFields([]);
      setSelectedFieldId(null);
      addToHistory([]);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="form-builder">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-section">
            <button
              className="btn-secondary toolbar-btn"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              className="btn-secondary toolbar-btn"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>

          <div className="toolbar-section">
            <button
              className="btn-secondary toolbar-btn"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? '⊞' : '⊡'} Grid
            </button>
            
            <div className="zoom-controls">
              <button
                className="btn-ghost"
                onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
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
          </div>

          <div className="toolbar-section">
            <input
              type="file"
              accept=".json"
              onChange={handleLoadLayout}
              style={{ display: 'none' }}
              id="load-layout"
            />
            <label htmlFor="load-layout" className="btn-secondary toolbar-btn">
              📂 Load
            </label>
            
            <button
              className="btn-secondary toolbar-btn"
              onClick={handleSaveLayout}
              disabled={fields.length === 0}
            >
              💾 Save
            </button>

            <button
              className="btn-secondary toolbar-btn"
              onClick={handleClear}
              disabled={fields.length === 0}
            >
              🗑 Clear
            </button>
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
        <div className="builder-content">
          <FieldPalette />
          
          <Canvas
            fields={fields}
            onFieldAdd={handleFieldAdd}
            onFieldUpdate={handleFieldUpdate}
            onFieldDelete={handleFieldDelete}
            selectedFieldId={selectedFieldId}
            onFieldSelect={setSelectedFieldId}
            currentPage={currentPage}
            pageSize={pageSize}
            zoom={zoom}
            showGrid={showGrid}
          />
          
          <PropertiesPanel
            selectedField={selectedField}
            onFieldUpdate={handleFieldUpdate}
            onFieldDelete={handleFieldDelete}
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default FormBuilder;
