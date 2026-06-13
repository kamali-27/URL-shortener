import React from 'react';

const Spinner = ({ size = 'md', color = 'indigo' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    indigo: 'border-t-indigo-500 border-indigo-100',
    purple: 'border-t-purple-500 border-purple-100',
    white: 'border-t-white border-white/20'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.indigo} border-solid`}
        style={{ borderStyle: 'solid', borderRadius: '50%' }}
      ></div>
    </div>
  );
};

export default Spinner;
