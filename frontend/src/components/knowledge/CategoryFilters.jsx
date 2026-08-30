import React, { useState } from 'react';
import { CATEGORIES, CONTENT_TYPES } from './data/knowledgeData';

export const CategoryFilters = ({ 
  selectedCategories, 
  toggleCategory, 
  clearCategories,
  selectedContentType,
  setSelectedContentType,
  sortBy,
  setSortBy
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSelection = selectedCategories.length > 0;

  const INITIAL_LIMIT = 7;
  const visibleCategories = isExpanded ? CATEGORIES : CATEGORIES.slice(0, INITIAL_LIMIT);
  const hiddenCount = CATEGORIES.length - INITIAL_LIMIT;

  return (
    <div className="w-full bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8D9C3]/80 shadow-xs">
      
      {/* SINGLE-LINE BAR: CATEGORY PILLS (LEFT ~70%) | CONTROLS (RIGHT ~30%) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* LEFT SECTION: Category Header + Scrollable/Wrap Pills */}
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
          
          {/* Header & Reset Badge */}
          <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-[#E8D9C3]/80">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4A392E]/70">
              Categories
            </span>
            {hasSelection && (
              <span className="px-2 py-0.5 bg-[#DD6B35] text-white text-[10px] font-bold rounded-full shadow-2xs">
                {selectedCategories.length}
              </span>
            )}
            {hasSelection && (
              <button
                onClick={clearCategories}
                className="text-xs text-[#DD6B35] hover:text-[#b85323] font-bold transition-colors hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Category Chips Wrapper */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 select-none cursor-pointer ${
                    isSelected
                      ? 'bg-[#DD6B35] text-white border-[#DD6B35] shadow-xs active:scale-95'
                      : 'bg-white border-[#E8D9C3] text-[#2B1B12] hover:border-[#DD6B35]/50 hover:bg-[#FBF5EC] active:scale-95'
                  }`}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span className="whitespace-nowrap leading-none">{cat.label}</span>
                </button>
              );
            })}

            {/* Expand / Collapse Button */}
            {CATEGORIES.length > INITIAL_LIMIT && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1.5 rounded-xl border border-dashed border-[#DD6B35]/40 bg-[#DD6B35]/5 text-[#DD6B35] hover:bg-[#DD6B35]/10 text-xs font-bold transition-all select-none cursor-pointer"
              >
                {isExpanded ? 'Less' : `+${hiddenCount} More`}
              </button>
            )}
          </div>

        </div>

        {/* RIGHT SECTION: Dropdown Select Controls */}
        <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E8D9C3]/60 justify-end">
          
          {/* Content Type Select */}
          <div className="relative">
            <select 
              value={selectedContentType} 
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="appearance-none bg-white border border-[#E8D9C3] text-xs font-bold rounded-xl pl-3 pr-8 py-1.5 text-[#2B1B12] focus:outline-none focus:border-[#DD6B35] focus:ring-2 focus:ring-[#DD6B35]/20 transition-all shadow-2xs cursor-pointer"
            >
              <option value="all">Type: All</option>
              {CONTENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#4A392E]/60">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Sort By Select */}
          <div className="relative">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-[#E8D9C3] text-xs font-bold rounded-xl pl-3 pr-8 py-1.5 text-[#2B1B12] focus:outline-none focus:border-[#DD6B35] focus:ring-2 focus:ring-[#DD6B35]/20 transition-all shadow-2xs cursor-pointer"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="newest">Sort: Newest</option>
              <option value="viewed">Sort: Views</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#4A392E]/60">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CategoryFilters;