import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';
import { IMAGES, cloudinaryUrl } from '../../utils/cloudinary';

export const Footer = () => {
  const exploreLinks = [
    { label: 'Traditions',  to: '/explore?type=traditions' },
    { label: 'Abhangs',     to: '/explore?type=abhangs' },
    { label: 'Places',      to: '/explore?type=places' },
  ];

  const communityLinks = [
    { label: 'Channels',             to: '/channels' },
    { label: 'Contribute',           to: '/contribute' },
    { label: 'Events',               to: '/explore?type=events' },
    { label: 'Seva Opportunities',   to: '/explore?type=seva' },
    { label: 'Warkari Directory',    to: '/explore?type=directory' },
  ];

  const supportLinks = [
    { label: 'Help Center',    to: '/help' },
    { label: 'Guidelines',     to: '/guidelines' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Use',   to: '/terms' },
    { label: 'Contact Us',     to: '/contact' },
  ];

  const socialLinks = [
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaYoutube,   href: '#', label: 'YouTube' },
    { icon: FaFacebook,  href: '#', label: 'Facebook' },
    { icon: FaTwitter,   href: '#', label: 'Twitter / X' },
  ];

  return (
    <footer className="bg-[#FDF8F0] border-t border-[#D4A373]/30 mt-0">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-3">
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
          <p className="text-xs text-[#5A4030]/80 leading-relaxed mb-4 max-w-50">
            Preserve. Understand. Discover.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full border border-[#D4A373]/40 flex items-center justify-center text-[#5A4030] hover:border-[#8B3A3A] hover:text-[#8B3A3A] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[#2D1B0E] mb-4">Explore</h4>
          <ul className="flex flex-col gap-2.5">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-[#5A4030]/80 hover:text-[#8B3A3A] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[#2D1B0E] mb-4">Community</h4>
          <ul className="flex flex-col gap-2.5">
            {communityLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-[#5A4030]/80 hover:text-[#8B3A3A] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[#2D1B0E] mb-4">Support</h4>
          <ul className="flex flex-col gap-2.5 mb-8">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-[#5A4030]/80 hover:text-[#8B3A3A] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="bg-white border border-[#D4A373]/30 border-l-4 border-l-[#D4A373] rounded-[12px] p-4 shadow-[0_4px_20px_rgba(139,58,58,0.08)]">
            <p className="text-base font-bold text-[#2D1B0E] leading-snug">
              ज्ञानबा-तुकाराम! 🙏
            </p>
            <p className="text-xs text-[#5A4030]/80 mt-1 leading-relaxed">
              The knowledge that unites millions,<br />now in your hands.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D4A373]/30 py-4 px-6">
        <div className="max-w-7xl mx-auto text-center text-xs text-[#5A4030]/60">
          © 2024 Aapli Wari. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
