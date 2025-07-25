import React, { useState } from 'react';
import axios from 'axios';

const PdfUploader = ({ onUploadSuccess }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF.");

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      setUploading(true);
      const res = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onUploadSuccess(); // notify App to enable chat
      alert("PDF uploaded and processed!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload PDF</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default PdfUploader;
