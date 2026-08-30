import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // adjust path if needed
import { EditContentModal } from './EditContentModal'; // new component (see below)

export const MyContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContentId, setEditingContentId] = useState(null); // for edit modal

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const data = await api.getMyContributions();
      setContributions(data || []);
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
      setError('Could not load your contributions.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic stats from real data
  const totalCount = contributions.length;
  const publishedCount = contributions.filter(c => c.status === 'published' || c.status === 'approved').length;
  const reviewCount = contributions.filter(c => c.status === 'pending' || c.status === 'under_review').length;
  const changesCount = contributions.filter(c => c.status === 'changes_requested').length;
  const draftCount = contributions.filter(c => c.status === 'draft').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
      case 'approved':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">🟢 Published</span>;
      case 'pending':
      case 'under_review':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">🟡 Under Review</span>;
      case 'changes_requested':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full font-bold text-[10px]">🟠 Changes Requested</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-bold text-[10px]">⚪ Draft</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-xs text-[#4A392E]">Loading your contributions...</div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-serif font-bold text-[#2B1B12]">My Contributions</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white border border-[#E8D9C3] p-3 rounded-xl text-center shadow-sm">
          <span className="text-lg font-bold text-[#2B1B12]">{totalCount}</span>
          <span className="block text-[10px] text-[#4A392E]/70 font-semibold uppercase">Total</span>
        </div>
        <div className="bg-white border border-emerald-200 p-3 rounded-xl text-center shadow-sm">
          <span className="text-lg font-bold text-emerald-700">{publishedCount}</span>
          <span className="block text-[10px] text-emerald-700 font-semibold uppercase">🟢 Published</span>
        </div>
        <div className="bg-white border border-amber-200 p-3 rounded-xl text-center shadow-sm">
          <span className="text-lg font-bold text-amber-700">{reviewCount}</span>
          <span className="block text-[10px] text-amber-700 font-semibold uppercase">🟡 Under Review</span>
        </div>
        <div className="bg-white border border-orange-200 p-3 rounded-xl text-center shadow-sm">
          <span className="text-lg font-bold text-orange-700">{changesCount}</span>
          <span className="block text-[10px] text-orange-700 font-semibold uppercase">🟠 Changes</span>
        </div>
        <div className="bg-white border border-[#E8D9C3] p-3 rounded-xl text-center shadow-sm">
          <span className="text-lg font-bold text-gray-500">{draftCount}</span>
          <span className="block text-[10px] text-gray-500 font-semibold uppercase">⚪ Drafts</span>
        </div>
      </div>

      {/* Contributions List */}
      <div className="bg-white border border-[#E8D9C3] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-3 border-b border-[#F5EAD9] text-xs font-bold text-[#4A392E] uppercase flex justify-between items-center">
          <span>Submitted Items</span>
          <button onClick={fetchContributions} className="text-[#DD6B35] hover:underline text-[10px] font-normal">Refresh</button>
        </div>

        {error && <div className="p-4 text-xs text-red-600 text-center">{error}</div>}

        {!error && contributions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#4A392E]/75">
            You haven't contributed any content yet. Head over to the Contribute hub to share your first article!
          </div>
        ) : (
          <div className="divide-y divide-[#F5EAD9] text-xs">
            {contributions.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between hover:bg-[#FBF5EC]/30 transition">
                <div>
                  <div className="font-bold text-[#2B1B12]">{item.title}</div>
                  {item.vernacular_title && (
                    <div className="text-[11px] text-[#4A392E]/80 font-medium">{item.vernacular_title}</div>
                  )}
                  <div className="text-[10px] text-[#4A392E]/60 mt-0.5">
                    {item.content_type?.toUpperCase()} • Submitted {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  {item.verification_notes && (
                    <div className="text-orange-800 text-[10px] font-medium mt-1 bg-orange-50 p-1 rounded">
                      Feedback: {item.verification_notes}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  
                  {/* 🔹 EDIT BUTTON – opens modal */}
                  <button
                    onClick={() => setEditingContentId(item.id)}
                    className="px-2.5 py-1 bg-[#DD6B35] hover:bg-[#C85A28] text-white rounded-lg font-bold text-[10px] transition"
                  >
                    Edit
                  </button>

                  {item.status === 'changes_requested' && (
                    <button className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-[10px] transition">
                      Resubmit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 EDIT MODAL */}
      <EditContentModal
        isOpen={!!editingContentId}
        onClose={() => setEditingContentId(null)}
        contentId={editingContentId}
        onSaved={() => {
          fetchContributions(); // refresh list after successful edit
        }}
      />
    </div>
  );
};