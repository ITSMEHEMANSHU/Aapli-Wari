import React, { useState, useRef } from 'react';
import { Button } from '../common/Button';

export const MediaUploader = ({ onFileSelect, acceptedTypes = ['*/*'] }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
      // Simulate upload progress
      simulateProgress();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      onFileSelect(droppedFile);
      simulateProgress();
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="media-uploader">
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
        />
        {file ? (
          <div className="file-info">
            <p>📎 {file.name}</p>
            <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div>
            <p>📤 Drag & drop or click to upload</p>
            <small>Supported: Images, Videos, Audio, PDF</small>
          </div>
        )}
      </div>
    </div>
  );
};