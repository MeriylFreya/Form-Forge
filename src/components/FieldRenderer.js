/**
 * FieldRenderer Component
 * Renders individual fields on canvas with drag, resize, and select
 */

import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import './FieldRenderer.css';

function FieldRenderer({ 
  field, 
  isSelected, 
  onSelect, 
  onMove, 
  onResize,
  onDelete,
  zoom = 1
}) {
  const fieldRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  // Drag existing field to move it
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EXISTING_FIELD',
    item: () => {
      return { 
        id: field.id,
        initialX: field.x,
        initialY: field.y
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) return;
      
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      const newX = Math.max(0, item.initialX + delta.x / zoom);
      const newY = Math.max(0, item.initialY + delta.y / zoom);
      
      onMove(field.id, newX, newY);
    }
  }));

  // Handle manual drag for when drag-and-drop doesn't work
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    if (e.target.closest('.resize-handle')) return; // Don't drag if resizing
    
    e.preventDefault();
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      fieldX: field.x,
      fieldY: field.y
    });
  };

  useEffect(() => {
    if (!dragStart) return;

    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      const newX = Math.max(0, dragStart.fieldX + deltaX);
      const newY = Math.max(0, dragStart.fieldY + deltaY);

      onMove(field.id, newX, newY);
    };

    const handleMouseUp = () => {
      setDragStart(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragStart, zoom, onMove, field.id]);

  // Handle resize
  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = field.width;
    const startHeight = field.height;

    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) newWidth = Math.max(20, startWidth + deltaX);
      if (direction.includes('w')) newWidth = Math.max(20, startWidth - deltaX);
      if (direction.includes('s')) newHeight = Math.max(20, startHeight + deltaY);
      if (direction.includes('n')) newHeight = Math.max(20, startHeight - deltaY);

      onResize(field.id, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Combine refs for drag
  const setRefs = (element) => {
    fieldRef.current = element;
    drag(element);
  };

  // Get field icon based on type
  const getFieldIcon = () => {
    switch (field.type) {
      case 'text': return '📝';
      case 'date': return '📅';
      case 'checkbox': return '☑';
      case 'signature': return '✍';
      case 'label': return '🏷';
      default: return '📄';
    }
  };

  // Render field content based on type
  const renderFieldContent = () => {
    switch (field.type) {
      case 'text':
      case 'date':
        return (
          <input
            type="text"
            placeholder={field.label || 'Enter text'}
            className="field-input"
            readOnly
          />
        );
      
      case 'checkbox':
        return (
          <div className="field-checkbox">
            <input type="checkbox" disabled />
          </div>
        );
      
      case 'signature':
        return (
          <div className="field-signature">
            <span className="signature-icon">✍️</span>
            <span className="signature-text">Sign here</span>
          </div>
        );
      
      case 'label':
        return (
          <div 
            className="field-label-content"
            style={{
              fontSize: `${field.fontSize || 12}px`,
              fontWeight: field.bold ? 'bold' : 'normal'
            }}
          >
            {field.label || 'Label Text'}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      ref={setRefs}
      className={`field-renderer ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} field-type-${field.type}`}
      style={{
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width}px`,
        height: `${field.height}px`
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="field-content">
        {renderFieldContent()}
      </div>

      {isSelected && (
        <>
          {/* Field Label */}
          <div className="field-type-badge">
            <span className="badge-icon">{getFieldIcon()}</span>
            <span className="badge-text">{field.type}</span>
          </div>

          {/* Delete Button */}
          <button
            className="field-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            ×
          </button>

          {/* Resize Handles */}
          <div className="resize-handles">
            <div className="resize-handle nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
            <div className="resize-handle ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
            <div className="resize-handle sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
            <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
          </div>
        </>
      )}
    </div>
  );
}

export default FieldRenderer;
