import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export const ContributorRegistration = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, refreshUser, hasContributePermission } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { message: 'Please sign in to apply as a contributor.' } });
        return;
      }

      if (hasContributePermission && hasContributePermission()) {
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
  }, [authLoading, isAuthenticated, user, navigate, hasContributePermission]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.mobile.trim()) {
      setError('Mobile number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      setError('Mobile number must be exactly 10 digits');
      return false;
    }
    if (!formData.consent) {
      setError('You must agree to the community guidelines and declaration to continue');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.applyContributor({
        full_name: formData.full_name,
        email: formData.email,
        mobile: formData.mobile,
        consent: formData.consent,
      });

      setSuccess(true);
      await refreshUser();
      
      setTimeout(() => {
        navigate('/contribute', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to apply as contributor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#6d2325] border-t-transparent mx-auto"></div>
          <p className="text-[#6d2325]/70 font-medium text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FDF8F0] to-[#f3e5d8] px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#E8D9C3] overflow-hidden">

        {/* Back Button */}
        <div className="px-6 pt-6 bg-[#FFF8F7]">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6d2325] hover:text-[#451416] transition-colors cursor-pointer"
          >
            ← Back
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-[#FFF8F7] px-8 pt-4 pb-8 text-center border-b border-[#E8D9C3]/60">
          <div className="w-14 h-14 bg-[#6d2325]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#6d2325] text-2xl">
            🛡️
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#6d2325] tracking-tight mb-1.5">
            Become a Contributor
          </h1>
          <p className="text-[#7A5C58] text-sm max-w-sm mx-auto leading-relaxed">
            Share authentic Wari heritage stories, media, and updates with the Aapli Wari community.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <span className="text-emerald-600 text-xl font-bold">✓</span>
              <p className="text-emerald-800 text-sm font-semibold">
                Application successful! Redirecting to dashboard...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <p className="text-rose-700 text-sm font-medium text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#4A2E2B] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8C6D6A] pointer-events-none">
                  👤
                </span>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#E8D9C3] rounded-xl text-sm text-[#2D1B0E] placeholder-[#A89895] focus:outline-none focus:bg-white focus:border-[#6d2325] focus:ring-2 focus:ring-[#6d2325]/10 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#4A2E2B] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8C6D6A] pointer-events-none">
                  ✉️
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#E8D9C3] rounded-xl text-sm text-[#2D1B0E] placeholder-[#A89895] focus:outline-none focus:bg-white focus:border-[#6d2325] focus:ring-2 focus:ring-[#6d2325]/10 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-[#4A2E2B] uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8C6D6A] pointer-events-none">
                  ☎️
                </span>
                <input
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#E8D9C3] rounded-xl text-sm text-[#2D1B0E] placeholder-[#A89895] focus:outline-none focus:bg-white focus:border-[#6d2325] focus:ring-2 focus:ring-[#6d2325]/10 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Declaration Box */}
            <div className="bg-[#FAF7F2] border-l-4 border-[#6d2325] rounded-2xl p-4 my-6 border-y border-r border-[#E8D9C3]">
              <p className="text-xs text-[#554241] leading-relaxed mb-3">
                <strong className="text-[#6d2325]">Declaration:</strong> I declare that any content I share or upload will be authentic, culturally respectful, and abide by the values of the Wari tradition.
              </p>
              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-[#E8D9C3]/50">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 mt-0.5 cursor-pointer accent-[#6d2325] rounded flex-shrink-0"
                />
                <span className="text-xs text-[#2D1B0E] font-medium leading-relaxed select-none">
                  I agree to follow the community guidelines and share verified content.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.consent}
              className="w-full py-3.5 px-4 bg-[#6d2325] hover:bg-[#5c1d1f] disabled:bg-[#E8D9C3] text-white font-bold rounded-xl transition-all duration-200 tracking-wide text-sm shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-[#E8D9C3]/60 text-center">
            <p className="text-xs text-[#7A5C58] leading-relaxed">
              Applications are reviewed shortly after submission. Once approved, uploading tools will unlock on your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorRegistration;