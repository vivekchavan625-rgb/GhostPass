import { describe, it, expect } from 'vitest';
import { runBenchmark, BENCHMARK_ITEMS } from '../../src/data/benchmark';
import { SYNTHETIC_SAMPLES } from '../../src/data/samples';
import { sanitize } from '../../src/engine';

describe('Benchmark & Synthetic Samples Suite', () => {
  it('includes 6 complete synthetic samples with expected metadata', () => {
    expect(SYNTHETIC_SAMPLES.length).toBe(6);
    const sampleIds = SYNTHETIC_SAMPLES.map((s) => s.id);
    expect(sampleIds).toEqual([
      'support-ticket',
      'resume',
      'auth-log',
      'csv-customer-export',
      'healthcare-notes',
      'mixed-stress-test'
    ]);

    for (const sample of SYNTHETIC_SAMPLES) {
      expect(sample.title).toBeTruthy();
      expect(sample.description).toBeTruthy();
      expect(sample.content.length).toBeGreaterThan(100);

      // Verify each sample sanitizes cleanly without runtime error
      const result = sanitize(sample.content);
      expect(result.stats.totalEntities).toBeGreaterThan(0);
      expect(result.output.length).toBeGreaterThan(0);
    }
  });

  it('runs benchmark evaluation on >= 40 labeled items', () => {
    expect(BENCHMARK_ITEMS.length).toBeGreaterThanOrEqual(40);
    const report = runBenchmark();
    console.log('BENCHMARK REPORT:', JSON.stringify(report, null, 2));

    // Verify benchmark report structure and honesty
    expect(report.totalItems).toBe(BENCHMARK_ITEMS.length);
    expect(report.adversarialItems).toBeGreaterThan(10);

    expect(report.overall.precision).toBeGreaterThanOrEqual(0.8);
    expect(report.overall.recall).toBeGreaterThanOrEqual(0.8);
    expect(report.overall.f1).toBeGreaterThanOrEqual(0.8);

    // Verify all categories evaluated
    for (const cat of ['email', 'phone', 'ipv4', 'pan', 'aadhaar', 'credit-card'] as const) {
      const metric = report.byCategory[cat];
      expect(metric).toBeDefined();
      expect(metric.tp + metric.fn).toBeGreaterThan(0);
      expect(metric.precision).toBeGreaterThanOrEqual(0.7);
      expect(metric.recall).toBeGreaterThanOrEqual(0.7);
    }
  });
});
