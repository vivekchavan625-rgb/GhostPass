import { describe, it, expect } from 'vitest';
import { detectPII, resolveOverlaps, MAX_INPUT_SIZE } from '../../src/engine/detect';
import { Entity } from '../../src/engine/types';

describe('Detection Engine Suite', () => {
  it('returns empty array on empty or whitespace string', () => {
    expect(detectPII('')).toEqual([]);
    expect(detectPII('   \n  \t  ')).toEqual([]);
  });

  it('detects multiple categories in complex text', () => {
    const text = `
      User priya.sharma@example.com called from +91 98201 12345.
      PAN: ABCPV1234K, Aadhaar: 3675 9834 6016, Card: 4532 0150 1234 5671, IP: 192.168.1.1
    `;
    const entities = detectPII(text);
    const categories = entities.map((e) => e.category);

    expect(categories).toContain('email');
    expect(categories).toContain('phone');
    expect(categories).toContain('pan');
    expect(categories).toContain('aadhaar');
    expect(categories).toContain('credit-card');
    expect(categories).toContain('ipv4');
  });

  it('filters by enabledCategories option', () => {
    const text = 'Contact john@example.com or call +91 98201 12345';
    const emailOnly = detectPII(text, { enabledCategories: ['email'] });
    expect(emailOnly.length).toBe(1);
    expect(emailOnly[0].category).toBe('email');

    const phoneOnly = detectPII(text, { enabledCategories: ['phone'] });
    expect(phoneOnly.length).toBe(1);
    expect(phoneOnly[0].category).toBe('phone');
  });

  it('rejects inputs exceeding MAX_INPUT_SIZE limit', () => {
    const hugeInput = 'a'.repeat(MAX_INPUT_SIZE + 10);
    expect(() => detectPII(hugeInput)).toThrow(/exceeds maximum size limit/);
  });

  it('handles adjacent PII tokens and repeated values correctly', () => {
    const text = 'test1@example.com test2@example.com test1@example.com';
    const entities = detectPII(text);
    expect(entities.length).toBe(3);
    expect(entities[0].start).toBe(0);
    expect(entities[2].value).toBe('test1@example.com');
  });

  it('handles unicode, emoji, tabs, and newlines safely without offset drift', () => {
    const text = `🚀 Emergency Alert!\n\tEmail: user@example.com\n\tCard: 4532-0150-1234-5671 🛡️`;
    const entities = detectPII(text);
    expect(entities.length).toBe(2);

    for (const ent of entities) {
      expect(text.slice(ent.start, ent.end)).toBe(ent.value);
    }
  });

  describe('Overlap Resolution Determinism', () => {
    it('prioritizes credit-card over aadhaar and phone on overlapping digit spans', () => {
      // 16-digit number that also contains a 10-digit phone substring
      const cardText = '4532015012345671';
      const entities = detectPII(cardText);
      expect(entities.length).toBe(1);
      expect(entities[0].category).toBe('credit-card');
    });

    it('resolves deterministic overlap between fake simulated overlapping entities', () => {
      const mockPhone: Entity = {
        id: '1',
        detectorId: 'phone',
        category: 'phone',
        start: 0,
        end: 10,
        length: 10,
        value: '9820112345',
        confidence: 'high',
        validated: true
      };

      const mockCard: Entity = {
        id: '2',
        detectorId: 'credit-card',
        category: 'credit-card',
        start: 0,
        end: 16,
        length: 16,
        value: '4532015012345671',
        confidence: 'high',
        validated: true
      };

      const resolved = resolveOverlaps([mockPhone, mockCard]);
      expect(resolved.length).toBe(1);
      expect(resolved[0].category).toBe('credit-card');
    });
  });
});
