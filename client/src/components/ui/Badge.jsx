import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    primary: 'bg-primary-100 text-primary-800',
    available: 'bg-emerald-100 text-emerald-800',
    booked: 'bg-indigo-100 text-indigo-800',
    maintenance: 'bg-amber-100 text-amber-800',
    closed: 'bg-rose-100 text-rose-800',
    success: 'bg-success-100 text-success-800',
    error: 'bg-danger-100 text-danger-800',
    warning: 'bg-warning-100 text-warning-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", 
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
