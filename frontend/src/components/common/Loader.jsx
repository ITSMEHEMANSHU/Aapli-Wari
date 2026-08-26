import React from 'react';

export const Loader = ({ size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const spinner = (
    <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin`} />
  );

  if (fullPage) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      {spinner}
    </div>
  );
};

export default Loader;