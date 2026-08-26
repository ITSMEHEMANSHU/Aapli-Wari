import React from 'react';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button'
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-[#8B1E1E] text-white hover:bg-red-700 focus:ring-2 focus:ring-red-300',
    secondary: 'bg-[#D4A843] text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300',
    outline: 'border-2 border-[#8B1E1E] text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-white focus:ring-2 focus:ring-red-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${
        disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;