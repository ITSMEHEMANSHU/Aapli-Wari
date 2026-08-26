import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaSearch, FaUser, FaSignOutAlt, FaPlus, FaFlag, FaChevronDown } from 'react-icons/fa';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-[#FBF5EC]/95 backdrop-blur-sm border-b border-[#E8D9C3] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-6">

        <Link to="/" className="flex items-center gap-2">
          <FaFlag className="text-[#DD6B35] text-2xl" />
          <div className="leading-tight">
            <div className="text-xl font-serif font-bold text-[#2B1B12]">Aapli Wari</div>
            <div className="text-[10px] text-[#DD6B35] font-medium tracking-wide">Aapla Theva</div>
          </div>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-[#4A392E]">
          <Link to="/explore" className="hover:text-[#DD6B35] transition">Explore</Link>
          <Link to="/channels" className="hover:text-[#DD6B35] transition">Channels</Link>
          <Link to="/ai-assistant" className="hover:text-[#DD6B35] transition">AI Help</Link>
          <Link to="/shorts" className="hover:text-[#DD6B35] transition">Shorts</Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xs ml-auto">
          <div className="flex w-full">
            <input
              type="text"
              placeholder="Search Wari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-l-lg border border-[#E8D9C3] bg-white text-[#2B1B12] text-sm placeholder-[#4A392E]/50 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40"
            />
            <button type="submit" className="bg-[#F5EADA] border border-l-0 border-[#E8D9C3] px-3 rounded-r-lg hover:bg-[#EDE0CB] transition text-[#DD6B35]">
              <FaSearch size={14} />
            </button>
          </div>
        </form>

        <button className="hidden md:flex items-center gap-1 text-sm text-[#4A392E] border border-[#E8D9C3] rounded-lg px-3 py-2 hover:bg-[#F5EADA] transition">
          मराठी <FaChevronDown size={10} />
        </button>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/contribute">
                <button className="bg-[#DD6B35] hover:bg-[#C85A28] text-white px-3 py-2 rounded-lg transition text-sm flex items-center gap-1">
                  <FaPlus size={12} /> Contribute
                </button>
              </Link>
              <Link to="/profile" className="w-9 h-9 bg-[#DD6B35] rounded-full flex items-center justify-center text-white font-bold hover:bg-[#C85A28] transition">
                {user.name?.[0] || 'U'}
              </Link>
              <button onClick={logout} className="text-[#4A392E] hover:text-[#DD6B35] transition">
                <FaSignOutAlt size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="border border-[#2B1B12]/20 text-[#2B1B12] px-4 py-2 rounded-lg hover:bg-[#F5EADA] transition text-sm">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="bg-[#DD6B35] hover:bg-[#C85A28] text-white px-4 py-2 rounded-lg transition text-sm font-medium">
                  Join Aapli Wari
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;