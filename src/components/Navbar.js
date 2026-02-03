/**
 * Navbar Component
 * Top navigation with mode switching and export functionality
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ currentMode, onModeChange }) {
  const location = useLocation();
  const isBuilder = location.pathname === '/builder';
  const isEditor = location.pathname === '/editor';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">⚒</span>
            <span className="logo-text">FormForge</span>
          </Link>
          
          <div className="navbar-modes">
            <Link 
              to="/builder" 
              className={`mode-tab ${isBuilder ? 'active' : ''}`}
            >
              <span className="mode-icon">✏</span>
              Form Builder
            </Link>
            <Link 
              to="/editor" 
              className={`mode-tab ${isEditor ? 'active' : ''}`}
            >
              <span className="mode-icon">📄</span>
              PDF Editor
            </Link>
          </div>
        </div>

        <div className="navbar-right">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="navbar-link"
          >
            <span>Documentation</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
