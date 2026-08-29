import React from 'react';

export const Card = ({ 
  children, 
  className = '',
  onClick,
  hover = false
}) => {
  const isInteractive = Boolean(onClick) || hover;

  return (
    <div 
      className={`
        bg-white 
        rounded-2xl 
        border 
        border-[#E8D9C3] 
        p-5 
        shadow-2xs 
        transition-all 
        duration-200 
        ${isInteractive ? 'hover:shadow-md hover:border-[#DD6B35]/40 cursor-pointer' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;