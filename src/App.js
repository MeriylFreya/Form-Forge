/**
 * FormForge App
 * Main application component with routing
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PdfEditor from './pages/PdfEditor';
import FormBuilder from './pages/FormBuilder';
import './App.css';

function App() {
  const [currentMode, setCurrentMode] = useState('builder'); // 'builder' or 'editor'

  return (
    <Router>
      <div className="app">
        <Navbar currentMode={currentMode} onModeChange={setCurrentMode} />
        <Routes>
          <Route path="/" element={<Navigate to="/builder" replace />} />
          <Route path="/builder" element={<FormBuilder />} />
          <Route path="/editor" element={<PdfEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
