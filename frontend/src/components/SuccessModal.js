import React from 'react';

function SuccessModal({ show, onClose, result, apiUrl }) {
  if (!show || !result) return null;

  const isDuplicate = result.is_duplicate;
  const imageUrl = `${apiUrl}${result.url}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isDuplicate ? '🔍' : '✅'} {isDuplicate ? 'Duplicate Detected' : 'Upload Successful'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {isDuplicate ? (
            <div>
              <p style={{ marginBottom: '15px', fontSize: '1.05rem' }}>
                This image has already been uploaded. We've saved you from creating a duplicate!
              </p>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Original Uploaded</span>
                  <span className="info-value">
                    {new Date(result.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '15px', fontSize: '1.05rem' }}>
                Your image has been uploaded successfully and is being processed.
              </p>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Filename</span>
                  <span className="info-value">{result.filename}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">File Hash</span>
                  <span className="info-value">
                    {result.file_hash?.substring(0, 16)}...
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Uploads Used</span>
                  <span className="info-value">{result.uploads_used}</span>
                </div>
              </div>

              {result.processing_complete && (
                <div className="processing-status" style={{ background: '#d4edda' }}>
                  <span style={{ fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: '#155724', fontWeight: '500' }}>
                    Processing completed
                  </span>
                </div>
              )}

              {result.processing_failed && (
                <div className="processing-status" style={{ background: '#f8d7da' }}>
                  <span style={{ fontSize: '1.2rem' }}>✗</span>
                  <span style={{ color: '#721c24', fontWeight: '500' }}>
                    Processing failed
                  </span>
                </div>
              )}

              {!result.processing_complete && !result.processing_failed && result.task_id && (
                <div className="processing-status">
                  <div className="spinner-small"></div>
                  <span style={{ color: '#0c5460', fontWeight: '500' }}>
                    Processing image...
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '1.05rem'
              }}
            >
              View Image →
            </a>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
