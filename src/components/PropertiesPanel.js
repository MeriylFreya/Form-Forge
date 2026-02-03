/**
 * PropertiesPanel Component
 * Right sidebar for editing selected field properties
 */

import React, { useState, useEffect } from 'react';
import './PropertiesPanel.css';

function PropertiesPanel({ selectedField, onFieldUpdate, onFieldDelete }) {
  const [localField, setLocalField] = useState(null);

  useEffect(() => {
    setLocalField(selectedField);
  }, [selectedField]);

  if (!localField) {
    return (
      <div className="properties-panel">
        <div className="properties-header">
          <h3>Properties</h3>
        </div>
        <div className="properties-empty">
          <span className="empty-icon">👆</span>
          <p>Select a field to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleChange = (property, value) => {
    const updatedField = { ...localField, [property]: value };
    setLocalField(updatedField);
    onFieldUpdate(localField.id, updatedField);
  };

  const handleDuplicate = () => {
    const newField = {
      ...localField,
      id: `field_${Date.now()}`,
      x: localField.x + 20,
      y: localField.y + 20
    };
    onFieldUpdate(null, newField);
  };

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Field Properties</h3>
        <button
          className="btn-ghost"
          onClick={() => onFieldUpdate(null, null)}
          title="Deselect"
        >
          ✕
        </button>
      </div>

      <div className="properties-content">
        {/* Field Type Display */}
        <div className="property-section">
          <div className="property-type-display">
            <span className="type-icon">
              {localField.type === 'text' && '📝'}
              {localField.type === 'date' && '📅'}
              {localField.type === 'checkbox' && '☑'}
              {localField.type === 'signature' && '✍'}
              {localField.type === 'label' && '🏷'}
            </span>
            <div>
              <div className="type-name">{localField.type.toUpperCase()}</div>
              <div className="type-id">ID: {localField.id}</div>
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="property-section">
          <label>Label</label>
          <input
            type="text"
            value={localField.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Field label"
          />
        </div>

        {/* Position */}
        <div className="property-section">
          <label>Position</label>
          <div className="property-grid">
            <div>
              <label className="sublabel">X</label>
              <input
                type="number"
                value={Math.round(localField.x)}
                onChange={(e) => handleChange('x', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div>
              <label className="sublabel">Y</label>
              <input
                type="number"
                value={Math.round(localField.y)}
                onChange={(e) => handleChange('y', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="property-section">
          <label>Size</label>
          <div className="property-grid">
            <div>
              <label className="sublabel">Width</label>
              <input
                type="number"
                value={Math.round(localField.width)}
                onChange={(e) => handleChange('width', parseFloat(e.target.value) || 20)}
                min="20"
              />
            </div>
            <div>
              <label className="sublabel">Height</label>
              <input
                type="number"
                value={Math.round(localField.height)}
                onChange={(e) => handleChange('height', parseFloat(e.target.value) || 20)}
                min="20"
              />
            </div>
          </div>
        </div>

        {/* Page Number */}
        <div className="property-section">
          <label>Page</label>
          <input
            type="number"
            value={localField.page || 1}
            onChange={(e) => handleChange('page', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>

        {/* Label-specific properties */}
        {localField.type === 'label' && (
          <>
            <div className="property-section">
              <label>Font Size</label>
              <input
                type="number"
                value={localField.fontSize || 12}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 12)}
                min="8"
                max="72"
              />
            </div>

            <div className="property-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localField.bold || false}
                  onChange={(e) => handleChange('bold', e.target.checked)}
                />
                <span>Bold</span>
              </label>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="property-section">
          <button
            className="btn-danger"
            onClick={() => {
              if (window.confirm('Delete this field?')) {
                onFieldDelete(localField.id);
              }
            }}
            style={{ width: '100%' }}
          >
            🗑 Delete Field
          </button>
        </div>

        {/* Quick Actions */}
        <div className="property-section">
          <label>Quick Actions</label>
          <div className="quick-actions">
            <button
              className="btn-secondary"
              onClick={handleDuplicate}
              style={{ width: '100%' }}
            >
              📋 Duplicate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;
