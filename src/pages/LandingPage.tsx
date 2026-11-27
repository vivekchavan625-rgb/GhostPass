import React from 'react';
import { useRouter } from '../context/RouterContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-semibold mb-6">
          <span>🔒</span> Pure Client-Side Privacy
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Your data stays yours.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Sanitize, redact, and pseudonymize sensitive PII directly in your browser. User document
          contents are processed locally and never transmitted across the network.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => navigate('workspace')}>
            Start Sanitizing →
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('privacy')}>
            Explore Security
          </Button>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">
          How It Works in 3 Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Input Document</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Paste logs, tickets, code, or upload files (.txt, .csv, .json, .log, .md up to 2 MB).
              Files are read directly into browser memory.
            </p>
          </Card>
          <Card className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Deterministic Detection</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Rigorous checksum algorithms (Luhn for cards, Verhoeff for Aadhaar) and regexes isolate
              PII without false-positive version tags.
            </p>
          </Card>
          <Card className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Safe Redaction & Export</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Apply Full Mask, Partial Mask, or Pseudonymization. Copy sanitized output or download
              clean text/CSV safely.
            </p>
          </Card>
        </div>
      </section>

      {/* Detection Categories */}
      <section className="max-w-4xl mx-auto px-4 text-center">
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

      {/* Trust Architecture Summary */}
      <section className="max-w-4xl mx-auto px-4">
        <Card variant="elevated" className="border-teal-500/30">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span>🛡️</span> Zero-Trust Client-Side Architecture
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            GhostPass is designed for security auditors and developers. No backend server exists. No
            cookies or third-party trackers are installed. User document contents are processed
            locally in volatile memory and are discarded upon page reload or clicking &quot;Clear Memory&quot;.
          </p>
        </Card>
      </section>
    </div>
  );
};
