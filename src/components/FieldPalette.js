/**
 * FieldPalette Component
 * Sidebar with draggable field types
 */

import React from 'react';
import { useDrag } from 'react-dnd';
import './FieldPalette.css';

const FIELD_TYPES = [
  { type: 'text', label: 'Text Input', icon: '📝', color: '#7a9b76' },
  { type: 'date', label: 'Date Field', icon: '📅', color: '#d97757' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑', color: '#5a8fb5' },
  { type: 'signature', label: 'Signature', icon: '✍', color: '#9b7ab8' },
  { type: 'label', label: 'Text Label', icon: '🏷', color: '#b8975a' }
];

function DraggableFieldType({ type, label, icon, color }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD_TYPE',
    item: { fieldType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`palette-item ${isDragging ? 'dragging' : ''}`}
      style={{ '--item-color': color }}
    >
      <span className="palette-icon">{icon}</span>
      <span className="palette-label">{label}</span>
    </div>
  );
}

function FieldPalette() {
  return (
    <div className="field-palette">
      <div className="palette-header">
        <h3>Field Types</h3>
        <p className="palette-subtitle">Drag to add</p>
      </div>
      
      <div className="palette-items">
        {FIELD_TYPES.map((field) => (
          <DraggableFieldType
            key={field.type}
            type={field.type}
            label={field.label}
            icon={field.icon}
            color={field.color}
          />
        ))}
      </div>

      <div className="palette-footer">
        <div className="palette-tip">
          <span className="tip-icon">💡</span>
          <p>Click a field on canvas to edit its properties</p>
        </div>
      </div>
    </div>
  );
}

export default FieldPalette;
