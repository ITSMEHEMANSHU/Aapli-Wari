import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { IMAGES, cloudinaryUrl } from '../../utils/cloudinary';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  const exploreLinks = [
    { label: t('footer.links.traditions'), to: '/explore?type=traditions' },
    { label: t('footer.links.abhangs'), to: '/explore?type=abhangs' },
    { label: t('footer.links.places'), to: '/explore?type=places' },
  ];

  const communityLinks = [
    { label: t('footer.links.channels'), to: '/channels' },
    { label: t('footer.links.contribute'), to: '/contribute' },
    { label: t('footer.links.events'), to: '/explore?type=events' },
    { label: t('footer.links.seva'), to: '/explore?type=seva' },
    { label: t('footer.links.directory'), to: '/explore?type=directory' },
  ];

  const supportLinks = [
    { label: t('footer.links.help'), to: '/help' },
    { label: t('footer.links.guidelines'), to: '/guidelines' },
    { label: t('footer.links.privacy'), to: '/privacy' },
    { label: t('footer.links.terms'), to: '/terms' },
    { label: t('footer.links.contact'), to: '/contact' },
  ];

  const socialLinks = [
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
    { icon: FaFacebook, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter / X' },
  ];

  return (
    <footer className="w-full bg-[#F9F1E5] border-t border-[#E8D9C3]/80 text-[#2D1B0E] font-['Poppins',sans-serif]">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <img
              src={cloudinaryUrl(IMAGES.logo, { width: 44, height: 44, crop: 'fit', quality: 'auto' })}
              alt="Aapli Wari Logo"
              className="w-11 h-11 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-300"
            />
            <div className="leading-tight">
              <div className="text-xl font-bold text-[#2D1B0E] tracking-tight">Aapli Wari</div>
              <div className="text-[11px] text-[#E87A1E] font-semibold tracking-widest uppercase">Aapla Theva</div>
            </div>
          </Link>

          <p className="text-xs sm:text-sm text-[#5A4030]/80 leading-relaxed mb-6 max-w-sm font-light">
            {t('footer.preserve')}
          </p>

          <div className="flex items-center gap-2.5">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-[#F7ECC1] border border-[#E8D9C3] flex items-center justify-center text-[#E87A1E] hover:bg-[#E87A1E] hover:text-white hover:border-[#E87A1E] hover:-translate-y-0.5 transition-all duration-300 shadow-2xs"
                >
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[#2D1B0E] mb-4">{t('footer.explore')}</h4>
          <ul className="flex flex-col gap-2.5">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-xs sm:text-sm text-[#5A4030]/85 hover:text-[#E87A1E] transition-colors font-medium">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[#2D1B0E] mb-4">{t('footer.community')}</h4>
          <ul className="flex flex-col gap-2.5">
            {communityLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-xs sm:text-sm text-[#5A4030]/85 hover:text-[#E87A1E] transition-colors font-medium">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#2D1B0E] mb-4">{t('footer.support')}</h4>
            <ul className="flex flex-col gap-2.5 mb-6">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-xs sm:text-sm text-[#5A4030]/85 hover:text-[#E87A1E] transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-[#E8D9C3] border-l-4 border-l-[#E87A1E] rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-extrabold text-[#2D1B0E] leading-tight">
              {t('footer.quote')}
            </p>
            <p className="text-[11px] text-[#5A4030]/80 mt-1 leading-relaxed">
              {t('footer.quoteSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8D9C3]/80 py-5 px-6 bg-[#F9F1E5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-[#5A4030]/70 font-medium">
          <div>
            © {new Date().getFullYear()} Aapli Wari. {t('footer.rights')}
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#5A4030]/80">
            Made with <FiHeart className="text-[#E87A1E] fill-[#E87A1E]" size={12} /> for Warkari Seva
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;