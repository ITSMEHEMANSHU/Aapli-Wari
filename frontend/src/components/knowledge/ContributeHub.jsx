import React, { useState } from 'react';
import { CATEGORIES } from './data/knowledgeData';
import api from '../../services/api'; // adjust path as needed

export const ContributeHub = ({ onComplete }) => {
  const [contributionType, setContributionType] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [vernacularTitle, setVernacularTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [file, setFile] = useState(null);
  const [mediaSubType, setMediaSubType] = useState('image'); // default for 'media'
  const [loading, setLoading] = useState(false);

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleResetForm = () => {
    setContributionType(null);
    setTitle('');
    setVernacularTitle('');
    setDescription('');
    setContentBody('');
    setSelectedCategories([]);
    setFile(null);
    setMediaSubType('image');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (selectedCategories.length === 0) {
      alert('Please select at least one category.');
      return;
    }

    // For types that require a file, ensure it's present
    const fileRequired = ['document', 'media', 'oral'].includes(contributionType);
    if (fileRequired && !file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();

    // Common fields
    formData.append('title', title);
    formData.append('vernacular_title', vernacularTitle || '');
    formData.append('description', description);
    formData.append('content_body', contentBody || description);
    formData.append('categories', JSON.stringify(selectedCategories));
    formData.append('language', 'mr');

    // Map contribution type → backend content_type
    let contentType;
    switch (contributionType) {
      case 'article':
        contentType = 'text';
        break;
      case 'document':
        contentType = 'pdf';
        break;
      case 'media':
        // Use the sub‑type chosen by the user
        contentType = mediaSubType; // 'image', 'video', or 'audio'
        break;
      case 'oral':
        contentType = 'audio';
        break;
      default:
        contentType = 'text';
    }
    formData.append('content_type', contentType);

    // Append file if present
    if (file) {
      formData.append('file', file);
    }

    try {
      setLoading(true);
      await api.uploadContent(formData);
      alert('Submitted and published successfully!');
      handleResetForm();
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.message || 'Error uploading content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine if the current type requires a file
  const requiresFile = ['document', 'media', 'oral'].includes(contributionType);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-serif font-bold text-[#2B1B12]">Contribute to Aapli Wari</h1>
        <p className="text-xs text-[#4A392E]/80 mt-1">Help preserve and share the knowledge, memories, and traditions of the Wari.</p>
      </div>

      {!contributionType ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div onClick={() => setContributionType('article')} className="bg-white border border-[#E8D9C3] p-5 rounded-2xl hover:border-[#DD6B35] cursor-pointer transition shadow-sm">
            <div className="text-xl mb-2">✍️</div>
            <h3 className="font-serif font-bold text-sm text-[#2B1B12]">Write an Article</h3>
            <p className="text-xs text-[#4A392E]/70 mt-1">Create text-based structured knowledge about any Wari topic.</p>
          </div>

          <div onClick={() => setContributionType('document')} className="bg-white border border-[#E8D9C3] p-5 rounded-2xl hover:border-[#DD6B35] cursor-pointer transition shadow-sm">
            <div className="text-xl mb-2">📄</div>
            <h3 className="font-serif font-bold text-sm text-[#2B1B12]">Upload a Document</h3>
            <p className="text-xs text-[#4A392E]/70 mt-1">Upload research papers, books, or PDFs.</p>
          </div>

          <div onClick={() => setContributionType('media')} className="bg-white border border-[#E8D9C3] p-5 rounded-2xl hover:border-[#DD6B35] cursor-pointer transition shadow-sm">
            <div className="text-xl mb-2">📷</div>
            <h3 className="font-serif font-bold text-sm text-[#2B1B12]">Upload Media</h3>
            <p className="text-xs text-[#4A392E]/70 mt-1">Upload photos, videos, or audio archives.</p>
          </div>

          <div onClick={() => setContributionType('oral')} className="bg-white border border-[#E8D9C3] p-5 rounded-2xl hover:border-[#DD6B35] cursor-pointer transition shadow-sm">
            <div className="text-xl mb-2">🎙️</div>
            <h3 className="font-serif font-bold text-sm text-[#2B1B12]">Share Oral History</h3>
            <p className="text-xs text-[#4A392E]/70 mt-1">Preserve interviews and personal stories.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E8D9C3] rounded-3xl p-6 shadow-sm">
          <button onClick={() => setContributionType(null)} className="text-xs text-[#DD6B35] font-semibold mb-3">← Back to Options</button>
          
          <h2 className="text-lg font-serif font-bold text-[#2B1B12] mb-4 border-b border-[#F5EAD9] pb-2">
            {contributionType === 'article' && '✍️ Write an Article (Text Only)'}
            {contributionType === 'document' && '📄 Upload Document / PDF'}
            {contributionType === 'media' && '📷 Upload Media'}
            {contributionType === 'oral' && '🎙️ Preserve Oral History'}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title" 
                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]" 
                required 
              />
            </div>

            {/* Vernacular Title */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                Vernacular Title (Marathi/Local Script)
              </label>
              <input 
                type="text" 
                value={vernacularTitle}
                onChange={(e) => setVernacularTitle(e.target.value)}
                placeholder="स्थानिक भाषेत शीर्षक (उदा. अभंग/वारी माहिती)" 
                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]" 
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                Select Categories <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-[#E8D9C3] bg-[#FBF5EC]/30 rounded-xl">
                {CATEGORIES.map(cat => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition border ${
                        isChecked 
                          ? 'bg-[#DD6B35] text-white border-[#DD6B35]' 
                          : 'bg-white text-[#2B1B12] border-[#E8D9C3] hover:border-[#DD6B35]/50'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea 
                rows="2" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a brief summary..." 
                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]" 
                required
              />
            </div>

            {/* Article Body (only for article) */}
            {contributionType === 'article' && (
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                  Article Body <span className="text-red-500">*</span>
                </label>
                <textarea 
                  rows="6" 
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="Write full text details of your article here..." 
                  className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]" 
                  required
                />
              </div>
            )}

            {/* File upload for types that need it */}
            {requiresFile && (
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                  {contributionType === 'document' ? 'PDF File' :
                   contributionType === 'oral' ? 'Audio File' :
                   'Media File'} <span className="text-red-500">*</span>
                </label>
                
                {/* Sub-type selector for 'media' */}
                {contributionType === 'media' && (
                  <select
                    value={mediaSubType}
                    onChange={(e) => setMediaSubType(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35] mb-2"
                  >
                    <option value="image">🖼️ Image</option>
                    <option value="video">🎥 Video</option>
                    <option value="audio">🎵 Audio</option>
                  </select>
                )}

                <input
                  type="file"
                  accept={
                    contributionType === 'document' ? '.pdf' :
                    contributionType === 'oral' ? 'audio/*' :
                    mediaSubType === 'image' ? 'image/*' :
                    mediaSubType === 'video' ? 'video/*' :
                    'audio/*'
                  }
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]"
                  required
                />
                {file && <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>}
              </div>
            )}

            <div className="bg-[#FDF8F0] p-3 rounded-xl border border-[#E8D9C3] text-xs text-[#4A392E]/80">
              <strong>Notice:</strong> Submissions are saved directly to the database and published.
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="px-5 py-2.5 bg-[#DD6B35] hover:bg-[#C85A28] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <button 
                type="button" 
                onClick={() => setContributionType(null)} 
                className="px-5 py-2.5 bg-[#F5EAD9] hover:bg-[#E8D9C3] text-[#4A392E] text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};