import React, { useState, useCallback } from 'react';
import axios from 'axios';

const PdfUploader = ({ onUploadSuccess, onError }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      onError?.("Please select a valid PDF file.");
    }
  }, [onError]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      onError?.("Please drop a valid PDF file.");
    }
  }, [onError]);

  const handleUpload = useCallback(async () => {
    if (!pdfFile) {
      onError?.("Please select a PDF file.");
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (pdfFile.size > maxSize) {
      onError?.("File size must be less than 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      setUploading(true);
      const res = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 second timeout
      });
      
      onUploadSuccess?.(res.data);
    } catch (err) {
      console.error('Upload error:', err);
      
      if (err.response?.status === 400) {
        onError?.(err.response.data.error || "Invalid file format or size.");
      } else if (err.code === 'ECONNABORTED') {
        onError?.("Upload timed out. Please try again.");
      } else {
        onError?.("Failed to upload PDF. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  }, [pdfFile, onUploadSuccess, onError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload PDF</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {pdfFile ? (
          <div>
            <p className="text-green-600 font-medium">✓ {pdfFile.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">Click to select or drag and drop a PDF file</p>
            <p className="text-sm text-gray-400 mt-1">Max size: 10MB</p>
          </div>
        )}
      </div>
      
      <button
        onClick={handleUpload}
        disabled={!pdfFile || uploading}
        className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
    </div>
  );
};

export default PdfUploader;
