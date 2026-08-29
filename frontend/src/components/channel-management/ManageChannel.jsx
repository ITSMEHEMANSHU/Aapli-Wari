import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import {
  FiArrowLeft,
  FiSettings,
  FiUsers,
  FiAlertTriangle,
  FiTrash2,
  FiUserPlus,
  FiSave,
  FiEdit2,
  FiCheckCircle,
  FiXCircle,
  FiToggleLeft,
  FiToggleRight,
  FiPhone,
  FiExternalLink,
  FiClock,
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

export const ManageChannel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, canManageChannel } = useAuth();

  // ── Channel Settings ──────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [channelData, setChannelData] = useState({ name: '', description: '', status: 'active' });
  const [originalData, setOriginalData] = useState({ name: '', description: '', status: 'active' });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // ── Emergency Contact ─────────────────────────────────────────
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '', role: '' });
  const [savingEmergency, setSavingEmergency] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState('');
  const [emergencyError, setEmergencyError] = useState('');

  // ── Contributors ──────────────────────────────────────────────
  const [contributors, setContributors] = useState([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [newContributorId, setNewContributorId] = useState('');
  const [addingContributor, setAddingContributor] = useState(false);
  const [contributorError, setContributorError] = useState('');
  const [contributorSuccess, setContributorSuccess] = useState('');
  const [removingId, setRemovingId] = useState(null);

  // ── Join Requests ─────────────────────────────────────────────
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // ── Data Loading ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.channel(id);

        // Only the channel owner (or admin) can manage
        const isOwner = data.is_owner === true || (user && String(data.created_by_user_id) === String(user.id));
        if (user && !isOwner && user.role !== 'admin') {
          navigate('/channels', { replace: true });
          return;
        }

        const ch = {
          name: data.name || '',
          description: data.description || '',
          status: data.status || 'active',
        };
        setChannelData(ch);
        setOriginalData(ch);

        setEmergencyContact({
          name: data.emergency_contact_name || '',
          phone: data.emergency_contact_phone || '',
          role: data.emergency_contact_role || '',
        });
      } catch (err) {
        setError(err.message || 'Failed to load channel');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && isAuthenticated) load();
  }, [id, user, authLoading, isAuthenticated]);

  const loadContributors = async () => {
    try {
      setLoadingContributors(true);
      const data = await api.channelContributors(id);
      setContributors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load contributors:', err);
    } finally {
      setLoadingContributors(false);
    }
  };

  const loadJoinRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await api.channelJoinRequests(id);
      setJoinRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load join requests:', err);
      setJoinRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadContributors();
      loadJoinRequests();
    }
  }, [id, authLoading, isAuthenticated]);

  // ── Helpers ───────────────────────────────────────────────────
  const showSuccess = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(''), 3500);
  };

  const isDirty =
    channelData.name !== originalData.name ||
    channelData.description !== originalData.description;

  // ── Handlers ──────────────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!channelData.name.trim()) {
      setError('Channel name cannot be empty.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const updated = await api.updateChannel(id, {
        name: channelData.name.trim(),
        description: channelData.description.trim() || null,
      });
      const ch = { name: updated.name, description: updated.description || '', status: updated.status };
      setChannelData(ch);
      setOriginalData(ch);
      showSuccess(setSuccessMessage, '✅ Channel settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save channel settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = channelData.status === 'active' ? 'inactive' : 'active';
    try {
      setSavingStatus(true);
      setError('');
      await api.changeChannelStatus(id, newStatus);
      setChannelData((p) => ({ ...p, status: newStatus }));
      setOriginalData((p) => ({ ...p, status: newStatus }));
      showSuccess(setSuccessMessage, `✅ Channel is now ${newStatus}.`);
    } catch (err) {
      setError(err.message || 'Failed to change channel status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveEmergency = async (e) => {
    e.preventDefault();
    setEmergencyError('');
    const normalizedPhone = emergencyContact.phone.replace(/\s+/g, '').trim();
    if (emergencyContact.name.trim() && normalizedPhone && !/^\+?[0-9\-\s()]{7,15}$/.test(normalizedPhone)) {
      setEmergencyError('Enter a valid phone number.');
      return;
    }
    try {
      setSavingEmergency(true);
      await api.updateEmergencyContact(id, {
        emergency_contact_name: emergencyContact.name.trim() || null,
        emergency_contact_phone: normalizedPhone || null,
        emergency_contact_role: emergencyContact.role.trim() || null,
      });
      showSuccess(setEmergencySuccess, '✅ Emergency contact updated!');
    } catch (err) {
      setEmergencyError(err.message || 'Failed to update emergency contact.');
    } finally {
      setSavingEmergency(false);
    }
  };

  const handleAddContributor = async () => {
    if (!newContributorId.trim()) return;
    setContributorError('');
    try {
      setAddingContributor(true);
      await api.addChannelContributor(id, newContributorId.trim());
      setNewContributorId('');
      await loadContributors();
      showSuccess(setContributorSuccess, '✅ Contributor added successfully!');
    } catch (err) {
      setContributorError(err.message || 'Failed to add contributor. Ensure the User ID belongs to a Contributor role.');
    } finally {
      setAddingContributor(false);
    }
  };

  const handleRemoveContributor = async (contributorId) => {
    setContributorError('');
    try {
      setRemovingId(contributorId);
      await api.removeChannelContributor(id, contributorId);
      await loadContributors();
      showSuccess(setContributorSuccess, '✅ Contributor removed.');
    } catch (err) {
      setContributorError(err.message || 'Failed to remove contributor.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleDecideJoinRequest = async (requestId, action) => {
    setContributorError('');
    try {
      setProcessingRequestId(requestId);
      await api.decideJoinRequest(id, requestId, action);
      await loadJoinRequests();
      if (action === 'approve') await loadContributors();
      showSuccess(setContributorSuccess, `✅ Request ${action}d.`);
    } catch (err) {
      setContributorError(err.message || `Failed to ${action} request.`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  // ── Guard conditions ──────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#DD6B35] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!canManageChannel || !canManageChannel()) {
    return <Navigate to="/channels" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#DD6B35] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-[#F8F4EE] min-h-screen py-6 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex items-center gap-4">
          <Link
            to={`/channel/${id}`}
            className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#E8D9C3] text-[#8B1E1E] transition-all"
            title="Back to channel"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FiSettings className="text-[#8B1E1E] shrink-0" size={20} />
              <h1 className="text-xl sm:text-2xl font-black text-[#2B1B12] truncate">Manage Channel</h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {channelData.name} · <span className={`font-semibold ${channelData.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>{channelData.status}</span>
            </p>
          </div>
          <Link
            to={`/channel/${id}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#DD6B35] hover:underline"
          >
            View Channel <FiExternalLink size={13} />
          </Link>
        </div>

        {/* Global Error / Success */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
            <FiXCircle /> {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
            <FiCheckCircle /> {successMessage}
          </div>
        )}

        {/* ── Section 1: Channel Settings ── */}
        <section className="bg-white rounded-3xl border border-[#E8D9C3] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0E6D8] flex items-center gap-3">
            <div className="p-2 bg-[#FBF5EC] rounded-xl">
              <FiEdit2 className="text-[#8B1E1E]" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#2B1B12]">Channel Settings</h2>
              <p className="text-[11px] text-gray-500">Edit name, description, and channel status</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="p-5 space-y-4">
            {/* Channel Name */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                Channel Name <span className="text-[#DD6B35]">*</span>
              </label>
              <input
                type="text"
                value={channelData.name}
                onChange={(e) => setChannelData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#2B1B12] uppercase tracking-wider mb-1.5">
                Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={channelData.description}
                onChange={(e) => setChannelData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe what followers can expect on this channel..."
                className="w-full px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-gray-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition resize-none"
              />
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between p-3 bg-[#FBF5EC] rounded-xl border border-[#E8D9C3]">
              <div>
                <p className="text-xs font-bold text-[#2B1B12]">Channel Status</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {channelData.status === 'active'
                    ? 'Channel is live and visible to all users'
                    : 'Channel is hidden from public listing'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={savingStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  channelData.status === 'active'
                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                } disabled:opacity-60`}
              >
                {savingStatus ? (
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : channelData.status === 'active' ? (
                  <FiToggleRight size={16} />
                ) : (
                  <FiToggleLeft size={16} />
                )}
                {channelData.status === 'active' ? 'Active' : 'Inactive'}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1E1E] hover:bg-[#701616] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-all"
              >
                {saving ? (
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <FiSave size={14} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>

        {/* ── Section 2: Emergency Contact ── */}
        <section className="bg-white rounded-3xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="p-2 bg-red-100 rounded-xl">
              <FiAlertTriangle className="text-red-600" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-red-900">Emergency Helpline</h2>
              <p className="text-[11px] text-red-700/70">Contact info shown to all followers in emergency banner</p>
            </div>
          </div>

          <form onSubmit={handleSaveEmergency} className="p-5 space-y-4">
            {emergencyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold">
                {emergencyError}
              </div>
            )}
            {emergencySuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold">
                {emergencySuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Contact Name / Center</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Patil / Seva Kendra"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number <FiPhone size={11} className="inline ml-1 text-red-500" />
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Designation / Role</label>
              <input
                type="text"
                placeholder="e.g. Medical Van Coordinator, Local Pramukh"
                value={emergencyContact.role}
                onChange={(e) => setEmergencyContact((p) => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingEmergency}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
              >
                {savingEmergency ? (
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <FiSave size={14} />
                )}
                {savingEmergency ? 'Saving...' : 'Update Helpline'}
              </button>
            </div>
          </form>
        </section>

        {/* ── Section 3: Pending Join Requests ── */}
        <section className="bg-white rounded-3xl border border-[#E8D9C3] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0E6D8] flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <FiClock className="text-amber-600" size={16} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#2B1B12]">
                Pending Join Requests
                {joinRequests.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                    {joinRequests.length}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-500">Approve or reject contributor join requests</p>
            </div>
          </div>

          <div className="p-5">
            {loadingRequests ? (
              <div className="py-4 text-center text-xs text-gray-400">Loading requests...</div>
            ) : joinRequests.length === 0 ? (
              <p className="text-xs text-center text-gray-400 italic py-4">No pending join requests at this time.</p>
            ) : (
              <div className="space-y-2">
                {joinRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-800 font-bold text-sm flex items-center justify-center shrink-0">
                      {req.user?.full_name?.[0] || req.user?.username?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2B1B12] truncate">{req.user?.full_name || req.user?.username || 'Unknown User'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{req.user?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDecideJoinRequest(req.id, 'approve')}
                        disabled={processingRequestId === req.id}
                        className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <FiCheckCircle size={15} />
                      </button>
                      <button
                        onClick={() => handleDecideJoinRequest(req.id, 'reject')}
                        disabled={processingRequestId === req.id}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <FiXCircle size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Section 4: Contributors Management ── */}
        <section className="bg-white rounded-3xl border border-[#E8D9C3] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0E6D8] flex items-center gap-3">
            <div className="p-2 bg-[#FBF5EC] rounded-xl">
              <FiUsers className="text-[#8B1E1E]" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#2B1B12]">
                Contributors ({contributors.length})
              </h2>
              <p className="text-[11px] text-gray-500">Add or remove authorized sevaks for this channel</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Feedback messages */}
            {contributorError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold">
                {contributorError}
              </div>
            )}
            {contributorSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold">
                {contributorSuccess}
              </div>
            )}

            {/* Add Contributor */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter User ID to add as contributor"
                value={newContributorId}
                onChange={(e) => setNewContributorId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddContributor()}
                className="flex-1 px-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-gray-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
              />
              <button
                type="button"
                onClick={handleAddContributor}
                disabled={addingContributor || !newContributorId.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#DD6B35] hover:bg-[#C85A28] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0"
              >
                {addingContributor ? (
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <FiUserPlus size={14} />
                )}
                Add
              </button>
            </div>

            {/* Contributors list */}
            {loadingContributors ? (
              <div className="py-4 text-center text-xs text-gray-400">Loading contributors...</div>
            ) : contributors.length === 0 ? (
              <div className="py-6 text-center rounded-xl border border-dashed border-[#E8D9C3] bg-[#FBF5EC]/40">
                <FiUsers className="mx-auto text-gray-300 mb-2" size={24} />
                <p className="text-xs text-gray-400">No contributors assigned to this channel yet.</p>
                <p className="text-[11px] text-gray-400 mt-1">Add a contributor using their User ID above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contributors.map((contributor) => (
                  <div
                    key={contributor.id}
                    className="flex items-center gap-3 p-3 bg-[#FBF5EC] border border-[#E8D9C3]/60 rounded-xl transition-colors hover:bg-[#F3E7D3]/60"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#DD6B35] text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {contributor.full_name?.[0] || contributor.username?.[0] || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2B1B12] truncate">
                        {contributor.full_name || contributor.username || 'Sevak'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{contributor.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full shrink-0">
                      Sevak
                    </span>
                    <button
                      onClick={() => handleRemoveContributor(contributor.id)}
                      disabled={removingId === contributor.id}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                      title={`Remove ${contributor.full_name || contributor.username}`}
                    >
                      {removingId === contributor.id ? (
                        <span className="inline-block w-4 h-4 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                      ) : (
                        <FiTrash2 size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Footer Quick Links ── */}
        <div className="flex items-center justify-between pb-6">
          <Link
            to={`/channel/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#8B1E1E] transition-colors"
          >
            <FiArrowLeft size={13} /> Back to Channel
          </Link>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <FaCrown className="text-[#DD6B35]" size={11} />
            <span>Palkhi Pramukh Management Panel</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageChannel;