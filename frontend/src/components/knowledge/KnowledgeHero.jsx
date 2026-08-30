import React from 'react';
import { FaSearch } from 'react-icons/fa';

export const KnowledgeHero = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="text-center max-w-3xl mx-auto pt-2 pb-2">
     
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2B1B12] tracking-tight">
        Explore Wari Knowledge
      </h1>
      <p className="mt-2 text-xs sm:text-sm text-[#4A392E]/80 font-light">
        Discover the people, places, history, traditions, stories and culture that make the Wari a living heritage.
      </p>

      <div className="mt-6 relative max-w-4xl mx-auto">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-4 text-[#4A392E]/40 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saints, places, traditions, abhangas, stories..."
            className="w-full pl-10 pr-24 py-3 bg-white border border-[#E8D9C3] rounded-2xl shadow-sm text-xs focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
          />
          <button className="absolute right-2 px-4 py-1.5 bg-[#DD6B35] hover:bg-[#C85A28] text-white text-xs font-bold rounded-xl transition">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};