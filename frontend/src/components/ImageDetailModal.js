import React from 'react';
import './ImageDetailModal.css';

function ImageDetailModal({ image, apiUrl, onClose }) {
  if (!image) return null;

  const imageUrl = `${apiUrl}${image.url}`;

  return (
    <div className="image-detail-overlay" onClick={onClose}>
      <div className="image-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="image-detail-close" onClick={onClose}>
          ×
        </button>

        <div className="image-detail-content">
          {/* Image Section */}
          <div className="image-detail-image-section">
            <img
              src={imageUrl}
              alt={image.name}
              className="image-detail-image"
            />
          </div>

          {/* Details Section */}
          <div className="image-detail-info-section">
            <h2 className="image-detail-title">{image.name}</h2>

            {image.description && (
              <div className="image-detail-section">
                <h3 className="image-detail-section-title">Description</h3>
                <p className="image-detail-description">{image.description}</p>
              </div>
            )}

            {image.tags && image.tags.length > 0 && (
              <div className="image-detail-section">
                <h3 className="image-detail-section-title">Tags</h3>
                <div className="image-detail-tags">
                  {image.tags.map((tag, index) => (
                    <span key={index} className="image-detail-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="image-detail-section">
              <h3 className="image-detail-section-title">Information</h3>
              <div className="image-detail-meta">
                <div className="image-detail-meta-item">
                  <span className="meta-label">Uploaded</span>
                  <span className="meta-value">
                    {new Date(image.uploaded_at).toLocaleString()}
                  </span>
                </div>
                {image.file_hash && (
                  <div className="image-detail-meta-item">
                    <span className="meta-label">File Hash</span>
                    <span className="meta-value hash">
                      {image.file_hash.substring(0, 16)}...
                    </span>
                  </div>
                )}
                {image.image_id && (
                  <div className="image-detail-meta-item">
                    <span className="meta-label">Image ID</span>
                    <span className="meta-value">#{image.image_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="image-detail-actions">
              <a
                href={imageUrl}
                download
                className="btn-action btn-download"
              >
                📥 Download
              </a>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-action btn-open"
              >
                🔗 Open in New Tab
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageDetailModal;
