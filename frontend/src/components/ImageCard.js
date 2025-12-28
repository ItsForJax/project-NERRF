import React from 'react';
import './ImageCard.css';

function ImageCard({ image, apiUrl, onViewDetails }) {
  // Use thumbnail for card, full image for modal
  const thumbnailUrl = image.thumbnail_url 
    ? `${apiUrl}${image.thumbnail_url}` 
    : `${apiUrl}${image.url}`;

  return (
    <div className="image-card" onClick={() => onViewDetails(image)}>
      <div className="image-card-image-container">
        <img
          src={thumbnailUrl}
          alt={image.name}
          className="image-card-image"
          loading="lazy"
        />
      </div>
      
      <div className="image-card-content">
        <h3 className="image-card-title">{image.name}</h3>
        
        {image.description && (
          <p className="image-card-description">{image.description}</p>
        )}
        
        {image.tags && image.tags.length > 0 && (
          <div className="image-card-tags">
            {image.tags.map((tag, index) => (
              <span key={index} className="image-card-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="image-card-meta">
          <span className="image-card-date">
            {new Date(image.uploaded_at).toLocaleDateString()}
          </span>
          <span className="image-card-link">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
}

export default ImageCard;
