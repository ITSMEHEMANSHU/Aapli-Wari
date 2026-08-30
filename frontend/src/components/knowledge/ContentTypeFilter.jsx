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
    <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-t border-b border-[#E8D9C3]/50">
      {/* Scrollable Type Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full sm:max-w-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A392E]/70 mr-1 shrink-0">
          Type:
        </span>

        <button
          onClick={() => setSelectedContentType('all')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition shrink-0 ${
            selectedContentType === 'all' 
              ? 'bg-[#2B1B12] text-white border-[#2B1B12] shadow-xs' 
              : 'bg-white text-[#4A392E] border-[#E8D9C3] hover:bg-[#FBF5EC]'
          }`}
        >
          All
        </button>

        {CONTENT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedContentType(type.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition flex items-center gap-1 shrink-0 ${
              selectedContentType === type.id 
                ? 'bg-[#2B1B12] text-white border-[#2B1B12] shadow-xs' 
                : 'bg-white text-[#4A392E] border-[#E8D9C3] hover:bg-[#FBF5EC]'
            }`}
          >
            <span className="text-[10px]">{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Compact Dropdown Selects */}
      <div className="flex items-center gap-1.5 shrink-0">
        <select 
          value={reviewFilter} 
          onChange={(e) => setReviewFilter(e.target.value)}
          className="bg-white border border-[#E8D9C3] text-[11px] font-medium rounded-lg px-2 py-1 text-[#2B1B12] focus:outline-none focus:border-[#DD6B35] transition"
        >
          <option value="all">Status: All</option>
          <option value="reviewed">✓ Reviewed</option>
          <option value="pending">Under Review</option>
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-[#E8D9C3] text-[11px] font-medium rounded-lg px-2 py-1 text-[#2B1B12] focus:outline-none focus:border-[#DD6B35] transition"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="newest">Sort: Newest</option>
          <option value="viewed">Sort: Views</option>
        </select>
      </div>
    </div>
  );
};