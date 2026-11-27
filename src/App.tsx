import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">GhostPass</h1>
      <p className="text-slate-400 mb-6">
        Browser-only Zero-Trust PII Sanitizer Engine (Sprint 1 Core Engine Active)
      </p>
      <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono text-emerald-400">
        Engine ready: Aadhaar, Credit Card, PAN, Email, Phone, IPv4.
      </div>
    </div>
  );
};
