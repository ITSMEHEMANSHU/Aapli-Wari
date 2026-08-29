import React from 'react';
import { FiX } from 'react-icons/fi';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md transition-all p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl border border-[#E8D9C3] w-full ${sizeClasses[size]} mx-auto max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#F0E6D8] bg-[#FDFBF7]">
          <h3 className="text-base sm:text-lg font-black text-[#2B1B12]">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[#FBF5EC] text-gray-400 hover:text-[#8B1E1E] rounded-xl transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;