import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { VaultHero3D } from '../components/VaultHero3D';
import { SecureSessionGate } from '../components/SecureSessionGate';
import { RedactionRain } from '../components/RedactionRain';
import { TiltCard } from '../components/TiltCard';
import { LiveRedactionDemo } from '../components/LiveRedactionDemo';

// In-memory flag across page views in this session (NOT persisted in localStorage)
let hasShownBootGateThisSession = false;

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const [showGate, setShowGate] = useState(!hasShownBootGateThisSession);

  const handleDismissGate = () => {
    hasShownBootGateThisSession = true;
    setShowGate(false);
  };

  return (
    <div className="relative space-y-20 pb-20 overflow-hidden">
      {/* Background Redaction Rain Canvas (low opacity, low CPU, paused when tab hidden) */}
      <RedactionRain className="opacity-25" />

      {/* Secure Session Boot Gate (shown once per session in memory) */}
      {showGate && <SecureSessionGate onDismiss={handleDismissGate} />}

      {/* Hero Section */}
      <section className="relative z-10 pt-8 sm:pt-16 max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-400 text-xs font-semibold">
            <span>🛡️</span> Pure Client-Side Privacy
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Your data stays <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">yours.</span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            Sanitize, redact, and pseudonymize sensitive PII directly in your browser. User document
            contents are processed locally and never transmitted across the network.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('workspace')}
              className="!bg-gradient-to-r from-violet-600 to-cyan-500 !text-white font-semibold shadow-lg hover:opacity-95"
            >
              Start Sanitizing →
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('privacy')}
              className="border border-slate-300 dark:border-slate-700/80"
            >
              Explore Security
            </Button>
          </div>
        </div>

        {/* 3D CSS Interactive Vault Hero */}
        <div className="flex items-center justify-center">
          <VaultHero3D />
        </div>
      </section>

      {/* Interactive Live Redaction Demo */}
      <section className="relative z-10 max-w-4xl mx-auto px-4">
        <LiveRedactionDemo />
      </section>

      {/* How it Works with 3D Tilt Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">
          How It Works in 3 Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TiltCard className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Input Document</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste logs, tickets, code, or upload files (.txt, .csv, .json, .log, .md up to 2 MB).
              Files are read directly into browser memory.
            </p>
          </TiltCard>

          <TiltCard className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Deterministic Detection</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Rigorous checksum algorithms (Luhn for cards, Verhoeff for Aadhaar) and regexes isolate
              PII without false-positive version tags.
            </p>
          </TiltCard>

          <TiltCard className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b6ff3b]/10 text-[#94e815] border border-[#b6ff3b]/20 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Safe Redaction & Export</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Apply Full Mask, Partial Mask, or Pseudonymization. Copy sanitized output or download
              clean text/CSV safely.
            </p>
          </TiltCard>
        </div>
      </section>

      {/* Detection Categories */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Supported Sensitive Categories
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Chip category="credit-card" />
          <Chip category="aadhaar" />
          <Chip category="pan" />
          <Chip category="email" />
          <Chip category="phone" />
          <Chip category="ipv4" />
        </div>
      </section>

      {/* Trust Architecture Summary with TiltCard */}
      <section className="relative z-10 max-w-4xl mx-auto px-4">
        <TiltCard className="border-violet-500/30">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span>🛡️</span> Zero-Trust Client-Side Architecture
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            GhostPass is designed for security auditors and developers. No backend server exists. No
            cookies or third-party trackers are installed. User document contents are processed
            locally in volatile memory and are discarded upon page reload or clicking &quot;Clear Memory&quot;.
          </p>
        </TiltCard>
      </section>
    </div>
  );
};
