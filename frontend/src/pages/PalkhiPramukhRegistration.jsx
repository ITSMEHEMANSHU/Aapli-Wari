import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { 
  FaCrown, 
  FaArrowRight, 
  FaSpinner, 
  FaCheckSquare, 
  FaOm, 
  FaInfoCircle 
} from 'react-icons/fa';

export const PalkhiPramukhRegistration = () => {
  const { user, isAuthenticated, loading: authLoading, refreshUser, isPalkhiPramukh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    palkhi_name: '',
    palkhi_description: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { message: 'Please sign in to register as a Palkhi Pramukh.' } });
        return;
      }

      if (isPalkhiPramukh && isPalkhiPramukh()) {
        navigate('/channel/create', { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, navigate, isPalkhiPramukh]);

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

    if (!formData.palkhi_name.trim()) {
      setError('Palkhi name is required');
      setLoading(false);
      return;
    }

    if (!formData.consent) {
      setError('You must agree to the community guidelines and declaration before proceeding');
      setLoading(false);
      return;
    }

    try {
      await api.applyPalkhiPramukh({
        palkhi_name: formData.palkhi_name.trim(),
        palkhi_description: formData.palkhi_description.trim() || null,
        consent: formData.consent,
      });

      // Refresh current user session so that role='palkhi_pramukh' is immediately active
      await refreshUser();

      // Redirect to Create Channel page or the intended destination
      const destination = location.state?.from || '/channel/create';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to register as Palkhi Pramukh. Please try again.');
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
              Palkhi Pramukh Leadership
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 text-white">
              Lead your Palkhi Channel.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed font-light">
              Register as an authorized Palkhi Pramukh to broadcast official procession routes, coordinate Dindi schedules, and share live spiritual darshan with devotees globally.
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#E8A15C]">
              <FaCrown className="text-base" />
              <span>Full control over your official Palkhi channel</span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#2B1B12]">Palkhi Pramukh Registration</h2>
            <p className="text-xs text-[#4A392E]/65 mt-1">
              Provide your Palkhi details to activate channel management permissions.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Palkhi Name */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                Palkhi Name <span className="text-[#DD6B35]">*</span>
              </label>
              <div className="relative">
                <FaOm className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                <input
                  type="text"
                  name="palkhi_name"
                  placeholder="e.g., Sant Dnyaneshwar Maharaj Palkhi, Alandi"
                  value={formData.palkhi_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                  required
                />
              </div>
            </div>

            {/* Palkhi Description */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                Palkhi Description <span className="text-[#4A392E]/40 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                name="palkhi_description"
                rows="3"
                placeholder="Share the history, traditional route, or significance of this Palkhi..."
                value={formData.palkhi_description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition resize-none"
              />
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
                  I agree to follow the community guidelines.
                </span>
              </label>
              <p className="text-[11px] text-[#4A392E]/75 pl-6.5 leading-relaxed italic">
                "I declare that I am the authorized representative of this Palkhi and will manage the channel responsibly."
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
                  <span>Registering Palkhi...</span>
                </>
              ) : (
                <>
                  <span>Register as Palkhi Pramukh</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-xs text-[#4A392E]/65">
            Looking for existing channels?{' '}
            <Link to="/channels" className="text-[#DD6B35] font-bold hover:underline">
              Browse all Palkhis
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default PalkhiPramukhRegistration;
