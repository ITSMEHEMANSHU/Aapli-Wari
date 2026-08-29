import React, { useState } from 'react';
import { 
  FaHeart, 
  FaRegHeart, 
  FaCheckCircle, 
  FaFilePdf, 
  FaMusic, 
  FaNewspaper, 
  FaDownload, 
  FaPlay, 
  FaBookOpen 
} from 'react-icons/fa';
import { CATEGORIES } from './data/knowledgeData';

export const KnowledgeCard = ({ item, onClick }) => {
  const [liked, setLiked] = useState(false);
  const primaryCategory = CATEGORIES.find((c) => c.id === item.categories?.[0]);

  const handlePdfDownload = (e) => {
    e.stopPropagation();
    if (item.fileUrl) {
      const link = document.createElement('a');
      link.href = item.fileUrl;
      link.download = `${item.title || 'document'}.pdf`;
      link.click();
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative w-full h-[140px] rounded-2xl overflow-hidden bg-zinc-900 shadow-sm cursor-pointer border border-[#E8D9C3]/40 hover:border-[#DD6B35] transition-all duration-300 flex flex-col justify-between select-none"
    >
      {/* --- CONTENT SPECIFIC BACKGROUNDS --- */}

      {/* 1. PDF BACKGROUND */}
      {item.contentType === 'pdf' && (
        <div className="w-full h-full bg-gradient-to-br from-rose-950 via-zinc-900 to-zinc-950 p-2.5 flex flex-col justify-between items-center text-center">
          <div className="pt-4 flex flex-col items-center">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-1 group-hover:scale-110 transition duration-300">
              <FaFilePdf className="text-rose-400 text-base" />
            </div>
            <span className="text-[8px] font-bold text-rose-300 tracking-wider uppercase">PDF Document</span>
          </div>
          <button
            onClick={handlePdfDownload}
            className="mb-7 flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 text-[9px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md transition"
          >
            <FaDownload className="text-[7px]" /> Download
          </button>
        </div>
      )}

      {/* 2. AUDIO BACKGROUND */}
      {item.contentType === 'audio' && (
        <div className="w-full h-full bg-gradient-to-br from-amber-950 via-zinc-900 to-zinc-950 p-2.5 flex flex-col justify-between items-center text-center">
          <div className="pt-4 flex flex-col items-center">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-1 group-hover:rotate-12 transition duration-300">
              <FaMusic className="text-amber-400 text-base" />
            </div>
            <span className="text-[8px] font-bold text-amber-300 tracking-wider uppercase">Audio Track</span>
          </div>
          <div className="mb-7 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-black transition">
            <FaPlay className="text-[9px] ml-0.5" />
          </div>
        </div>
      )}

      {/* 3. ARTICLE BACKGROUND */}
      {item.contentType === 'article' && (
        <div className="w-full h-full bg-gradient-to-br from-[#2B1B12] via-[#4A392E] to-zinc-950 p-2.5 flex flex-col justify-between items-center text-center">
          <div className="pt-4 flex flex-col items-center">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-1 group-hover:scale-110 transition duration-300">
              <FaNewspaper className="text-amber-300 text-base" />
            </div>
            <span className="text-[8px] font-bold text-amber-200/80 tracking-wider uppercase">Article</span>
          </div>
          <div className="mb-8 text-[9px] text-zinc-400 flex items-center gap-1 font-medium">
            <FaBookOpen className="text-[7px] text-[#DD6B35]" /> Quick Read
          </div>
        </div>
      )}

      {/* 4. IMAGE MEDIA BACKGROUND */}
      {item.contentType === 'image' && item.fileUrl && (
        <img
          loading="lazy"
          src={item.fileUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
        />
      )}

      {/* 5. VIDEO MEDIA BACKGROUND */}
      {item.contentType === 'video' && (
        <video src={item.fileUrl} className="w-full h-full object-cover" />
      )}

      {/* --- OVERLAY HEADERS (TOP BAR) --- */}
      <div className="absolute top-0 left-0 right-0 p-1.5 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        <span className="text-[8px] font-extrabold uppercase tracking-wider text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 truncate max-w-[70%]">
          #{primaryCategory?.label.replace(/\s+/g, '') || item.contentType}
        </span>

        <div className="flex items-center gap-1">
          {item.reviewStatus === 'reviewed' && (
            <FaCheckCircle className="text-emerald-400 text-[10px]" title="Verified" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className="p-1 text-white/80 hover:text-red-500 transition"
          >
            {liked ? <FaHeart className="text-red-500 text-[10px]" /> : <FaRegHeart className="text-[10px]" />}
          </button>
        </div>
      </div>

      {/* --- OVERLAY FOOTERS (BOTTOM METADATA) --- */}
      <div className="absolute bottom-0 left-0 right-0 p-2 pt-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-white flex flex-col justify-end">
        <h3 className="text-[11px] font-bold leading-tight truncate group-hover:text-[#DD6B35] transition">
          {item.title}
        </h3>

        <div className="flex items-center justify-between mt-0.5 text-[9px] text-white/70">
          <span className="truncate text-amber-300/90 italic font-serif">
            {item.vernacularTitle || item.author || 'Wari'}
          </span>
          <span className="flex-shrink-0 text-white/50 text-[8px] ml-1">{item.sourcesCount} src</span>
        </div>
      </div>
    </div>
  );
};