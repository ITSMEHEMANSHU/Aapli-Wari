import React, { useState } from 'react';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';

export const ContentForm = ({ contentType, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'mr',
    tags: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="hover:text-primary transition">
          <FaArrowLeft />
        </button>
        <h3 className="text-xl font-bold">Upload {contentType}</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          placeholder="Enter title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Upload File *</label>
        <div 
          className="border-2 border-dashed border-gray-300 p-8 text-center rounded cursor-pointer hover:border-primary transition"
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <div>
              <p className="font-bold">{file.name}</p>
              <small className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
            </div>
          ) : (
            <div>
              <FaUpload className="text-3xl text-gray-400 mx-auto mb-2" />
              <p>Click or drag to upload</p>
              <small className="text-gray-500">Supported: Images, Videos, Audio, PDF</small>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          placeholder="Describe your content"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={4}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({...formData, language: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
          >
            <option value="mr">Marathi</option>
            <option value="hi">Hindi</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            placeholder="Enter tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-gray-300 px-6 py-2 rounded hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-red-800 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
};