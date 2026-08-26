import React from 'react';

export const Card = ({ 
  children, 
  className = '',
  onClick,
  hover = false
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${hover ? 'hover:shadow-lg transition' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;