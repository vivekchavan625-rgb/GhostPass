import { describe, it, expect } from 'vitest';
import { sanitizeCSV } from '../../src/engine/csv';
import { sanitize } from '../../src/engine';

describe('Prototype Pollution Defense Suite', () => {
  it('handles __proto__, constructor, and prototype safely as CSV headers and cell values', () => {
    const maliciousCSV = `__proto__,constructor,prototype,email\npolluted,polluted,polluted,user@example.com`;
    const res = sanitizeCSV(maliciousCSV);

    expect(res.headers).toEqual(['__proto__', 'constructor', 'prototype', 'email']);
    expect(res.outputCSV).toContain('[REDACTED_EMAIL]');

    // Assert that Object prototype is completely unpolluted
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((Object.prototype as any).polluted).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((Object.prototype as any)['__proto__']).toBeDefined(); // standard Object accessor
  });

  it('handles __proto__ and constructor values inside text inputs without prototype mutation', () => {
    const text = 'User input with __proto__=polluted and constructor.prototype.isAdmin=true and test@example.com';
    const res = sanitize(text, { mode: 'pseudonymize' });

    expect(res.output).toContain('USER_01');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((Object.prototype as any).isAdmin).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((Object.prototype as any).polluted).toBeUndefined();
  });
});
