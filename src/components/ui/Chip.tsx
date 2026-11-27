import React from 'react';
import { EntityCategory } from '../../engine/types';

export const CATEGORY_CONFIG: Record<
  EntityCategory,
  { label: string; icon: string; bgClass: string; textClass: string; borderClass: string }
> = {
  email: {
    label: 'EMAIL',
    icon: '✉',
    bgClass: 'bg-indigo-500/10 dark:bg-indigo-900/30',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    borderClass: 'border-indigo-400/30',
  },
  phone: {
    label: 'PHONE',
    icon: '☎',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-400/30',
  },
  ipv4: {
    label: 'IP',
    icon: '🌐',
    bgClass: 'bg-amber-500/10 dark:bg-amber-900/30',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-400/30',
  },
  pan: {
    label: 'PAN',
    icon: '🪪',
    bgClass: 'bg-purple-500/10 dark:bg-purple-900/30',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-400/30',
  },
  aadhaar: {
    label: 'AADHAAR',
    icon: '🆔',
    bgClass: 'bg-blue-500/10 dark:bg-blue-900/30',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-400/30',
  },
  'credit-card': {
    label: 'CARD',
    icon: '💳',
    bgClass: 'bg-rose-500/10 dark:bg-rose-900/30',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-400/30',
  },
};

export interface ChipProps {
  category: EntityCategory;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  category,
  count,
  active = true,
  onClick,
  size = 'md',
}) => {
  const conf = CATEGORY_CONFIG[category] ?? {
    label: category.toUpperCase(),
    icon: '🏷',
    bgClass: 'bg-slate-500/10 dark:bg-slate-900/30',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-400/30',
  };

  const Component = onClick ? 'button' : 'span';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${
        sizeClass
      } ${conf.bgClass} ${conf.textClass} ${conf.borderClass} ${
        !active ? 'opacity-40 grayscale line-through' : ''
      } ${onClick ? 'hover:scale-105 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500' : ''}`}
    >
      <span aria-hidden="true">{conf.icon}</span>
      <span>{conf.label}</span>
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900/10 dark:bg-white/10 font-mono text-[10px]">
          {count}
        </span>
      )}
    </Component>
  );
};
