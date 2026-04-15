import React from 'react';

const Card = ({ children, className = '', padding = 'p-4', shadow = 'shadow-sm' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${shadow} ${padding} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
