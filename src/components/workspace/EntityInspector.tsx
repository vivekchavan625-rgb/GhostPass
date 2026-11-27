import React, { useState, useEffect } from 'react';
import { Entity } from '../../engine/types';
import { CATEGORY_CONFIG } from '../ui/Chip';
import { Button } from '../ui/Button';

interface EntityInspectorProps {
  entity: Entity | null;
  onClose: () => void;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({ entity, onClose }) => {
  const [revealed, setRevealed] = useState(false);

  // Auto-hide raw value after 5 seconds
  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => {
      setRevealed(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [revealed]);

  // Reset revealed state on new entity selection
  useEffect(() => {
    setRevealed(false);
  }, [entity]);

  if (!entity) return null;

  const conf = CATEGORY_CONFIG[entity.category];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{conf.icon}</span>
          <span className="font-bold text-sm tracking-wide">{conf.label} DETECTED</span>
          <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono">
            {entity.detectorId}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close entity inspector"
          className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Confidence: </span>
          <span className="font-semibold uppercase text-teal-500">{entity.confidence}</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Validation: </span>
          <span className="font-semibold text-emerald-500">
            {entity.validated ? 'Passed Checksum/Rule' : 'Unvalidated'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Span Positions: </span>
          <span className="font-mono text-slate-600 dark:text-slate-300">
            [{entity.start} - {entity.end}] ({entity.length} chars)
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Memory Value: </span>
          <span className="font-mono">
            {revealed ? (
              <span className="text-rose-500 font-bold bg-rose-500/10 px-1 rounded">
                {entity.value} (Auto-hiding in 5s)
              </span>
            ) : (
              <span className="text-slate-400">[Hidden for Privacy]</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        {!revealed ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevealed(true)}
          >
            👁️ Reveal Value (5s)
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRevealed(false)}
          >
            Hide Again
          </Button>
        )}
      </div>
    </div>
  );
};
