// File Upload UI Component - Upload screenshots/files to chat

import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

interface FileUploadUIProps {
  chatId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FileUploadUI({ chatId, onClose, onSuccess }: FileUploadUIProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only images (JPG, PNG, GIF, WebP) and PDF files are allowed');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(false);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/chat/${chatId}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      setSuccess(true);
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 rounded-t-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-400" />
          Upload File
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded-lg transition text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg text-green-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          File uploaded successfully!
        </div>
      )}

      {/* File Input */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          disabled={loading || success}
          className="hidden"
          id="file-upload"
        />

        {!selectedFile ? (
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-blue-600 hover:bg-blue-950/10 transition bg-gray-800/50"
          >
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Click to select or drag & drop</p>
              <p className="text-xs text-gray-500 mt-1">Images (JPG, PNG, GIF, WebP) or PDF up to 10MB</p>
            </div>
          </label>
        ) : (
          <div className="space-y-3">
            {preview ? (
              <div className="relative rounded-lg overflow-hidden bg-gray-800">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-64 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <File className="w-8 h-8 text-blue-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 transition font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload File
                  </>
                )}
              </button>
              <button
                onClick={clearSelection}
                disabled={loading}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Files are sent as message attachments to the chat
      </p>
    </div>
  );
}
