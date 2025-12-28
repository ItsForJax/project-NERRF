import React, { useState, useEffect } from 'react';
import UploadArea from '../components/UploadArea';
import MetadataForm from '../components/MetadataForm';
import StatsPanel from '../components/StatsPanel';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

const API_URL = process.env.REACT_APP_API_URL || '';
console.warn(API_URL);

function UploadPage() {
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    tags: []
  });

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

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleMetadataChange = (newMetadata) => {
    setMetadata(newMetadata);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', metadata.name || selectedFile.name);
    formData.append('description', metadata.description);
    formData.append('tags', JSON.stringify(metadata.tags));

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
        
        // Reset form
        setSelectedFile(null);
        setMetadata({ name: '', description: '', tags: [] });
        
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
    <div className="container">
      <header className="header">
        <h1>📸 Upload Image</h1>
        <p className="subtitle">
          Upload images with metadata, duplicate detection and rate limiting
        </p>
      </header>

      <UploadArea onFileSelect={handleFileSelect} selectedFile={selectedFile} />

      {selectedFile && (
        <MetadataForm
          metadata={metadata}
          onChange={handleMetadataChange}
          onUpload={handleUpload}
          loading={loading}
        />
      )}

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
  );
}

export default UploadPage;
