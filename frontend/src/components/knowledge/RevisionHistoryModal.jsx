import React from 'react';

export const RevisionHistoryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4">
        <h3 className="text-base font-serif font-bold text-[#2B1B12]">Revision History</h3>
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#FDF8F0] border border-[#E8D9C3] rounded-xl">
            <div className="font-bold text-[#2B1B12]">Version 4 — Aug 2026</div>
            <div className="text-[#4A392E]/60">Updated sources by Rameshwar S.</div>
          </div>
          <div className="p-3 border border-[#E8D9C3] rounded-xl">
            <div className="font-bold text-[#2B1B12]">Version 3 — Jul 2026</div>
            <div className="text-[#4A392E]/60">Added Abhanga references by Dnyaneshwar T.</div>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-[#2B1B12] text-white text-xs font-bold rounded-xl">Close</button>
        </div>
      </div>
    </div>
  );
};