import React from 'react';
import { FiX } from 'react-icons/fi';

export const Alert = ({ 
  children, 
  variant = 'info',
  onClose,
  className = ''
}) => {
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className={`border rounded p-4 mb-4 relative ${variantClasses[variant]} ${className}`}>
      {children}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 hover:opacity-70"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default Alert;