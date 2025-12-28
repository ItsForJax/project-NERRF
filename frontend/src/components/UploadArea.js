import React, { useState, useRef } from 'react';
import './UploadArea.css';

function UploadArea({ onUpload, loading }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-section">
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAreaClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {!previewUrl ? (
          <>
            <div className="upload-icon">☁️</div>
            <p className="upload-text">
              <strong>Click to select</strong> or drag and drop
            </p>
            <p className="upload-hint">
              Supported: JPG, PNG, GIF, WebP, BMP (Max 50MB)
            </p>
          </>
        ) : (
          <div className="preview-container">
            <img src={previewUrl} alt="Preview" className="preview-img" />
            <div className="file-info">
              <p className="file-name">{selectedFile?.name}</p>
              <p className="file-size">
                {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        className="upload-button"
        onClick={handleUploadClick}
        disabled={!selectedFile || loading}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Uploading...
          </>
        ) : (
          'Upload Image'
        )}
      </button>

      {loading && (
        <div className="upload-progress">
          <div className="progress-text">Processing your upload...</div>
        </div>
      )}
    </div>
  );
}

export default UploadArea;
