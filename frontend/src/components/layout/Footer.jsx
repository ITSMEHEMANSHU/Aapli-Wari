import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';
import { IMAGES, cloudinaryUrl } from '../../utils/cloudinary';

/**
 * Footer — matches the Aapli Wari design:
 * Logo + social | Explore links | Community links | Support links | Tagline (Marathi)
 */
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
    <footer className="bg-[#FBF5EC] border-t border-[#E8D9C3] mt-0">
      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Col 1 — Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-3">
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
          <p className="text-xs text-[#4A392E]/70 leading-relaxed mb-4 max-w-50">
            Preserve. Understand. Discover.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-full border border-[#E8D9C3] flex items-center justify-center text-[#4A392E] hover:border-[#DD6B35] hover:text-[#DD6B35] transition-colors"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Explore */}
        <div>
          <h4 className="text-sm font-bold text-[#2B1B12] mb-4">Explore</h4>
          <ul className="flex flex-col gap-2.5">
            {exploreLinks.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-[#4A392E]/70 hover:text-[#DD6B35] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Community */}
        <div>
          <h4 className="text-sm font-bold text-[#2B1B12] mb-4">Community</h4>
          <ul className="flex flex-col gap-2.5">
            {communityLinks.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-[#4A392E]/70 hover:text-[#DD6B35] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Support + Tagline */}
        <div>
          <h4 className="text-sm font-bold text-[#2B1B12] mb-4">Support</h4>
          <ul className="flex flex-col gap-2.5 mb-8">
            {supportLinks.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-[#4A392E]/70 hover:text-[#DD6B35] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Marathi tagline box */}
          <div className="bg-[#FDF7EE] border border-[#E8D9C3] rounded-xl p-4">
            <p className="text-base font-bold text-[#2B1B12] leading-snug">
              ज्ञानबा-तुकाराम! 🙏
            </p>
            <p className="text-xs text-[#4A392E]/70 mt-1 leading-relaxed">
              The knowledge that unites millions,<br />now in your hands.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[#E8D9C3] py-4 px-6">
        <div className="max-w-7xl mx-auto text-center text-xs text-[#4A392E]/50">
          © 2024 Aapli Wari. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
