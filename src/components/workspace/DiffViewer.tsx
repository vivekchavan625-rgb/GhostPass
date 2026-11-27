import React, { useRef, useState } from 'react';
import { Entity } from '../../engine/types';
import { CATEGORY_CONFIG } from '../ui/Chip';
import { partialMask, fullMask, globalPseudonymManager } from '../../engine/redaction';

interface DiffViewerProps {
  originalText: string;
  sanitizedText: string;
  entities: Entity[];
  mode: 'fullMask' | 'partialMask' | 'pseudonymize';
  onSelectEntity: (entity: Entity) => void;
  selectedEntity: Entity | null;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalText,
  sanitizedText: _sanitizedText,
  entities,
  mode,
  onSelectEntity,
  selectedEntity,
}) => {
  const [syncScroll, setSyncScroll] = useState(true);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isScrollingSync = useRef(false);

  const handleScroll = (source: 'left' | 'right') => {
    if (!syncScroll || isScrollingSync.current) return;
    const sourceEl = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const targetEl = source === 'left' ? rightPaneRef.current : leftPaneRef.current;

    if (!sourceEl || !targetEl) return;

    isScrollingSync.current = true;
    const scrollPercentage =
      sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight || 1);
    targetEl.scrollTop = scrollPercentage * (targetEl.scrollHeight - targetEl.clientHeight);
    setTimeout(() => {
      isScrollingSync.current = false;
    }, 50);
  };

  // Build highlighted nodes for left pane without innerHTML
  const renderLeftOriginal = () => {
    if (entities.length === 0) {
      return <span>{originalText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (let i = 0; i < entities.length; i++) {
      const ent = entities[i];
      // Plain text before entity
      if (ent.start > lastIndex) {
        elements.push(
          <span key={`text_${lastIndex}_${ent.start}`}>
            {originalText.slice(lastIndex, ent.start)}
          </span>
        );
      }

      const conf = CATEGORY_CONFIG[ent.category];
      const isSelected = selectedEntity?.id === ent.id;

      elements.push(
        <mark
          key={`ent_${ent.id}`}
          onClick={() => onSelectEntity(ent)}
          title={`Click to inspect ${conf.label}`}
          className={`cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-xs transition-all ${
            conf.bgClass
          } ${conf.textClass} border ${
            isSelected
              ? 'ring-2 ring-teal-500 border-teal-500 font-bold'
              : conf.borderClass
          }`}
        >
          <span aria-hidden="true" className="text-[10px] opacity-75">
            {conf.icon}
          </span>
          <span className="font-semibold text-[10px] tracking-wide">{conf.label}:</span>
          <span>{originalText.slice(ent.start, ent.end)}</span>
        </mark>
      );

      lastIndex = ent.end;
    }

    // Remaining text
    if (lastIndex < originalText.length) {
      elements.push(
        <span key={`text_end_${lastIndex}`}>
          {originalText.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  // Build highlighted nodes for right pane without innerHTML
  const renderRightSanitized = () => {
    if (entities.length === 0) {
      return <span>{originalText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (let i = 0; i < entities.length; i++) {
      const ent = entities[i];
      if (ent.start > lastIndex) {
        elements.push(
          <span key={`text_r_${lastIndex}_${ent.start}`}>
            {originalText.slice(lastIndex, ent.start)}
          </span>
        );
      }

      let replacement = '';
      if (mode === 'partialMask') {
        replacement = partialMask(ent);
      } else if (mode === 'pseudonymize') {
        replacement = globalPseudonymManager.getPseudonym(ent);
      } else {
        replacement = fullMask(ent);
      }

      const conf = CATEGORY_CONFIG[ent.category];
      const isSelected = selectedEntity?.id === ent.id;

      elements.push(
        <mark
          key={`san_${ent.id}`}
          onClick={() => onSelectEntity(ent)}
          title={`Click to inspect redacted ${conf.label}`}
          className={`cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-xs transition-all ${
            conf.bgClass
          } ${conf.textClass} border ${
            isSelected
              ? 'ring-2 ring-teal-500 border-teal-500 font-bold'
              : conf.borderClass
          }`}
        >
          <span aria-hidden="true" className="text-[10px] opacity-75">
            {conf.icon}
          </span>
          <span>{replacement}</span>
        </mark>
      );

      lastIndex = ent.end;
    }

    if (lastIndex < originalText.length) {
      elements.push(
        <span key={`text_r_end_${lastIndex}`}>
          {originalText.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Side-by-Side Visual Diff
        </span>
        <button
          onClick={() => setSyncScroll((p) => !p)}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-500 flex items-center gap-1"
        >
          <span>{syncScroll ? '🔗' : '⛓️‍💥'}</span>
          <span>Sync Scroll: {syncScroll ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Pane (Original with Highlights) */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400 font-semibold">
              ORIGINAL (Detected Spans)
            </span>
            <span className="text-slate-500">{entities.length} flagged</span>
          </div>
          <div
            ref={leftPaneRef}
            onScroll={() => handleScroll('left')}
            className="p-4 h-80 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 select-text"
          >
            {renderLeftOriginal()}
          </div>
        </div>

        {/* Right Pane (Sanitized with Replacements) */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-sm">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs font-mono">
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              SANITIZED OUTPUT ({mode})
            </span>
            <span className="text-slate-500">clean</span>
          </div>
          <div
            ref={rightPaneRef}
            onScroll={() => handleScroll('right')}
            className="p-4 h-80 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 select-text"
          >
            {renderRightSanitized()}
          </div>
        </div>
      </div>
    </div>
  );
};
