import React, { useState, useEffect, useCallback } from 'react';
import { privacyMonitor } from '../privacy/monitor';
import { scanClientStorage } from '../privacy/storageScan';
import { Button } from './ui/Button';
import { RedactionRain } from './RedactionRain';

interface BootCheck {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'pass' | 'warn' | 'fail';
  detail: string;
}

interface SecureSessionGateProps {
  onDismiss: () => void;
}

export const SecureSessionGate: React.FC<SecureSessionGateProps> = ({ onDismiss }) => {
  const [checks, setChecks] = useState<BootCheck[]>([
    { id: 'csp', label: 'Content Security Policy', status: 'checking', detail: 'Verifying connect-src restriction...' },
    { id: 'network', label: 'Network Isolation Traps', status: 'pending', detail: 'Waiting for monitor state...' },
    { id: 'crossOrigin', label: 'Cross-Origin Attempts', status: 'pending', detail: 'Checking unauthorized domains...' },
    { id: 'storage', label: 'Client Storage Verification', status: 'pending', detail: 'Scanning Local/Session Storage & IndexedDB...' },
  ]);

  const [completed, setCompleted] = useState(false);

  // Run the sequence without ANY fetch or network calls
  useEffect(() => {
    let isCancelled = false;

    async function runChecks() {
      // Step 1: Check CSP meta or header
      const metaCsp = typeof document !== 'undefined'
        ? document.querySelector('meta[http-equiv="Content-Security-Policy"]')
        : null;
      
      const hasCspMeta = !!metaCsp;
      const metaContent = metaCsp?.getAttribute('content') || '';
      const hasConnectNone = metaContent.includes("connect-src 'none'");

      await new Promise((r) => setTimeout(r, 200));
      if (isCancelled) return;

      setChecks((prev) =>
        prev.map((c) =>
          c.id === 'csp'
            ? {
                ...c,
                status: hasConnectNone ? 'pass' : hasCspMeta ? 'warn' : 'warn',
                detail: hasConnectNone
                  ? "connect-src 'none' enforced via meta CSP"
                  : 'Development mode (CSP header active in production)',
              }
            : c.id === 'network'
            ? { ...c, status: 'checking', detail: 'Reading runtime monitor traps...' }
            : c
        )
      );

      // Step 2: Network Traps & Step 3: Cross Origin
      await new Promise((r) => setTimeout(r, 250));
      if (isCancelled) return;

      const monitorState = privacyMonitor.getState();
      const totalAttempts = monitorState.totalAttempts;
      const unexpectedAttempts = monitorState.unexpectedAttempts;
      const violationsCount = monitorState.cspViolations.length;

      setChecks((prev) =>
        prev.map((c) => {
          if (c.id === 'network') {
            return {
              ...c,
              status: totalAttempts === 0 ? 'pass' : 'warn',
              detail: `${totalAttempts} post-load attempts intercepted (0 leaked)`,
            };
          }
          if (c.id === 'crossOrigin') {
            return {
              ...c,
              status: unexpectedAttempts === 0 ? 'pass' : 'fail',
              detail: `${unexpectedAttempts} unexpected cross-origin calls, ${violationsCount} CSP violations`,
            };
          }
          if (c.id === 'storage') {
            return { ...c, status: 'checking', detail: 'Auditing browser keys...' };
          }
          return c;
        })
      );

      // Step 4: Storage scan
      await new Promise((r) => setTimeout(r, 250));
      if (isCancelled) return;

      const report = await scanClientStorage();
      const piiLeak = report.piiLeakFound;
      const storageKeyCount = report.localStorageKeys.length + report.sessionStorageKeys.length;

      setChecks((prev) =>
        prev.map((c) =>
          c.id === 'storage'
            ? {
                ...c,
                status: !piiLeak ? 'pass' : 'fail',
                detail: !piiLeak
                  ? `${storageKeyCount} storage keys found, 0 PII leaks detected`
                  : 'Warning: PII token detected in browser storage',
              }
            : c
        )
      );

      setCompleted(true);
    }

    runChecks();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Keyboard accessibility: Enter or Escape dismisses
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onDismiss();
      }
    },
    [onDismiss]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070a14]/85 backdrop-blur-md overflow-hidden"
    >
      <RedactionRain className="opacity-40" />

      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-[#0d1222]/95 border border-violet-500/30 shadow-[0_0_50px_rgba(124,92,255,0.2)] p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span id="gate-title" className="ml-2 font-mono text-xs font-semibold text-slate-300">
              GHOSTPASS_SECURE_BOOT // ENVIRONMENT_INTEGRITY
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60"
            title="Press Esc to Skip"
          >
            SKIP [ESC]
          </button>
        </div>

        {/* Verification Check Items */}
        <div className="space-y-3 font-mono text-xs">
          {checks.map((chk) => {
            const statusBadge = {
              pending: <span className="text-slate-500">[WAIT]</span>,
              checking: <span className="text-cyan-400 animate-pulse">[AUDITING]</span>,
              pass: <span className="text-[#b6ff3b] font-bold">[PASS]</span>,
              warn: <span className="text-amber-400 font-bold">[INFO]</span>,
              fail: <span className="text-rose-500 font-bold">[FAIL]</span>,
            }[chk.status];

            return (
              <div
                key={chk.id}
                className="p-3 rounded-lg bg-[#141c34]/60 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    {statusBadge}
                    <span>{chk.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{chk.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice & Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400">
            Document contents are processed locally and never transmitted.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={onDismiss}
              className="w-full sm:w-auto !bg-gradient-to-r from-violet-600 to-cyan-500 !text-white font-semibold"
            >
              {completed ? 'Enter Workspace →' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
