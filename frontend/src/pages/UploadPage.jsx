import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, Image as ImageIcon, Loader2, CheckCircle2, XCircle, X, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import generateDeviceFingerprint from '../utils/deviceFingerprint';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const loadStats = async () => {
    try {
      const fingerprint = await generateDeviceFingerprint();
      const response = await fetch(`${API_URL}/my-uploads?device_fingerprint=${encodeURIComponent(fingerprint)}`);
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setMetadata(prev => ({ ...prev, name: file.name }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!metadata.tags.includes(tagInput.trim())) {
        setMetadata(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const fingerprint = await generateDeviceFingerprint();

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', metadata.name || selectedFile.name);
    formData.append('description', metadata.description);
    formData.append('tags', JSON.stringify(metadata.tags));
    formData.append('device_fingerprint', fingerprint);

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

        if (data.task_id && !data.is_duplicate) {
          checkTaskStatus(data.task_id);
        }

        setSelectedFile(null);
        setPreviewUrl(null);
        setMetadata({ name: '', description: '', tags: [] });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
            <UploadIcon className="w-4 h-4 mr-2" />
            Image Upload Service
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Upload Your Images
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload images with metadata, automatic duplicate detection, and intelligent rate limiting
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Select Image
                </CardTitle>
                <CardDescription>Drag and drop or click to browse your files</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                      : 'border-border hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-80 mx-auto rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">{selectedFile?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <ImageIcon className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold mb-2">Choose a file or drag & drop</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, GIF, WebP, BMP • Maximum 50MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="lg"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Browse Files
                        </Button>
                      </div>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Metadata Form */}
            {selectedFile && (
              <Card className="border-2 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl">Image Details</CardTitle>
                  <CardDescription>Add metadata to enhance searchability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter a descriptive name"
                      value={metadata.name}
                      onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                      className="border-2 focus:border-blue-500 bg-white dark:bg-gray-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                    <Input
                      id="description"
                      placeholder="Describe your image"
                      value={metadata.description}
                      onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                      className="border-2 focus:border-blue-500 bg-white dark:bg-gray-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-semibold">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="Type and press Enter to add tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="border-2 focus:border-blue-500 bg-white dark:bg-gray-900"
                    />
                    {metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        {metadata.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer hover:bg-white/20 rounded-full"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                    onClick={handleUpload}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-5 w-5" />
                        Upload Image
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            <Card className="border-2 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Upload Statistics
                </CardTitle>
                <CardDescription>Your current usage limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-lg shadow border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploads Used</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.uploadsUsed}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-lg shadow border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remaining</span>
                    </div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.remaining}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-lg shadow border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Images</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.totalImages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Smart Processing</p>
                    <p className="text-xs text-muted-foreground">
                      Images are processed asynchronously with automatic thumbnail generation and duplicate detection
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                Upload Successful!
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {uploadResult?.is_duplicate
                  ? 'This image was already uploaded previously'
                  : 'Your image has been uploaded and processed successfully'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {uploadResult && (
                <>
                  <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Image ID:</span>
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{uploadResult.id}</span>
                    </div>
                    {uploadResult.is_duplicate && (
                      <Badge className="bg-yellow-500">Duplicate Detected</Badge>
                    )}
                  </div>
                  {uploadResult.url && (
                    <div className="rounded-lg overflow-hidden border-2 border-green-200 dark:border-green-800 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={`${API_URL}${uploadResult.url}`}
                        alt="Uploaded"
                        className="w-full"
                      />
                    </div>
                  )}
                </>
              )}
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error Modal */}
        <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-6 w-6" />
                Upload Failed
              </DialogTitle>
              <DialogDescription className="text-red-600 dark:text-red-400">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Please check your file and try again. If the problem persists, contact support.
              </p>
            </div>
            <Button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default UploadPage;
