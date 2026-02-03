/**
 * Canvas Component
 * Drop zone for building forms with drag-and-drop
 */

import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import FieldRenderer from './FieldRenderer';
import './Canvas.css';

function Canvas({ 
  fields, 
  onFieldAdd, 
  onFieldUpdate, 
  onFieldDelete,
  selectedFieldId,
  onFieldSelect,
  currentPage = 1,
  pageSize = { width: 612, height: 792 },
  zoom = 1,
  showGrid = true
}) {
  // Handle dropping a field type from palette
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FIELD_TYPE',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = document.querySelector('.canvas-page').getBoundingClientRect();
      
      const x = (offset.x - canvasRect.left) / zoom;
      const y = (offset.y - canvasRect.top) / zoom;
      
      // Create new field
      const newField = {
        id: `field_${Date.now()}`,
        type: item.fieldType,
        x: Math.max(0, x - 50), // Center on cursor
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

  // Handle field position update after drag
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

  // Get fields for current page
  const currentPageFields = fields.filter(f => f.page === currentPage);

  return (
    <div className="canvas-container">
      <div 
        ref={drop}
        className={`canvas-page ${isOver ? 'drag-over' : ''} ${showGrid ? 'show-grid' : ''}`}
        style={{
          width: `${pageSize.width}px`,
          height: `${pageSize.height}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
        onClick={(e) => {
          // Deselect if clicking on empty canvas
          if (e.target.classList.contains('canvas-page')) {
            onFieldSelect(null);
          }
        }}
      >
        {currentPageFields.length === 0 && (
          <div className="canvas-placeholder">
            <div className="placeholder-content">
              <span className="placeholder-icon">⚡</span>
              <h3>Start Building</h3>
              <p>Drag field types from the left sidebar to add them to your form</p>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}

export default Canvas;
