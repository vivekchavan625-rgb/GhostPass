import React from 'react';
import { Card } from '../components/ui/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-xs font-semibold mb-3">
          <span>ARCHITECTURAL INTEGRITY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About GhostPass
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          GhostPass is an in-browser, client-side data sanitizer engineered for developers, security professionals,
          and compliance officers who must sanitize sensitive Personally Identifiable Information (PII) before sharing
          data with LLMs, third-party analytics, or ticket systems.
        </p>
      </div>

      {/* Grid of Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated" className="p-6 space-y-3">
          <div className="text-2xl">🔒</div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Local-First Execution</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            All text parsing, checksum validation, and masking transformations execute strictly within your local browser’s
            V8 JavaScript engine. Document contents are processed locally and never transmitted across the network.
          </p>
        </Card>

        <Card variant="elevated" className="p-6 space-y-3">
          <div className="text-2xl">⚡</div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Deterministic Detection</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Instead of unpredictable black-box heuristics, GhostPass couples bounded linear regex scanning with
            mathematical checksum validation (Luhn for Payment Cards, Verhoeff for Aadhaar, RFC octet rules for IPv4,
            and structure checks for PAN, Phone, and Email).
          </p>
        </Card>

        <Card variant="elevated" className="p-6 space-y-3">
          <div className="text-2xl">🛡️</div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Zero-Trust Boundaries</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Enforced by strict production Content Security Policies (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">connect-src &apos;none&apos;</code>).
            Outbound calls from <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">fetch</code>, <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">XMLHttpRequest</code>, and WebSocket connections are blocked by the browser.
          </p>
        </Card>

        <Card variant="elevated" className="p-6 space-y-3">
          <div className="text-2xl">🧹</div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Volatile Memory Lifecycle</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            All document buffers, entity tables, and pseudonym dictionaries are stored exclusively in volatile JavaScript
            memory. Only the user’s UI theme preference is ever persisted in local storage.
          </p>
        </Card>
      </div>

      {/* Honest Limitations Section */}
      <Card variant="default" className="p-6 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Known Limitations & Boundaries</h2>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Browser Extensions:</strong> Extensions with <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">&lt;all_urls&gt;</code> host permissions can inspect page DOM. For maximum security, use an Incognito / Private window with extensions disabled.
          </li>
          <li>
            <strong>Named Entity Recognition (NER):</strong> Unstructured arbitrary human names and contextual project codenames are not recognized without structured credential formatting.
          </li>
          <li>
            <strong>Host Security:</strong> Hardware keyloggers, screen recording malware, and OS-level dumps exist outside browser tab control.
          </li>
        </ul>
      </Card>
    </div>
  );
};
