import React, { useState } from 'react';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';
import { uploadContent } from '../../services/content';
import { useAuth } from '../../hooks/useAuth';

export const ContentForm = ({ contentType, onBack, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'mr',
    tags: '',
    channel_id: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setUploadProgress(0);

  try {
    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description || '');
    formDataObj.append('content_type', contentType);
    formDataObj.append('language', formData.language);
    formDataObj.append('tags', formData.tags);
    if (formData.channel_id) {
      formDataObj.append('channel_id', formData.channel_id);
    }
    if (file) {
      formDataObj.append('file', file);
    }

    // ✅ Pass progress callback
    const result = await uploadContent(formDataObj, (progress) => {
      setUploadProgress(progress);
    });
    
    console.log('Upload success:', result);
    onSuccess();
  } catch (err) {
    setError(err.message || 'Upload failed');
    console.error('Upload error:', err);
  } finally {
    setLoading(false);
  }
};
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      {/* ... rest of the UI remains same ... */}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
        </div>
      )}
      
      {/* Submit button remains same */}
    </form>
  );
};