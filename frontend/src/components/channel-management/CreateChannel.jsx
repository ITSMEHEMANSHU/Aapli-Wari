import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { api } from '../../services/api';
import { FaCrown, FaArrowLeft, FaSpinner, FaLayerGroup } from 'react-icons/fa';

export const CreateChannel = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, canCreateChannel } = useAuth();

  const [palkhi, setPalkhi] = useState(null);
  const [loadingPalkhi, setLoadingPalkhi] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && canCreateChannel && canCreateChannel()) {
      const loadPalkhi = async () => {
        try {
          setLoadingPalkhi(true);
          setError('');

          const data = await api.myPalkhi();
          setPalkhi(data);
          if (data && data.name) {
            setFormData((prev) => ({
              ...prev,
              name: prev.name || `${data.name} Channel`,
              description: prev.description || data.description || '',
            }));
          }
        } catch (err) {
          setError(err.message || 'Unable to load your Palkhi');
        } finally {
          setLoadingPalkhi(false);
        }
      };

      loadPalkhi();
    } else {
      setLoadingPalkhi(false);
    }
  }, [isAuthenticated, canCreateChannel]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#DD6B35] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/channel/create' }} replace />;
  }

  if (!canCreateChannel || !canCreateChannel()) {
    return <Navigate to="/apply-palkhi-pramukh" state={{ from: '/channel/create' }} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!palkhi) {
      setError('Your Palkhi could not be found. Please ensure your Palkhi Pramukh registration is active.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Channel name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const channel = await api.createChannel({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        palkhi_id: palkhi.id,
      });

      navigate(`/channel/${channel.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#4A392E]/60 hover:text-[#DD6B35] mb-6 transition"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E8D9C3]">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#E8D9C3]/60">
          <div className="p-3 bg-[#FBF5EC] text-[#DD6B35] rounded-2xl">
            <FaCrown className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2B1B12]">Create Palkhi Channel</h1>
            <p className="text-xs text-[#4A392E]/65">Launch the official broadcast channel for your Palkhi</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3.5 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {loadingPalkhi ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <FaSpinner className="animate-spin inline-block mr-2 text-[#DD6B35]" />
            Loading your Palkhi details...
          </div>
        ) : (
          <>
            {palkhi && (
              <div className="bg-[#FBF5EC]/80 border border-[#E8D9C3] p-4 rounded-2xl mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#DD6B35]">Affiliated Palkhi</span>
                  <p className="text-sm font-bold text-[#2B1B12]">{palkhi.name}</p>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Approved
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                  Channel Name <span className="text-[#DD6B35]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Official Alandi Palkhi Darshan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                  Description <span className="text-[#4A392E]/40 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what followers can expect on this channel (live route updates, dindi darshan, evening aarti schedules)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#E8D9C3] text-sm font-semibold text-[#4A392E] hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !palkhi}
                  className="flex-1 py-3 px-4 bg-[#DD6B35] hover:bg-[#C85A28] text-white text-sm font-bold rounded-xl shadow-md shadow-[#DD6B35]/20 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Creating Channel...</span>
                    </>
                  ) : (
                    <span>Create Channel</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateChannel;