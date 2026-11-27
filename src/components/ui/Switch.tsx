import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, id }) => {
  const switchId = id || `switch-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <label htmlFor={switchId} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="relative">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span
          className={`block w-9 h-5 rounded-full transition-colors ${
            checked ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        />
        <span
          className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
};
