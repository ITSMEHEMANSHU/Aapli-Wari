import React from 'react';

export const SuggestChangeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3">
        <h3 className="text-base font-serif font-bold text-[#2B1B12]">Suggest a Change</h3>
        <div>
          <label className="block text-[10px] font-bold text-[#2B1B12] uppercase mb-1">Reason</label>
          <select className="w-full text-xs p-2 bg-[#FBF5EC] border border-[#E8D9C3] rounded-xl">
            <option>Incorrect information</option>
            <option>Missing information</option>
            <option>Incorrect source</option>
            <option>Typographical error</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#2B1B12] uppercase mb-1">Details</label>
          <textarea rows="3" placeholder="Explain suggested correction..." className="w-full text-xs p-2 bg-[#FBF5EC] border border-[#E8D9C3] rounded-xl"></textarea>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-bold text-[#4A392E]">Cancel</button>
          <button onClick={() => { onClose(); alert('Suggestion submitted!'); }} className="px-3 py-1.5 bg-[#DD6B35] text-white text-xs font-bold rounded-xl">Submit</button>
        </div>
      </div>
    </div>
  );
};