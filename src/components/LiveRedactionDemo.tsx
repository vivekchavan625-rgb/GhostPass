import React, { useState } from 'react';
import { sanitize } from '../engine';
import { RedactionMode } from '../engine/types';
import { Button } from './ui/Button';

const SAMPLE_DEMO_TEXT =
  'Contact engineer Priya Sharma at priya.sharma@example.com or +91 98201 12345 from server IP 192.168.1.105.';

export const LiveRedactionDemo: React.FC = () => {
  const [mode, setMode] = useState<RedactionMode>('fullMask');
  const [isRedacted, setIsRedacted] = useState(false);

  // Run the REAL engine
  const sanitizeResult = sanitize(SAMPLE_DEMO_TEXT, {
    mode,
  });

  const handleCycleMode = () => {
    if (!isRedacted) {
      setIsRedacted(true);
    } else {
      if (mode === 'fullMask') setMode('partialMask');
      else if (mode === 'partialMask') setMode('pseudonymize');
      else {
        setMode('fullMask');
        setIsRedacted(false);
      }
    }
  };

  const displayText = isRedacted ? sanitizeResult.output : SAMPLE_DEMO_TEXT;

  return (
    <div className="rounded-2xl p-6 sm:p-8 bg-[#0d1222] border border-violet-500/30 shadow-[0_0_40px_rgba(124,92,255,0.15)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Interactive Engine Demo
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            See GhostPass In Action
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated live through the deterministic TypeScript engine in your browser tab.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleCycleMode}
            className="!bg-gradient-to-r from-violet-600 to-cyan-500 !text-white font-semibold shadow-md hover:scale-105 transition-all"
          >
            {!isRedacted
              ? '⚡ Redact Sample'
              : `Mode: ${
                  mode === 'fullMask'
                    ? 'Full Mask ➔'
                    : mode === 'partialMask'
                    ? 'Partial Mask ➔'
                    : 'Pseudonymize (Reset ↺)'
                }`}
          </Button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="rounded-xl bg-[#070a14] p-4 sm:p-5 font-mono text-sm leading-relaxed border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-800/80 pb-2">
          <span>SAMPLE_INPUT.LOG</span>
          <span className="text-[#b6ff3b] font-semibold">
            {isRedacted ? `${sanitizeResult.stats.totalEntities} PII Sanitized` : 'Unredacted Original'}
          </span>
        </div>

        <div className="text-slate-200 transition-all duration-300 min-h-[48px]">
          {displayText}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <span>Entities: {sanitizeResult.stats.totalEntities}</span>
          <span>•</span>
          <span>Time: &lt; 1ms</span>
        </div>
        <span className="text-cyan-400">
          Mode: {mode === 'fullMask' ? 'Full Redaction' : mode === 'partialMask' ? 'Partial Masking' : 'Pseudonymization'}
        </span>
      </div>
    </div>
  );
};
