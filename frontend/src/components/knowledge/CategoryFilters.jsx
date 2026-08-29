import React from 'react';
import { CATEGORIES } from './data/knowledgeData';

export const CategoryFilters = ({ selectedCategories, toggleCategory, clearCategories }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A392E]">
          Categories {selectedCategories.length > 0 && <span className="text-[#DD6B35]">({selectedCategories.length} selected)</span>}
        </h3>
        {selectedCategories.length > 0 && (
          <button onClick={clearCategories} className="text-xs text-[#DD6B35] font-semibold hover:underline">Clear All</button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected 
                  ? 'bg-[#DD6B35] text-white border-[#DD6B35] shadow-md' 
                  : 'bg-white border-[#E8D9C3] hover:border-[#DD6B35]/50 text-[#2B1B12]'
              }`}
            >
              <span className="text-xl mb-1">{cat.icon}</span>
              <div className="font-semibold text-xs leading-tight">{cat.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};