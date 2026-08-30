import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { IMAGES, cloudinaryUrl } from '../../utils/cloudinary';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  const exploreLinks = [
    { label: t('footer.links.traditions') || 'Traditions', to: '/explore?type=traditions' },
    { label: t('footer.links.abhangs') || 'Abhangs', to: '/explore?type=abhangs' },
    { label: t('footer.links.places') || 'Places', to: '/explore?type=places' },
  ];

  const communityLinks = [
    { label: t('footer.links.channels') || 'Channels', to: '/channels' },
    { label: t('footer.links.contribute') || 'Contribute', to: '/contribute' },
    { label: t('footer.links.events') || 'Events', to: '/explore?type=events' },
    { label: t('footer.links.seva') || 'Seva Opportunities', to: '/explore?type=seva' },
    { label: t('footer.links.directory') || 'Warkari Directory', to: '/explore?type=directory' },
  ];

  const supportLinks = [
    { label: t('footer.links.help') || 'Help Center', to: '/help' },
    { label: t('footer.links.guidelines') || 'Guidelines', to: '/guidelines' },
    { label: t('footer.links.privacy') || 'Privacy Policy', to: '/privacy' },
    { label: t('footer.links.terms') || 'Terms of Use', to: '/terms' },
    { label: t('footer.links.contact') || 'Contact Us', to: '/contact' },
  ];

  const socialLinks = [
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter / X' },
  ];

  const teamMembers = ['Swaraj', 'Vivek', 'Omkar', 'Hemanshu', 'Harshada'];

  return (
    <footer className="w-full bg-[#1C1008] border-t border-[#4A3222] text-[#E8D9C3] font-['Poppins',sans-serif]">
      {/* --- MAIN FOOTER GRID --- */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
        
        {/* BRAND & OVERVIEW (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
              <img
                loading="lazy"
                src={cloudinaryUrl(IMAGES.logo, { width: 44, height: 44, crop: 'fit', quality: 'auto' })}
                alt="Aapli Wari Logo"
                className="w-10 h-10 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-300"
              />
              <div className="leading-tight">
                <div className="text-lg font-bold text-[#FFF6EB] tracking-tight">Aapli Wari</div>
                <div className="text-[10px] text-[#E87A1E] font-semibold tracking-widest uppercase">Aapla Theva</div>
              </div>
            </Link>

            <p className="text-xs text-[#C2AB95]/80 leading-relaxed mb-4 max-w-xs font-light">
              {t('footer.preserve') || 'Preserve. Understand. Discover.'}
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-[#2D1B0E] border border-[#4A3222] flex items-center justify-center text-[#E87A1E] hover:bg-[#E87A1E] hover:text-white hover:border-[#E87A1E] transition-all duration-300 shadow-2xs"
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        </div>

        {/* EXPLORE LINKS (2 Cols) */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-bold text-[#FFF6EB] tracking-wider uppercase mb-3">Explore</h4>
          <ul className="flex flex-col gap-2">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-xs text-[#C2AB95]/85 hover:text-[#E87A1E] transition-colors font-medium">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COMMUNITY LINKS (2 Cols) */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-bold text-[#FFF6EB] tracking-wider uppercase mb-3">{t('footer.community') || 'Community'}</h4>
          <ul className="flex flex-col gap-2">
            {communityLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-xs text-[#C2AB95]/85 hover:text-[#E87A1E] transition-colors font-medium">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* SUPPORT LINKS & QUOTE BANNER (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-[#FFF6EB] tracking-wider uppercase mb-2">{t('footer.support') || 'Support'}</h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-xs text-[#C2AB95]/85 hover:text-[#E87A1E] transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ram Krishna Hari Quote Box */}
          <div className="bg-[#2B190E] border border-[#4A3222] border-l-4 border-l-[#E87A1E] rounded-xl p-3.5 shadow-sm">
            <p className="text-sm font-black text-[#E87A1E] tracking-wide leading-tight flex items-center gap-1.5">
              राम कृष्णा हरी! 🙏
            </p>
            <p className="text-[11px] text-[#C2AB95]/90 mt-1 leading-snug font-medium">
              The knowledge that unites millions, now in your hands.
            </p>
          </div>
        </div>

      </div>

      {/* --- TEAM CREDITS STRIP --- */}
      <div className="border-t border-[#2D1B0E] bg-[#140B05] py-2 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-[#C2AB95]/70 text-center">
          <span className="font-semibold text-[#E87A1E]">Crafted by Team:</span>
          {teamMembers.map((member, index) => (
            <span key={member} className="inline-flex items-center gap-2">
              <span className="text-[#FFF6EB] font-medium">{member}</span>
              {index < teamMembers.length - 1 && <span className="text-[#4A3222]">•</span>}
            </span>
          ))}
        </div>
      </div>

      {/* --- BOTTOM BAR --- */}
      <div className="border-t border-[#2D1B0E] py-3.5 px-6 bg-[#170C06]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-[#C2AB95]/60 font-medium">
          <div>
            © {new Date().getFullYear()} Aapli Wari. {t('footer.rights') || 'All rights reserved.'}
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#C2AB95]/80">
            Made with <FiHeart className="text-[#E87A1E] fill-[#E87A1E]" size={11} /> for Warkari Seva
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;