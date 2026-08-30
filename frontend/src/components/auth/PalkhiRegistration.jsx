import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { FaArrowLeft, FaSpinner, FaPlusCircle } from 'react-icons/fa';

export const PalkhiRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in or not palkhi_pramukh
  React.useEffect(() => {
    if (!user || user.role !== 'palkhi_pramukh') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Palkhi name is required');
      setLoading(false);
      return;
    }

    try {
      await api.createPalkhi({
        name: formData.name,
        description: formData.description,
      });
      // After successful palkhi registration, redirect to create channel
      navigate('/channel/create', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to register Palkhi. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF5EC] p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-[#E8D9C3] p-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FaArrowLeft className="text-[#2B1B12]" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2B1B12]">Register Your Palkhi</h2>
            <p className="text-sm text-[#4A392E]/65">
              As a Palkhi Pramukh, you need to register your Palkhi to create a channel.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#2B1B12] mb-1">
              Palkhi Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Sant Dnyaneshwar Palkhi"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2B1B12] mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Tell us about your Palkhi, its history, significance..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#DD6B35]/20 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <FaPlusCircle />
                <span>Register Palkhi</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#4A392E]/50 mt-6">
          After registration, you can create your channel and start sharing Wari heritage.
        </p>
      </div>
    </div>
  );
};

export default PalkhiRegistration;