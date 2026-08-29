import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaArrowRight, 
  FaSpinner, 
  FaHandsHelping,
  FaCheckSquare
} from 'react-icons/fa';

export const ContributorRegistration = () => {
  const { user, isAuthenticated, loading: authLoading, refreshUser, isContributor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user data and check permissions on mount/load
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { message: 'Please sign in to apply as a contributor.' } });
        return;
      }

      if (isContributor && isContributor()) {
        navigate('/contribute', { replace: true });
        return;
      }

      if (user) {
        setFormData((prev) => ({
          ...prev,
          full_name: user.full_name || user.name || '',
          email: user.email || '',
        }));
      }
    }
  }, [user, isAuthenticated, authLoading, navigate, isContributor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email address is required');
      setLoading(false);
      return;
    }

    const mobileClean = formData.mobile.replace(/\D/g, '');
    if (!mobileClean || mobileClean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    if (!formData.consent) {
      setError('You must agree to the contributor declaration before proceeding');
      setLoading(false);
      return;
    }

    try {
      await api.applyContributor({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        consent: formData.consent,
      });

      // Refresh current user session so that role='contributor' is immediately updated
      await refreshUser();

      // Redirect to the originally intended page or /contribute
      const destination = location.state?.from || '/contribute';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to submit contributor registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#DD6B35] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-[#FDF8F0] p-4 my-18 sm:p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-[#E8D9C3]">
        
        {/* Left Side Hero */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#3D2518] to-[#2B1810] p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#DD6B35]/20 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#E8A15C]/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-[#DD6B35]/20 border border-[#DD6B35]/30 text-[#E8A15C] rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              Aapli Wari Contributor
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 text-white">
              Become a Custodian of Wari.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              Join our community of verified contributors to document sacred routes, upload historical manuscripts, share saint biographies, and preserve centuries of Pandharpur heritage.
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#E8A15C]">
              <FaHandsHelping className="text-base" />
              <span>Direct access to publish stories & media</span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#2B1B12]">Contributor Application</h2>
            <p className="text-xs text-[#4A392E]/65 mt-1">
              Complete your verification details to begin contributing authentic Wari content.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Used for editorial communications and contributor verification.</p>
            </div>

            {/* Declaration & Consent Checkbox */}
            <div className="bg-[#FBF5EC]/60 border border-[#E8D9C3] p-3.5 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-[#E8D9C3] text-[#DD6B35] focus:ring-[#DD6B35]/40 cursor-pointer accent-[#DD6B35]"
                  required
                />
                <span className="text-xs font-semibold text-[#2B1B12] leading-tight">
                  I agree to contribute authentic Wari heritage content.
                </span>
              </label>
              <p className="text-[11px] text-[#4A392E]/75 pl-6.5 leading-relaxed italic">
                "I declare that the content I share will be authentic and respectful to Wari traditions."
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#DD6B35] hover:bg-[#C85A28] text-white font-bold py-3 px-5 rounded-xl shadow-md shadow-[#DD6B35]/20 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Processing Application...</span>
                </>
              ) : (
                <>
                  <span>Apply as Contributor</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-xs text-[#4A392E]/65">
            Want to learn more first?{' '}
            <Link to="/explore" className="text-[#DD6B35] font-bold hover:underline">
              Explore Wari stories
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default ContributorRegistration;
