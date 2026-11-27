import React, { useState } from 'react';
import { SYNTHETIC_SAMPLES, SampleData } from '../data/samples';
import { runBenchmark, BenchmarkReport } from '../data/benchmark';
import { sanitize } from '../engine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EntityCategory } from '../engine/types';

export const EvaluatePage: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<SampleData>(SYNTHETIC_SAMPLES[0]);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Evaluate current scenario across all 3 modes
  const fullModeResult = sanitize(selectedSample.content, { mode: 'fullMask' });
  const partialModeResult = sanitize(selectedSample.content, { mode: 'partialMask' });
  const pseudoModeResult = sanitize(selectedSample.content, { mode: 'pseudonymize', preserveMapping: true });

  const handleRunBenchmark = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const report = runBenchmark();
      setBenchmarkReport(report);
      setIsEvaluating(false);
    }, 100);
  };

  const categories: EntityCategory[] = [
    'email',
    'phone',
    'ipv4',
    'pan',
    'aadhaar',
    'credit-card',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Synthetic Data Banner */}
      <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-medium flex items-center justify-between">
        <span>⚠️ <strong>Evaluation Mode:</strong> All demo data, cards, Aadhaar numbers, and emails shown here are 100% synthetic.</span>
        <span className="font-mono text-[10px] bg-teal-500/20 px-2 py-0.5 rounded">NO REAL PII</span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Scenario Evaluation & Benchmark
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          One-click evaluation of 6 complex synthetic scenarios and automated benchmark metrics.
        </p>
      </div>

      {/* Scenario Buttons */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Choose a Synthetic Scenario:
        </h2>
        <div className="flex flex-wrap gap-2">
          {SYNTHETIC_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => setSelectedSample(sample)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left flex flex-col gap-0.5 ${
                selectedSample.id === sample.id
                  ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <span>{sample.title}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {sample.categoryTags.join(' • ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Multi-Mode Comparison Table */}
      <Card>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {selectedSample.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{selectedSample.description}</p>
          </div>
          <span className="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-teal-500">
            {fullModeResult.stats.totalEntities} entities detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Mode 1: Full Mask */}
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
            <span className="font-bold text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800 pb-1">
              FULL MASK OUTPUT
            </span>
            <div className="h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {fullModeResult.output}
            </div>
          </div>

          {/* Mode 2: Partial Mask */}
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
            <span className="font-bold text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800 pb-1">
              PARTIAL MASK OUTPUT
            </span>
            <div className="h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {partialModeResult.output}
            </div>
          </div>

          {/* Mode 3: Pseudonymize */}
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
            <span className="font-bold text-teal-600 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800 pb-1">
              PSEUDONYMIZE OUTPUT
            </span>
            <div className="h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {pseudoModeResult.output}
            </div>
          </div>
        </div>
      </Card>

      {/* Benchmark Runner Section */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Detection Engine Benchmark Suite
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated testing across 44 labeled synthetic items including 21 adversarial negatives.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleRunBenchmark} disabled={isEvaluating}>
            {isEvaluating ? 'Evaluating...' : '▶ Run Detection Benchmark'}
          </Button>
        </div>

        {benchmarkReport ? (
          <div className="space-y-6">
            {/* KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="block text-xs text-slate-500">PRECISION</span>
                <span className="text-xl font-bold font-mono text-teal-500">
                  {(benchmarkReport.overall.precision * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="block text-xs text-slate-500">RECALL</span>
                <span className="text-xl font-bold font-mono text-teal-500">
                  {(benchmarkReport.overall.recall * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="block text-xs text-slate-500">F1 SCORE</span>
                <span className="text-xl font-bold font-mono text-teal-500">
                  {(benchmarkReport.overall.f1 * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="block text-xs text-slate-500">ADVERSARIAL TESTS</span>
                <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-200">
                  {benchmarkReport.adversarialItems} items
                </span>
              </div>
            </div>

            {/* Category Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">CATEGORY</th>
                    <th className="px-3 py-2">TP</th>
                    <th className="px-3 py-2">FP</th>
                    <th className="px-3 py-2">FN</th>
                    <th className="px-3 py-2">PRECISION</th>
                    <th className="px-3 py-2">RECALL</th>
                    <th className="px-3 py-2">F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.map((cat) => {
                    const m = benchmarkReport.byCategory[cat];
                    return (
                      <tr key={cat}>
                        <td className="px-3 py-1.5 font-bold">
                          <Chip category={cat} size="sm" />
                        </td>
                        <td className="px-3 py-1.5 text-emerald-500">{m.tp}</td>
                        <td className="px-3 py-1.5 text-amber-500">{m.fp}</td>
                        <td className="px-3 py-1.5 text-rose-500">{m.fn}</td>
                        <td className="px-3 py-1.5">{(m.precision * 100).toFixed(1)}%</td>
                        <td className="px-3 py-1.5">{(m.recall * 100).toFixed(1)}%</td>
                        <td className="px-3 py-1.5 font-bold text-teal-500">{(m.f1 * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Note: This benchmark runs against a fixed synthetic labeled test set and serves as a regression baseline, not an absolute real-world guarantee.
            </p>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Click &quot;Run Detection Benchmark&quot; to execute all 44 test evaluations live in your browser.
          </div>
        )}
      </Card>
    </div>
  );
};
