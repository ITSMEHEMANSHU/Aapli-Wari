import React from 'react';

export const MyContributions = () => {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-serif font-bold text-[#2B1B12]">My Contributions</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white border border-[#E8D9C3] p-3 rounded-xl text-center">
          <span className="text-lg font-bold text-[#2B1B12]">4</span>
          <span className="block text-[10px] text-[#4A392E]/70 font-semibold uppercase">Total</span>
        </div>
        <div className="bg-white border border-emerald-200 p-3 rounded-xl text-center">
          <span className="text-lg font-bold text-emerald-700">2</span>
          <span className="block text-[10px] text-emerald-700 font-semibold uppercase">🟢 Published</span>
        </div>
        <div className="bg-white border border-amber-200 p-3 rounded-xl text-center">
          <span className="text-lg font-bold text-amber-700">1</span>
          <span className="block text-[10px] text-amber-700 font-semibold uppercase">🟡 Under Review</span>
        </div>
        <div className="bg-white border border-orange-200 p-3 rounded-xl text-center">
          <span className="text-lg font-bold text-orange-700">1</span>
          <span className="block text-[10px] text-orange-700 font-semibold uppercase">🟠 Changes Requested</span>
        </div>
        <div className="bg-white border border-[#E8D9C3] p-3 rounded-xl text-center">
          <span className="text-lg font-bold text-gray-500">0</span>
          <span className="block text-[10px] text-gray-500 font-semibold uppercase">⚪ Drafts</span>
        </div>
      </div>

      <div className="bg-white border border-[#E8D9C3] rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-[#F5EAD9] text-xs font-bold text-[#4A392E] uppercase">Submitted Items</div>
        <div className="divide-y divide-[#F5EAD9] text-xs">
          <div className="p-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-[#2B1B12]">Sant Tukaram Paduka Sohla</div>
              <div className="text-[10px] text-[#4A392E]/60">Article • Submitted Aug 12, 2026</div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">🟢 Published</span>
          </div>
          <div className="p-3 flex items-center justify-between bg-orange-50/50">
            <div>
              <div className="font-bold text-[#2B1B12]">Alharwadi Ringan Photos (1982)</div>
              <div className="text-[10px] text-[#4A392E]/60">Media • Submitted Aug 20, 2026</div>
              <div className="text-orange-800 text-[10px] font-medium mt-1">Feedback: Provide photo credit.</div>
            </div>
            <button className="px-2.5 py-1 bg-orange-600 text-white rounded-lg font-bold text-[10px]">Edit & Resubmit</button>
          </div>
        </div>
      </div>
    </div>
  );
};