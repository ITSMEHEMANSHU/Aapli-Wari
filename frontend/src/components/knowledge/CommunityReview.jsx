import React from 'react';
import { FaCheckCircle, FaEdit, FaTimesCircle, FaImage } from 'react-icons/fa';

export const CommunityReview = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-serif font-bold text-[#2B1B12]">Community Review Queue</h1>
        <p className="text-xs text-[#4A392E]/70">18 pending contributions awaiting verification.</p>
      </div>

      <div className="bg-white border border-[#E8D9C3] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-start border-b border-[#F5EAD9] pb-2">
          <div>
            <div className="flex gap-1.5 mb-1">
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Article</span>
              <span className="text-[10px] font-bold uppercase bg-[#FDF8F0] text-[#DD6B35] px-2 py-0.5 rounded border border-[#E8D9C3]">🛕 Temples</span>
              <span className="text-[10px] font-bold uppercase bg-[#FDF8F0] text-[#DD6B35] px-2 py-0.5 rounded border border-[#E8D9C3]">📜 History</span>
            </div>
            <h3 className="text-base font-bold text-[#2B1B12]">History of Chopadaji Ringan</h3>
            <div className="text-[10px] text-[#4A392E]/60">Submitted by: Anand K. • Aug 28, 2026</div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#DD6B35] bg-[#DD6B35]/10 px-2 py-0.5 rounded border border-[#DD6B35]/20">
            <FaImage /> Has Image Attachment
          </span>
        </div>

        <p className="text-xs text-[#4A392E] leading-relaxed bg-[#FDF8F0] p-3 rounded-xl border border-[#E8D9C3]">
          "The Chopadaji Ringan tradition began in the mid-19th century near Wakhari..."
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1">
            <FaCheckCircle /> Approve
          </button>
          <button className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-xl flex items-center gap-1">
            <FaEdit /> Request Changes
          </button>
          <button className="px-3 py-1.5 bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1">
            <FaTimesCircle /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};