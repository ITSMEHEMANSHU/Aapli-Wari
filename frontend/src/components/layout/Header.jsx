import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';

/**
 * Header — Clean, High-Contrast Temple Theme
 */
export const Header = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Explore',    to: '/explore' },
    { label: 'Map',        to: '/map' },
    { label: 'Channels',   to: '/channels' },
    { label: 'AI Help',    to: '/ai-assistant' },
    { label: 'Shorts',     to: '/shorts' },
    { label: 'Contribute', to: '/contribute' },
      { label: 'Shorts', to: '/shorts' },  // ✅ Add

  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F9F1E5] border-b border-[#E8D9C3] shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="leading-tight">
            <div className="text-xl font-bold text-[#E87A1E] group-hover:text-[#C8521A] transition-colors tracking-tight">
              Aapli Wari
            </div>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-[#2D1B0E]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="px-4 py-2 rounded-full hover:text-[#E87A1E] hover:bg-orange-50 transition-all duration-200 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right side controls ── */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Language toggle */}
          <button className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#2D1B0E] border border-[#E8D9C3] bg-white hover:border-[#E87A1E] hover:text-[#E87A1E] rounded-xl px-3 py-1.5 transition shadow-2xs cursor-pointer">
            मराठी <FaChevronDown size={8} className="mt-px text-[#E87A1E]" />
          </button>

          {user ? (
            <>
              <Link to="/contribute">
                <button className="hidden sm:inline-flex bg-[#E87A1E] hover:bg-[#C8521A] text-white px-4.5 py-2 rounded-xl transition text-sm font-bold shadow-sm active:scale-95 cursor-pointer">
                  Contribute
                </button>
              </Link>
              <Link
                to="/profile"
                className="w-9 h-9 bg-[#2D1B0E] border border-[#2D1B0E] rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-[#E87A1E] hover:border-[#E87A1E] transition shadow-2xs"
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Link>
            </>
          ) : (
            <Link to="/register">
              <button className="bg-[#E87A1E] hover:bg-[#C8521A] text-white px-4.5 py-2 rounded-xl transition text-sm font-bold whitespace-nowrap shadow-sm active:scale-95 cursor-pointer">
                Join Aapli Wari
              </button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl text-[#2D1B0E] hover:bg-orange-50 transition focus:outline-none cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FDF8F0] border-t border-[#E8D9C3] px-5 py-4 flex flex-col gap-1.5 shadow-xl animate-in fade-in duration-150 text-[#2D1B0E]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-[#2D1B0E] hover:text-[#E87A1E] hover:bg-orange-50 px-3.5 py-2.5 rounded-xl transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-[#E8D9C3] flex items-center justify-between gap-3">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-[#2D1B0E] border border-[#E8D9C3] bg-white rounded-xl px-3.5 py-2">
              मराठी <FaChevronDown size={8} className="text-[#E87A1E]" />
            </button>
            {!user && (
              <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full">
                <button className="w-full bg-[#E87A1E] hover:bg-[#C8521A] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition">
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