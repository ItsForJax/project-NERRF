import React, { useState } from 'react';
import './MetadataForm.css';

function MetadataForm({ metadata, onChange, onUpload, loading }) {
  const [tagInput, setTagInput] = useState('');

  const handleNameChange = (e) => {
    onChange({ ...metadata, name: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    onChange({ ...metadata, description: e.target.value });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag) => {
    if (tag && !metadata.tags.includes(tag)) {
      onChange({ ...metadata, tags: [...metadata.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange({
      ...metadata,
      tags: metadata.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="metadata-form">
      <h3 className="form-title">Image Details</h3>
      
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={metadata.name}
          onChange={handleNameChange}
          placeholder="Enter image name"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={metadata.description}
          onChange={handleDescriptionChange}
          placeholder="Enter image description"
          className="form-textarea"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          type="text"
          value={tagInput}
          onChange={handleTagInputChange}
          onKeyDown={handleTagInputKeyDown}
          placeholder="Type a tag and press Enter"
          className="form-input"
        />
        
        {metadata.tags.length > 0 && (
          <div className="tags-container">
            {metadata.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeTag(tag)}
                  aria-label="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        className="upload-button"
        onClick={onUpload}
        disabled={loading}
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

export default MetadataForm;
