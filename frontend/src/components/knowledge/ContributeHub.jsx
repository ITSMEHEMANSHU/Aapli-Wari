import React, { useState } from 'react';
import { FaUpload, FaImage } from 'react-icons/fa';
import { CATEGORIES } from './data/knowledgeData';

export const ContributeHub = ({ onComplete }) => {
  const [contributionType, setContributionType] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [articleImage, setArticleImage] = useState(null);

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      alert('Please select at least one category.');
      return;
    }
    alert('Submitted successfully for community review!');
    onComplete();
  };

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
            <p className="text-xs text-[#4A392E]/70 mt-1">Create structured knowledge about any Wari topic.</p>
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
            {contributionType === 'article' && '✍️ Write an Article'}
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
                placeholder="Enter title" 
                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]" 
                required 
              />
            </div>

            {/* Category Selection */}
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

            {/* Content / Description */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                {contributionType === 'article' ? 'Article Body' : 'Description'} <span className="text-red-500">*</span>
              </label>
              <textarea 
                rows="5" 
                placeholder={contributionType === 'article' ? 'Write full article details...' : 'Describe the file contents...'} 
                className="w-full p-2.5 text-xs bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:outline-none focus:border-[#DD6B35]" 
                required
              ></textarea>
            </div>

            {/* File Upload for Non-Articles */}
            {contributionType !== 'article' && (
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B1B12] mb-1">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-[#E8D9C3] rounded-2xl p-5 text-center bg-[#FDF8F0]/50 hover:bg-[#FDF8F0] transition cursor-pointer">
                  <FaUpload className="mx-auto text-lg text-[#DD6B35] mb-1" />
                  <span className="text-xs font-semibold text-[#2B1B12]">Drag & drop file here or click to browse</span>
                </div>
              </div>
            )}

            {/* Optional Cover/Header Image for Articles */}
            {contributionType === 'article' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase text-[#2B1B12]">Header Image</label>
                  <span className="text-[10px] text-[#DD6B35] font-semibold uppercase">Optional</span>
                </div>
                <label className="flex items-center gap-3 p-3 border border-dashed border-[#E8D9C3] bg-[#FDF8F0]/30 hover:bg-[#FDF8F0] rounded-xl cursor-pointer transition">
                  <FaImage className="text-lg text-[#DD6B35]" />
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-[#2B1B12]">
                      {articleImage ? articleImage.name : 'Upload cover photo for article'}
                    </div>
                    <div className="text-[10px] text-[#4A392E]/60">Supported formats: JPG, PNG, WEBP (Max 5MB)</div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => setArticleImage(e.target.files[0] || null)} 
                  />
                </label>
              </div>
            )}

            <div className="bg-[#FDF8F0] p-3 rounded-xl border border-[#E8D9C3] text-xs text-[#4A392E]/80">
              <strong>Notice:</strong> Submissions are moderated by the community prior to publishing.
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-5 py-2.5 bg-[#DD6B35] hover:bg-[#C85A28] text-white text-xs font-bold rounded-xl shadow transition">
                Submit for Review
              </button>
              <button type="button" onClick={() => setContributionType(null)} className="px-5 py-2.5 bg-[#F5EAD9] hover:bg-[#E8D9C3] text-[#4A392E] text-xs font-bold rounded-xl transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};