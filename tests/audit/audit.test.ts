import { describe, it, expect, beforeEach } from 'vitest';
import { auditStore } from '../../src/audit';
import { sanitize } from '../../src/engine';

describe('Audit Store Privacy & Invariant Suite', () => {
  beforeEach(() => {
    auditStore.clearLog();
  });

  it('logs events without leaking raw document text, entity values, or filenames', () => {
    const canaryEmail = 'secret.canary@internal-bank.com';
    const canaryDoc = `User confidential email: ${canaryEmail}`;

    const res = sanitize(canaryDoc);
    auditStore.logEvent({
      type: 'sanitize',
      mode: 'fullMask',
      detectedCount: res.entities.length,
      redactedCount: res.output.length,
      rejectedCount: 0,
      durationMs: res.durationMs,
    });

    const events = auditStore.getEvents();
    expect(events.length).toBe(1);
    expect(events[0].detectedCount).toBe(1);

    // Serialization verification
    const serializedLog = auditStore.exportAuditJSON();
    expect(serializedLog).not.toContain(canaryEmail);
    expect(serializedLog).not.toContain('secret.canary');
    expect(serializedLog).not.toContain('User confidential email');
  });

  it('clears log from memory on clearLog()', () => {
    auditStore.logEvent({ type: 'memory-clear' });
    expect(auditStore.getEvents().length).toBe(1);
    auditStore.clearLog();
    expect(auditStore.getEvents().length).toBe(0);
  });
});
