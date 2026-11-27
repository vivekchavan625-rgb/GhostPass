import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantClass = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
    elevated: 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-lg',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm',
  }[variant];

  return (
    <div className={`rounded-xl p-5 ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
