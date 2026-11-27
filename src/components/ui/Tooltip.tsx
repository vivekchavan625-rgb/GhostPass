import React from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <span className="relative group inline-flex">
      {children}
      <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-slate-950 text-white text-[11px] font-medium rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
        {content}
      </span>
    </span>
  );
};
