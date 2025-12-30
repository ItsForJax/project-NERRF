import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, Loader2, Sparkles, Calendar, Hash, Tag, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    setShowDeleteConfirm(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedImage?.hash) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/delete/${selectedImage.hash}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from results
        setResults(results.filter(img => img.hash !== selectedImage.hash));
        setSelectedImage(null);
        setShowDeleteConfirm(false);
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium">
            <SearchIcon className="w-4 h-4 mr-2" />
            Image Search Engine
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
            Search Images
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search by name, description, or tags with powerful Elasticsearch
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
            <Input
              type="text"
              placeholder="Search for images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-14 h-16 text-lg border-2 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-lg bg-white dark:bg-gray-800"
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 animate-spin text-purple-500" />
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse"></div>
                <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 animate-spin text-white" />
              </div>
              <p className="text-muted-foreground mt-6 text-lg">Searching...</p>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-6">
                <SearchIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground text-lg">Try different keywords or tags</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                  <p className="text-sm font-medium">
                    Found <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{results.length}</span> {results.length === 1 ? 'image' : 'images'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((image, index) => (
                  <Card
                    key={image.image_id || index}
                    className="group overflow-hidden cursor-pointer border-2 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-800"
                    onClick={() => handleViewDetails(image)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 relative overflow-hidden">
                      {image.thumbnail_url ? (
                        <img
                          src={`${API_URL}${image.thumbnail_url}`}
                          alt={image.name || 'Image'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `${API_URL}${image.url}`;
                          }}
                        />
                      ) : (
                        <img
                          src={`${API_URL}${image.url}`}
                          alt={image.name || 'Image'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg truncate mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {image.name || 'Untitled'}
                      </h3>
                      {image.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {image.description}
                        </p>
                      )}
                      {image.tags && image.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {image.tags.slice(0, 3).map((tag, idx) => (
                            <Badge
                              key={idx}
                              className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {image.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-purple-300 dark:border-purple-700">
                              +{image.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!loading && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Sparkles className="h-14 w-14 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-bounce">
                  <SearchIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Start Your Search</h3>
              <p className="text-muted-foreground text-lg max-w-md">
                Type a name, description, or tag to discover images
              </p>
            </div>
          )}
        </div>

        {/* Image Detail Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => handleCloseModal()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
            {selectedImage && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                    {selectedImage.name || 'Untitled'}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Hash className="h-4 w-4" />
                    Image ID: {selectedImage.image_id}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-xl bg-gray-100 dark:bg-gray-800">
                    <img
                      src={`${API_URL}${selectedImage.url}`}
                      alt={selectedImage.name || 'Image'}
                      className="w-full h-auto"
                    />
                  </div>

                  {selectedImage.description && (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></span>
                        Description
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">{selectedImage.description}</p>
                    </div>
                  )}

                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.tags.map((tag, idx) => (
                          <Badge
                            key={idx}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm py-1 px-3"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedImage.uploaded_at && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>Uploaded</span>
                        </div>
                        <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {new Date(selectedImage.uploaded_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {selectedImage.hash && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                          <Hash className="h-4 w-4" />
                          <span>Hash</span>
                        </div>
                        <p className="font-mono text-xs truncate font-semibold text-gray-900 dark:text-gray-100">
                          {selectedImage.hash}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Auto-deletion notice */}
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          All images are automatically deleted daily
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          This is a temporary storage service. Images are purged regularly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  {!showDeleteConfirm ? (
                    <Button
                      onClick={handleDeleteClick}
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700"
                      size="lg"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Image
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border-2 border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-100">
                            Are you sure you want to delete this image?
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            This action is permanent and cannot be undone. The image file will be deleted immediately.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDeleteConfirm}
                          disabled={deleting}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Yes, Delete
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          variant="outline"
                          className="flex-1"
                          disabled={deleting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
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
