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
    <header className="bg-[#FBF5EC]/95 backdrop-blur-sm border-b border-[#E8D9C3] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src={cloudinaryUrl(IMAGES.logo, { width: 40, height: 40, crop: 'fit', quality: 'auto' })}
            alt="Aapli Wari Logo"
            className="w-10 h-10 object-contain"
          />
          <div className="leading-tight">
            <div className="text-lg font-serif font-bold text-[#2B1B12] leading-none">Aapli Wari</div>
            <div className="text-[10px] text-[#DD6B35] font-medium tracking-wider">Aapla Theva</div>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#4A392E] ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="hover:text-[#DD6B35] transition-colors duration-150 whitespace-nowrap"
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
          <button className="hidden md:flex items-center gap-1 text-sm text-[#4A392E] border border-[#E8D9C3] rounded-lg px-3 py-1.5 hover:bg-[#F5EADA] transition-colors">
            मराठी <FaChevronDown size={9} className="mt-px" />
          </button>

          {user ? (
            <>
              <Link to="/contribute">
                <button className="hidden sm:inline-flex bg-[#DD6B35] hover:bg-[#C85A28] text-white px-4 py-1.5 rounded-lg transition text-sm font-medium">
                  Contribute
                </button>
              </Link>
              <Link
                to="/profile"
                className="w-8 h-8 bg-[#DD6B35] rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-[#C85A28] transition"
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Link>
            </>
          ) : (
            <Link to="/register">
              <button className="bg-[#DD6B35] hover:bg-[#C85A28] text-white px-4 py-2 rounded-lg transition text-sm font-semibold whitespace-nowrap shadow-sm">
                Join Aapli Wari
              </button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden ml-1 p-2 rounded-lg text-[#4A392E] hover:bg-[#F5EADA] transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FBF5EC] border-t border-[#E8D9C3] px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-[#4A392E] hover:text-[#DD6B35] transition py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#E8D9C3] flex gap-3">
            <button className="flex items-center gap-1 text-sm text-[#4A392E] border border-[#E8D9C3] rounded-lg px-3 py-1.5">
              मराठी <FaChevronDown size={9} />
            </button>
            {!user && (
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <button className="bg-[#DD6B35] text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
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
