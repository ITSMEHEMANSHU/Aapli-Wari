import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaInstagram, FaYoutube, FaFlag } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold mb-3">
            <FaFlag className="text-secondary" />
            <span>Aapli Wari</span>
          </div>
          <p className="text-gray-400 text-sm">Preserving and celebrating Wari heritage through community-driven knowledge sharing.</p>
        </div>
        <div>
          <h4 className="text-secondary font-bold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/explore" className="text-gray-400 hover:text-white transition">Explore</Link>
            <Link to="/channels" className="text-gray-400 hover:text-white transition">Channels</Link>
            <Link to="/contribute" className="text-gray-400 hover:text-white transition">Contribute</Link>
          </div>
        </div>
        <div>
          <h4 className="text-secondary font-bold mb-3">Connect</h4>
          <div className="flex flex-col gap-2 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition flex items-center gap-2">
              <FaEnvelope /> Email
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition flex items-center gap-2">
              <FaInstagram /> Instagram
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition flex items-center gap-2">
              <FaYoutube /> YouTube
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-secondary font-bold mb-3">Support</h4>
          <div className="flex flex-col gap-2 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition">Help Center</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-gray-500 text-sm">
        © 2026 Aapli Wari. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;