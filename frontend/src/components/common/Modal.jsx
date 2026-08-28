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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4 max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;