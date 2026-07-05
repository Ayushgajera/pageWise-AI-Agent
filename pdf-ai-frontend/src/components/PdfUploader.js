import React, { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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
      const res = await axios.post(`${API_URL}/upload`, formData, {
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
    <div className="mx-auto w-full max-w-xl">
      <h2 className="text-center text-2xl font-semibold text-white">Upload PDF</h2>
      
      <div
        className={`mt-6 rounded-[28px] border border-dashed p-6 text-center transition ${
          dragActive 
            ? 'border-emerald-400 bg-emerald-400/10' 
            : 'border-white/15 bg-white/5 hover:border-emerald-400/40 hover:bg-white/10'
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
            <p className="font-medium text-emerald-300">✓ {pdfFile.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-slate-200">Click to select or drag and drop a PDF file</p>
            <p className="mt-1 text-sm text-slate-400">Max size: 10MB</p>
          </div>
        )}
      </div>
      
      <button
        onClick={handleUpload}
        disabled={!pdfFile || uploading}
        className="button-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
    </div>
  );
};

export default PdfUploader;
