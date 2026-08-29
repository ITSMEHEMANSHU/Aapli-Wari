import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
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
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#E87A1E] border-t-transparent mx-auto"></div>
          <p className="text-[#331E14] font-medium text-xs">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-[#FDF8F0] px-4 py-18">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#E8D9C3] overflow-hidden">

        {/* Back Button */}
        <div className="px-6 pt-5 bg-[#331E14]">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#BAB4AF] hover:text-[#BAB4AF] transition-colors cursor-pointer"
          >
            ← Back
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-[#331E14] px-6 pt-2 pb-5 text-center border-b border-[#E8D9C3]/20">
          <h1 className="text-xl md:text-2xl font-extrabold text-[#FFFFFF] tracking-tight mb-1">
            Become a Contributor
          </h1>
          <p className="text-[#BAB4AF] text-xs max-w-sm mx-auto leading-relaxed">
            Share authentic Wari heritage stories, media, and updates with the Aapli Wari community.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 bg-white">
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <span className="text-emerald-600 text-lg font-bold">✓</span>
              <p className="text-emerald-800 text-xs font-semibold">
                Application successful! Redirecting to dashboard...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl">
              <p className="text-rose-700 text-xs font-medium text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#331E14] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#7A5C58] pointer-events-none">
                  <FiUser className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8D9C3] rounded-xl text-xs text-[#2D1B0E] font-medium placeholder-[#9E827B] focus:outline-none focus:bg-white focus:border-[#E87A1E] focus:ring-2 focus:ring-[#E87A1E]/10 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#331E14] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#7A5C58] pointer-events-none">
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8D9C3] rounded-xl text-xs text-[#2D1B0E] font-medium placeholder-[#9E827B] focus:outline-none focus:bg-white focus:border-[#E87A1E] focus:ring-2 focus:ring-[#E87A1E]/10 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-[#331E14] uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#7A5C58] pointer-events-none">
                  <FiPhone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8D9C3] rounded-xl text-xs text-[#2D1B0E] font-medium placeholder-[#9E827B] focus:outline-none focus:bg-white focus:border-[#E87A1E] focus:ring-2 focus:ring-[#E87A1E]/10 disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {/* Declaration Box */}
            <div className="bg-[#FAF7F2] rounded-2xl p-3.5 my-4 border border-[#E8D9C3]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-3.5 h-3.5 mt-0.5 cursor-pointer accent-[#E87A1E] rounded flex-shrink-0"
                />
                <span className="text-[11px] text-[#331E14] font-medium leading-relaxed select-none">
                  I agree to follow the community guidelines and share verified, respectful content.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.consent}
              className="w-full py-3 px-4 bg-[#E87A1E] hover:bg-[#d66c14] disabled:bg-[#E8D9C3] text-white font-bold rounded-xl transition-all duration-200 tracking-wide text-xs shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-4 pt-4 border-t border-[#E8D9C3]/60 text-center">
            <p className="text-[11px] text-[#554241] leading-relaxed">
              Applications are reviewed shortly after submission. Once approved, uploading tools will unlock on your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorRegistration;