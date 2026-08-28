import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiX, FiVideo, FiImage, FiMusic, FiFile } from 'react-icons/fi';
import { api } from '../../services/api';

const TYPE_ICONS = {
  video: <FiVideo size={14} className="text-[#DD6B35]" />,
  image: <FiImage size={14} className="text-[#DD6B35]" />,
  audio: <FiMusic size={14} className="text-[#DD6B35]" />,
  pdf: <FiFile size={14} className="text-[#DD6B35]" />,
  manuscript: <FiFile size={14} className="text-[#DD6B35]" />,
  story: <FiFile size={14} className="text-[#DD6B35]" />,
};

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Clear search when navigating away
  useEffect(() => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced fetch
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.contentSuggestions(query.trim());
        setSuggestions(data || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (item) => {
    setOpen(false);
    setQuery(item.title);
    navigate(`/content/${item.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="flex items-center bg-white border border-[#E8D9C3] rounded-full px-3 py-1.5 gap-2 shadow-sm focus-within:border-[#DD6B35] transition-colors">
        <FiSearch size={16} className="text-[#9B8B7E] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search Wari heritage..."
          className="flex-1 text-sm bg-transparent outline-none text-[#2B1B12] placeholder-[#9B8B7E]"
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions([]); setOpen(false); }}>
            <FiX size={14} className="text-[#9B8B7E] hover:text-[#2B1B12]" />
          </button>
        )}
        <button
          onClick={handleSearch}
          className="bg-[#DD6B35] text-white text-xs px-3 py-1 rounded-full hover:bg-[#C85A28] transition shrink-0"
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-[#E8D9C3] rounded-xl shadow-lg z-50 overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-[#9B8B7E]">Searching...</div>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-[#9B8B7E]">No results for "{query}"</div>
          )}
          {!loading && suggestions.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSuggestionClick(item)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FBF5EC] transition text-left"
            >
              {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-[#F5EADA] flex items-center justify-center shrink-0">
                  {TYPE_ICONS[item.content_type] || <FiFile size={14} />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2B1B12] truncate">{item.title}</p>
                <p className="text-xs text-[#9B8B7E] capitalize">{item.content_type}</p>
              </div>
              <FiSearch size={12} className="text-[#9B8B7E] shrink-0" />
            </button>
          ))}
          {!loading && suggestions.length > 0 && (
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2.5 text-sm text-[#DD6B35] hover:bg-[#FBF5EC] transition text-left border-t border-[#E8D9C3]"
            >
              See all results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
