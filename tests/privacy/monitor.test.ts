import { describe, it, expect, beforeEach } from 'vitest';
import { privacyMonitor } from '../../src/privacy/monitor';

describe('Privacy Monitor Runtime Suite', () => {
  beforeEach(() => {
    privacyMonitor.resetStats();
  });

  it('records network invocations and classifies cross-origin as unexpected', () => {
    privacyMonitor.recordAttempt('fetch', 'https://api.external-tracker.com/v1/telemetry?secret=123');
    privacyMonitor.recordAttempt('xhr', 'https://malicious-telemetry.io/collect');
    privacyMonitor.recordAttempt('beacon', 'https://analytics.thirdparty.com/log');

    const state = privacyMonitor.getState();
    expect(state.totalAttempts).toBe(3);
    expect(state.unexpectedAttempts).toBe(3);
    expect(state.attemptsByApi['fetch']).toBe(1);
    expect(state.attemptsByApi['xhr']).toBe(1);
    expect(state.attemptsByApi['beacon']).toBe(1);

    // Strict Privacy Assertion: Invariant verification that ONLY the origin is stored
    for (const attempt of state.attempts) {
      expect(attempt.targetOrigin).toMatch(/^https?:\/\/[^/?#]+/);
      expect(attempt.targetOrigin).not.toContain('/v1/telemetry');
      expect(attempt.targetOrigin).not.toContain('?secret=123');
      expect(attempt.targetOrigin).not.toContain('/collect');
    }
  });

  it('classifies same-origin assets as same-origin', () => {
    privacyMonitor.recordAttempt('fetch', '/src/index.css');
    const state = privacyMonitor.getState();
    expect(state.totalAttempts).toBe(1);
    expect(state.unexpectedAttempts).toBe(0);
  });
});
