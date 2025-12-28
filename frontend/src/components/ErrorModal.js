import React from 'react';

function ErrorModal({ show, onClose, message }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            ❌ Upload Failed
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '1.05rem', color: '#721c24' }}>
            {message || 'An error occurred while uploading your image.'}
          </p>

          <div style={{ marginTop: '20px', padding: '15px', background: '#f8d7da', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: '#721c24', margin: 0 }}>
              <strong>Common issues:</strong>
            </p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#721c24', fontSize: '0.9rem' }}>
              <li>File size exceeds 50MB limit</li>
              <li>Invalid file type (must be an image)</li>
              <li>Upload limit reached (25 images per IP)</li>
              <li>Network connection issue</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
