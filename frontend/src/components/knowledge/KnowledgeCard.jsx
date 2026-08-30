import React from 'react';
import { FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import { CATEGORIES } from './data/knowledgeData';

export const KnowledgeCard = ({ item, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-[#E8D9C3] rounded-2xl p-5 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#FBF5EC] text-[#DD6B35] rounded-md uppercase border border-[#E8D9C3]">
            <FaFileAlt /> {item.contentType}
          </span>
          {item.reviewStatus === 'reviewed' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <FaCheckCircle /> Reviewed
            </span>
          )}
        </div>

        <h3 className="text-base font-serif font-bold text-[#2B1B12] group-hover:text-[#DD6B35] transition">
          {item.title} <span className="text-xs font-normal text-[#4A392E]/60 ml-1 font-sans">{item.vernacularTitle}</span>
        </h3>
        
        <p className="text-xs text-[#4A392E]/80 mt-2 line-clamp-3 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F5EAD9]">
        <div className="flex flex-wrap gap-1 mb-2">
          {item.categories.map(cId => {
            const cat = CATEGORIES.find(c => c.id === cId);
            return (
              <span key={cId} className="text-[10px] bg-[#FDF8F0] text-[#4A392E] px-2 py-0.5 rounded border border-[#E8D9C3]">
                {cat?.icon} {cat?.label}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#4A392E]/60">
          <span>{item.sourcesCount} Sources</span>
          <span>Updated {item.updatedDate}</span>
        </div>
      </div>
    </div>
  );
};