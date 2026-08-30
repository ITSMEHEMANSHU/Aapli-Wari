import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import { IMAGES, cloudinaryUrl } from '../../utils/cloudinary';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../routes';

export const Header = () => {
  const { user, isAuthenticated, canContribute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t, languageOptions } = useLanguage();

  const navLinks = [
    { label: t('nav.explore') || 'Explore', to: ROUTES.EXPLORE },
    { label: t('nav.map') || 'Map', to: ROUTES.MAP },
    { label: t('nav.channels') || 'Channels', to: ROUTES.CHANNELS },
    { label: 'Store', to: ROUTES.STORE },
    { label: 'AI Help', to: ROUTES.AI_ASSISTANT },
    { label: 'Aapla Theva', to: ROUTES.KNOWLEDGE_PAGE },
  ];

  const isContributorUser = typeof canContribute === 'function' ? canContribute() : false;
  const isKnowledgePage = location.pathname.toLowerCase() === ROUTES.KNOWLEDGE_PAGE.toLowerCase();

  const handleContributeClick = (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.APPLY_CONTRIBUTOR } });
      return;
    }

    if (isContributorUser) {
      navigate(`${ROUTES.KNOWLEDGE_PAGE}?tab=contribute`);
    } else {
      navigate(ROUTES.APPLY_CONTRIBUTOR);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F9F1E5] border-b border-[#E8D9C3] shadow-xs backdrop-blur-md">
      {/* 3-Column Grid guarantees locked positioning for logo, nav, and actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[64px] grid grid-cols-3 items-center gap-2">
        
        {/* ── Left Column: Logo ── */}
        <div className="flex items-center justify-start">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              loading="lazy" 
              src={cloudinaryUrl(IMAGES.logo, { width: 40, height: 40, crop: 'fit', quality: 'auto' })}
              alt="Aapli Wari Logo"
              className="w-10 h-10 object-contain rounded-[12px]"
            />
            <div className="leading-tight hidden sm:block">
              <div className="text-xl font-bold text-[#E87A1E] group-hover:text-[#C8521A] transition-colors tracking-tight">
                Aapli Wari
              </div>
            </div>
          </Link>
        </div>

        {/* ── Center Column: Desktop Navigation Links (Locked in center) ── */}
        <nav className="hidden lg:flex items-center justify-center gap-1 text-sm font-semibold text-[#2D1B0E] w-full">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={link.onClick}
              className="px-3 py-2 rounded-full hover:text-[#E87A1E] hover:bg-orange-50 transition-all duration-200 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right Column: Actions / User Profile / Language ── */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center relative shrink-0">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select language"
              className="appearance-none bg-transparent text-sm text-[#5A4030] border border-[#D4A373]/40 rounded-full px-3 py-1.5 pr-7 hover:bg-[#D4A373]/10 transition-colors focus:outline-none"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FaChevronDown size={9} className="pointer-events-none absolute right-2.5 text-[#5A4030]" />
          </div>

          {user ? (
            <>
              {!isKnowledgePage && (
                <button
                  onClick={handleContributeClick}
                  className="hidden sm:inline-flex bg-[#E87A1E] hover:bg-[#C8521A] text-white px-3.5 py-2 rounded-xl transition text-sm font-bold shadow-sm active:scale-95 cursor-pointer whitespace-nowrap max-w-[180px] text-center leading-tight"
                >
                  {isContributorUser ? t('nav.contribute') : 'Become a Contributor'}
                </button>
              )}
              <Link
                to="/profile"
                className="w-9 h-9 bg-[#2D1B0E] border border-[#2D1B0E] rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-[#E87A1E] hover:border-[#E87A1E] transition shadow-2xs shrink-0"
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Link>
            </>
          ) : (
            <Link to="/register">
              <button className="bg-[#E87A1E] hover:bg-[#C8521A] text-white px-4.5 py-2 rounded-xl transition text-sm font-bold whitespace-nowrap shadow-sm active:scale-95 cursor-pointer">
                {t('nav.join')}
              </button>
            </Link>
          )}

          <button
            className="lg:hidden p-2 rounded-xl text-[#2D1B0E] hover:bg-orange-50 transition focus:outline-none cursor-pointer shrink-0"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FDF8F0] border-t border-[#E8D9C3] px-5 py-4 flex flex-col gap-1.5 shadow-xl animate-in fade-in duration-150 text-[#2D1B0E]">
          {navLinks.map((link) =>
            link.label === 'Contribute' || link.label === t('nav.contribute') ? (
              <button
                key={link.label}
                onClick={(e) => {
                  if (link.onClick) link.onClick(e);
                  setMobileOpen(false);
                }}
                className="text-left text-sm font-semibold text-[#2D1B0E] hover:text-[#E87A1E] hover:bg-orange-50 px-3.5 py-2.5 rounded-xl transition"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-[#2D1B0E] hover:text-[#E87A1E] hover:bg-orange-50 px-3.5 py-2.5 rounded-xl transition"
              >
                {link.label}
              </Link>
            )
          )}

          <div className="pt-2 border-t border-[#D4A373]/30 flex gap-3 items-center">
            <div className="relative shrink-0">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select language"
                className="appearance-none bg-transparent text-sm text-[#5A4030] border border-[#D4A373]/40 rounded-full px-3 py-1.5 pr-7 focus:outline-none"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FaChevronDown size={9} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A4030]" />
            </div>

            {!user && (
              <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full">
                <button className="w-full bg-[#E87A1E] hover:bg-[#C8521A] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition">
                  {t('nav.join')}
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