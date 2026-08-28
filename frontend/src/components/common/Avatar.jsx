import React from 'react';

export const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  fallback
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className={textSize[size]}>{fallback || 'U'}</span>
      )}
    </div>
  );
};

export default Avatar;