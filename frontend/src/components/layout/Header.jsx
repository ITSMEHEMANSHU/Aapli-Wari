import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import { IMAGES, cloudinaryUrl } from '../../utils/cloudinary';
import SearchBar from '../common/SearchBar';

/**
 * Header — matches the Aapli Wari design:
 * Logo | Explore Stories Palkhis Saints Map Channels Contribute | मराठी ▾ | Join Aapli Wari
 */
export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Explore',    to: '/explore' },
    { label: 'Map',        to: '/explore?type=map' },
    { label: 'Channels',   to: '/channels' },
    { label: 'Contribute', to: '/contribute' },
  ];

  return (
    <header className="bg-[#FDF8F0]/95 backdrop-blur-sm border-b border-[#D4A373]/30 sticky top-0 z-50 shadow-[0_4px_20px_rgba(139,58,58,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src={cloudinaryUrl(IMAGES.logo, { width: 40, height: 40, crop: 'fit', quality: 'auto' })}
            alt="Aapli Wari Logo"
            className="w-10 h-10 object-contain rounded-[12px]"
          />
          <div className="leading-tight">
            <div className="text-lg font-serif font-bold text-[#2D1B0E] leading-none">Aapli Wari</div>
            <div className="text-[10px] text-[#8B3A3A] font-medium tracking-wider">Aapla Theva</div>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#5A4030] ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="hover:text-[#8B3A3A] transition-colors duration-150 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Search Bar ── */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <SearchBar />
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 ml-auto shrink-0">

          {/* Language toggle */}
          <button className="hidden md:flex items-center gap-1 text-sm text-[#5A4030] border border-[#D4A373]/40 rounded-full px-3 py-1.5 hover:bg-[#D4A373]/10 transition-colors">
            मराठी <FaChevronDown size={9} className="mt-px" />
          </button>

          {user ? (
            <>
              <Link to="/contribute">
                <button className="hidden sm:inline-flex bg-[#8B3A3A] hover:bg-[#7a3232] text-[#FDF8F0] px-4 py-1.5 rounded-full transition text-sm font-medium shadow-[0_4px_20px_rgba(139,58,58,0.08)]">
                  Contribute
                </button>
              </Link>
              <Link
                to="/profile"
                className="w-8 h-8 bg-[#8B3A3A] rounded-full flex items-center justify-center text-[#FDF8F0] font-bold text-sm hover:bg-[#7a3232] transition shadow-[0_4px_20px_rgba(139,58,58,0.08)]"
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Link>
            </>
          ) : (
            <Link to="/register">
              <button className="bg-[#8B3A3A] hover:bg-[#7a3232] text-[#FDF8F0] px-4 py-2 rounded-full transition text-sm font-semibold whitespace-nowrap shadow-[0_4px_20px_rgba(139,58,58,0.08)]">
                Join Aapli Wari
              </button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden ml-1 p-2 rounded-full text-[#5A4030] hover:bg-[#D4A373]/10 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FDF8F0] border-t border-[#D4A373]/30 px-4 py-4 flex flex-col gap-3 animate-[wariFadeSlideUp_0.25s_ease-out]">
          <style>{`
            @keyframes wariFadeSlideUp {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-[#5A4030] hover:text-[#8B3A3A] transition py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#D4A373]/30 flex gap-3">
            <button className="flex items-center gap-1 text-sm text-[#5A4030] border border-[#D4A373]/40 rounded-full px-3 py-1.5">
              मराठी <FaChevronDown size={9} />
            </button>
            {!user && (
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <button className="bg-[#8B3A3A] text-[#FDF8F0] px-4 py-1.5 rounded-full text-sm font-semibold shadow-[0_4px_20px_rgba(139,58,58,0.08)]">
                  Join Aapli Wari
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;