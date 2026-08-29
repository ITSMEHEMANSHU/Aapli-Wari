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

  // Pre-fill user data and check permissions on mount/load
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
      setError('Mobile number must be 10 digits');
      return false;
    }
    if (!formData.consent) {
      setError('You must agree to the consent to continue');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setLoading(false);
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
      console.error('Contributor registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF5EC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A574] mx-auto mb-4"></div>
          <p className="text-[#7a6b63]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF5EC] to-[#f5ebe0] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D4A574] to-[#c49460] px-8 py-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Become a Contributor</h1>
          <p className="text-orange-100 text-sm font-medium">Share your Wari heritage content with the community</p>
        </div>

        {/* Form Container */}
        <div className="px-8 py-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
              <p className="text-green-700 font-semibold text-center">
                ✓ You have successfully become a contributor! Redirecting...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in">
              <p className="text-red-700 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-[#2c1810] mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#e8dfd7] rounded-lg bg-[#fafaf8] focus:outline-none focus:border-[#D4A574] focus:bg-white focus:ring-2 focus:ring-[#D4A574] focus:ring-opacity-10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#2c1810] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#e8dfd7] rounded-lg bg-[#fafaf8] focus:outline-none focus:border-[#D4A574] focus:bg-white focus:ring-2 focus:ring-[#D4A574] focus:ring-opacity-10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-[#2c1810] mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your 10-digit mobile number"
                maxLength="10"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#e8dfd7] rounded-lg bg-[#fafaf8] focus:outline-none focus:border-[#D4A574] focus:bg-white focus:ring-2 focus:ring-[#D4A574] focus:ring-opacity-10 disabled:bg-[#f5f5f5] disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Declaration Section */}
            <div className="bg-[#f9f7f5] border-l-4 border-[#D4A574] rounded-lg p-5 my-6">
              <div className="mb-4">
                <p className="text-sm text-[#2c1810] leading-relaxed">
                  <strong className="text-[#5c3d2e]">Declaration:</strong> I declare that the content I share will be authentic and respectful to Wari traditions.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-5 h-5 mt-0.5 cursor-pointer accent-[#D4A574] flex-shrink-0"
                />
                <span className="text-sm text-[#2c1810] font-medium leading-relaxed">
                  I agree to contribute authentic Wari heritage content and respect community guidelines
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.consent}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#D4A574] to-[#c49460] hover:from-[#c49460] hover:to-[#b08850] disabled:from-[#d9d1ca] disabled:to-[#d9d1ca] text-white font-bold rounded-lg transition-all duration-200 uppercase tracking-wide text-sm shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Applying...
                </span>
              ) : (
                'Apply as Contributor'
              )}
            </button>
          </form>

          {/* Info Text */}
          <div className="mt-8 pt-6 border-t border-[#e8dfd7] text-center">
            <p className="text-xs text-[#7a6b63] leading-relaxed">
              Once submitted, you'll be able to upload and share content with the Aapli Wari community. Your application will be reviewed quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorRegistration;
