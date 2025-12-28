import React from 'react';
import './SearchBar.css';

function SearchBar({ value, onChange, loading }) {
  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, description, or tags..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
        {loading && <div className="search-spinner"></div>}
        {value && !loading && (
          <button
            className="clear-button"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
