import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav-bar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              📸 Image Upload Service
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Upload</Link>
              <Link to="/search" className="nav-link">Search</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
