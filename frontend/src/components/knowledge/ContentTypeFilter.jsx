import React from 'react';
import { CONTENT_TYPES } from './data/knowledgeData';

export const ContentTypeFilter = ({ 
  selectedContentType, 
  setSelectedContentType, 
  reviewFilter, 
  setReviewFilter, 
  sortBy, 
  setSortBy 
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E8D9C3]">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4A392E] mr-2">Type:</span>
        <button
          onClick={() => setSelectedContentType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            selectedContentType === 'all' 
              ? 'bg-[#2B1B12] text-white border-[#2B1B12]' 
              : 'bg-white text-[#4A392E] border-[#E8D9C3] hover:bg-[#FBF5EC]'
          }`}
        >
          All Types
        </button>
        {CONTENT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedContentType(type.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
              selectedContentType === type.id 
                ? 'bg-[#2B1B12] text-white border-[#2B1B12]' 
                : 'bg-white text-[#4A392E] border-[#E8D9C3] hover:bg-[#FBF5EC]'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <select 
          value={reviewFilter} 
          onChange={(e) => setReviewFilter(e.target.value)}
          className="bg-white border border-[#E8D9C3] text-xs rounded-lg px-2.5 py-1.5 text-[#2B1B12] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="reviewed">✓ Community Reviewed</option>
          <option value="pending">Under Review</option>
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-[#E8D9C3] text-xs rounded-lg px-2.5 py-1.5 text-[#2B1B12] focus:outline-none"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="newest">Sort: Newest</option>
          <option value="viewed">Sort: Most Viewed</option>
        </select>
      </div>
    </div>
  );
};