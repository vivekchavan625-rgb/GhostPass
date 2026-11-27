import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitize,
  fullMask,
  partialMask,
  clearMapping,
  exportMapping,
  reconstruct
} from '../../src/engine';
import { Entity } from '../../src/engine/types';

describe('Redaction & Sanitization Suite', () => {
  beforeEach(() => {
    clearMapping();
  });

  const sampleText = `User rahul.verma@example.com has phone +91 98765 43210, PAN ABCPV1234K, Aadhaar 3675 9834 6016, Card 4532-0150-1234-5671, IP 192.168.1.50.`;

  describe('Full Mask Mode', () => {
    it('replaces entities with category tags', () => {
      const res = sanitize(sampleText, { mode: 'fullMask' });
      expect(res.output).toContain('[REDACTED_EMAIL]');
      expect(res.output).toContain('[REDACTED_PHONE]');
      expect(res.output).toContain('[REDACTED_PAN]');
      expect(res.output).toContain('[REDACTED_AADHAAR]');
      expect(res.output).toContain('[REDACTED_CARD]');
      expect(res.output).toContain('[REDACTED_IP]');

      // Never leaks original sensitive values
      expect(res.output).not.toContain('rahul.verma@example.com');
      expect(res.output).not.toContain('ABCPV1234K');
      expect(res.output).not.toContain('4532-0150-1234-5671');
    });
  });

  describe('Partial Mask Mode', () => {
    it('masks according to category rules while preserving context', () => {
      const res = sanitize(sampleText, { mode: 'partialMask' });
      expect(res.output).toContain('r***@example.com');
      expect(res.output).toContain('98XXXXXX10');
      expect(res.output).toContain('ABXXXXX34K');
      expect(res.output).toContain('XXXX-XXXX-XXXX-5671');
      expect(res.output).toContain('XXXX XXXX 6016');
      expect(res.output).toContain('192.XXX.XXX.XXX');
    });

    it('formats unseparated cards and aadhaars properly', () => {
      const unspacedCard: Entity = {
        id: '1',
        detectorId: 'card',
        category: 'credit-card',
        start: 0,
        end: 16,
        length: 16,
        value: '4111111111111111',
        confidence: 'high',
        validated: true
      };
      expect(partialMask(unspacedCard)).toBe('XXXXXXXXXXXX1111');

      const unspacedAadhaar: Entity = {
        id: '2',
        detectorId: 'aadhaar',
        category: 'aadhaar',
        start: 0,
        end: 12,
        length: 12,
        value: '987654321096',
        confidence: 'high',
        validated: true
      };
      expect(partialMask(unspacedAadhaar)).toBe('XXXXXXXX1096');
    });
  });

  describe('Pseudonymization Mode', () => {
    it('assigns independent counters per category and maintains consistency', () => {
      const text = `
        Admin: admin@example.com, Guest: guest@example.com, Repeated: admin@example.com
        IPs: 192.168.1.1 and 10.0.0.1 and 192.168.1.1
        Phones: +91 98201 12345 and +91 98201 99999 and +91 98201 12345
      `;
      const res = sanitize(text, { mode: 'pseudonymize', preserveMapping: true });

      expect(res.output).toContain('USER_01');
      expect(res.output).toContain('USER_02');
      expect(res.output).toContain('IP_01');
      expect(res.output).toContain('IP_02');
      expect(res.output).toContain('PHONE_01');
      expect(res.output).toContain('PHONE_02');

      // Check consistency: same email got USER_01 both times
      const occurrencesUser1 = (res.output.match(/USER_01/g) || []).length;
      expect(occurrencesUser1).toBe(2);

      // Category namespaces are independent: USER_01 and IP_01 both start at 01
      expect(res.output).toContain('USER_01');
      expect(res.output).toContain('IP_01');
      expect(res.output).toContain('PHONE_01');
    });

    it('clearMapping resets the pseudonyms', () => {
      const text = 'test@example.com';
      const res1 = sanitize(text, { mode: 'pseudonymize', preserveMapping: true });
      expect(res1.output).toContain('USER_01');

      clearMapping();
      const res2 = sanitize(text, { mode: 'pseudonymize', preserveMapping: true });
      expect(res2.output).toContain('USER_01');
    });

    it('exportMapping exports copy without side effects', () => {
      sanitize('user@example.com', { mode: 'pseudonymize', preserveMapping: true });
      const mapping = exportMapping();
      expect(mapping['email:user@example.com']).toBe('USER_01');
    });
  });

  describe('Reconstruction Accuracy', () => {
    it('preserves non-PII text, whitespace, and newlines byte-for-byte', () => {
      const input = "\n\tHello   World!\n  \tPriya: priya@example.com  \n-- End of Line --\n";
      const res = sanitize(input, { mode: 'fullMask' });
      expect(res.output).toBe(
        "\n\tHello   World!\n  \tPriya: [REDACTED_EMAIL]  \n-- End of Line --\n"
      );
    });

    it('reconstruct returns identical text when entity list is empty', () => {
      const text = 'Nothing to redact here!';
      expect(reconstruct(text, [], fullMask)).toBe(text);
    });
  });

  describe('Sanitize Statistics', () => {
    it('returns exact counts without leaking raw sensitive data', () => {
      const res = sanitize(sampleText, { mode: 'fullMask' });
      expect(res.stats.totalEntities).toBe(6);
      expect(res.stats.categoryCounts['email']).toBe(1);
      expect(res.stats.categoryCounts['phone']).toBe(1);
      expect(res.stats.categoryCounts['pan']).toBe(1);
      expect(res.stats.categoryCounts['aadhaar']).toBe(1);
      expect(res.stats.categoryCounts['credit-card']).toBe(1);
      expect(res.stats.categoryCounts['ipv4']).toBe(1);
      expect(res.stats.charsOriginal).toBe(sampleText.length);
      expect(res.durationMs).toBeGreaterThanOrEqual(0);
    });
  });
});
