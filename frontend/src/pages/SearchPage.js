import React, { useState, useEffect, useCallback } from 'react';
import './SearchPage.css';
import SearchBar from '../components/SearchBar';
import ImageCard from '../components/ImageCard';
import ImageDetailModal from '../components/ImageDetailModal';

const API_URL = process.env.REACT_APP_API_URL || '';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (response.ok) {
          setResults(data.results || []);
        } else {
          console.error('Search failed:', data);
          setResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleViewDetails = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <header className="search-header">
          <h1>🔍 Search Images</h1>
          <p className="subtitle">
            Search by name, description, or tags
          </p>
        </header>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          loading={loading}
        />

        <div className="search-results">
          {loading && (
            <div className="loading-container">
              <div className="spinner-large"></div>
              <p>Searching...</p>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try different keywords or tags</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="results-count">
                Found {results.length} {results.length === 1 ? 'image' : 'images'}
              </div>
              <div className="results-grid">
                {results.map((image, index) => (
                  <ImageCard 
                    key={image.image_id || index} 
                    image={image} 
                    apiUrl={API_URL}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && !hasSearched && (
            <div className="search-prompt">
              <div className="search-prompt-icon">✨</div>
              <h3>Start searching</h3>
              <p>Type a name, description, or tag to find images</p>
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          apiUrl={API_URL}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchPage;
