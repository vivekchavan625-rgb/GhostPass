import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { runBenchmark } from '../data/benchmark';
import { CATEGORY_CONFIG } from '../components/ui/Chip';
import { EntityCategory } from '../engine/types';

export const InsightsPage: React.FC = () => {
  const benchmarkReport = useMemo(() => runBenchmark(), []);

  const categories: EntityCategory[] = [
    'email',
    'phone',
    'ipv4',
    'pan',
    'aadhaar',
    'credit-card',
  ];

  // False positive rejections explanation
  const validatorExplanations: Record<string, string> = {
    'credit-card': 'Luhn Mod 10 Checksum: Discards random 13-19 digit strings and order IDs.',
    aadhaar: 'Verhoeff Dihedral Checksum: Eliminates random 12-digit numbers and leading 0/1.',
    pan: 'Income Tax 4th-character entity type check: Rejects invalid corporate/individual structures.',
    ipv4: 'Context lookback heuristics: Distinguishes IPs from version tags like v1.2.3.4 and releases.',
    email: 'RFC-compliant domain structure: Rejects trailing periods, multiple @ signs, and invalid TLDs.',
    'phone-in': 'National 10-digit mobile prefix validator: Rejects repetitive dummy numbers (e.g. 9999999999).',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Detection Insights & Evaluation
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Transparent metrics from GhostPass deterministic evaluation suite across {benchmarkReport.totalItems} labeled test cases (including {benchmarkReport.adversarialItems} adversarial negatives).
        </p>
      </div>

      {/* Notice about confidence heuristics */}
      <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs leading-relaxed">
        <strong>Transparency Note:</strong> Detection confidence scores (High/Medium/Low) are
        algorithmic heuristics based on checksum validation and structural pattern constraints, not
        absolute guarantees. Always verify sensitive documents before distribution.
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Overall Precision</span>
          <span className="text-2xl font-bold font-mono text-teal-500">
            {(benchmarkReport.overall.precision * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400">TP / (TP + FP)</span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Overall Recall</span>
          <span className="text-2xl font-bold font-mono text-teal-500">
            {(benchmarkReport.overall.recall * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400">TP / (TP + FN)</span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">F1-Score</span>
          <span className="text-2xl font-bold font-mono text-teal-500">
            {(benchmarkReport.overall.f1 * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400">Harmonic mean</span>
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Adversarial Negatives</span>
          <span className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-200">
            {benchmarkReport.adversarialItems} / {benchmarkReport.totalItems}
          </span>
          <span className="text-[11px] text-slate-400">Noise & Version tags</span>
        </Card>
      </div>

      {/* Category Breakdown Bars */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Category Performance Breakdown
        </h2>
        <div className="space-y-6">
          {categories.map((cat) => {
            const metric = benchmarkReport.byCategory[cat];
            const conf = CATEGORY_CONFIG[cat];
            const precisionPct = Math.round(metric.precision * 100);
            const recallPct = Math.round(metric.recall * 100);

            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span>{conf.icon}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{conf.label}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-slate-500 dark:text-slate-400">
                    <span>Precision: <strong className="text-slate-800 dark:text-slate-200">{precisionPct}%</strong></span>
                    <span>Recall: <strong className="text-slate-800 dark:text-slate-200">{recallPct}%</strong></span>
                    <span>F1: <strong className="text-teal-500">{Math.round(metric.f1 * 100)}%</strong></span>
                  </div>
                </div>

                {/* SVG/CSS Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${precisionPct}%` }}
                    className="bg-teal-500 h-full transition-all"
                    title={`Precision: ${precisionPct}%`}
                  />
                  <div
                    style={{ width: `${Math.max(0, 100 - precisionPct)}%` }}
                    className="bg-slate-300 dark:bg-slate-700 h-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* False-Positive Handling & Validator Explanation */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          False-Positive Defense & Validation Safeguards
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
          How GhostPass discards noise candidates before redaction. Checksums and syntax filters
          prevent version strings (e.g., v1.2.3.4), order numbers, and tracking codes from being
          mistakenly flagged as PII.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(validatorExplanations).map(([detectorId, desc]) => (
            <div
              key={detectorId}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col gap-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{detectorId}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
