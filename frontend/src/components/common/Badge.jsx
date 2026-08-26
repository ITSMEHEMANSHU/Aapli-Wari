import React from 'react';

export const Badge = ({ 
  children, 
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gray-200 text-gray-700',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;