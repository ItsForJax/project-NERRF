import React, { useState, useEffect } from 'react';
import './App.css';
import UploadArea from './components/UploadArea';
import StatsPanel from './components/StatsPanel';
import SuccessModal from './components/SuccessModal';
import ErrorModal from './components/ErrorModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

function App() {
  const [stats, setStats] = useState({
    uploadsUsed: '-',
    remaining: '-',
    totalImages: '-'
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/my-uploads`);
      const data = await response.json();
      
      setStats({
        uploadsUsed: data.uploads_used || '-',
        remaining: data.remaining || '-',
        totalImages: data.total_uploads || '-'
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
        setShowSuccessModal(true);
        
        // Check processing status if task_id exists
        if (data.task_id && !data.is_duplicate) {
          checkTaskStatus(data.task_id);
        }
        
        // Reload stats
        loadStats();
      } else {
        setErrorMessage(data.detail || 'Upload failed');
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Network error occurred');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const checkTaskStatus = async (taskId) => {
    const maxAttempts = 10;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`${API_URL}/status/${taskId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          clearInterval(interval);
          // Update the modal with processing complete status
          setUploadResult(prev => ({
            ...prev,
            processing_complete: true
          }));
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setUploadResult(prev => ({
            ...prev,
            processing_failed: true
          }));
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>📸 Image Upload Service</h1>
          <p className="subtitle">
            Upload images with duplicate detection and rate limiting
          </p>
        </header>

        <UploadArea onUpload={handleUpload} loading={loading} />

        <StatsPanel stats={stats} />

        <SuccessModal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          result={uploadResult}
          apiUrl={API_URL}
        />

        <ErrorModal
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
        />
      </div>
    </div>
  );
}

export default App;
