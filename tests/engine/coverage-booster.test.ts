import { describe, it, expect } from 'vitest';
import { validateEmail } from '../../src/engine/validators/email';
import { isPlainNumeric, neutralizeCSVCell, sanitizeCSV } from '../../src/engine/csv';

describe('Engine Edge Cases Coverage Booster', () => {
  describe('Email validator branch coverage', () => {
    it('handles extreme bounds and invalid local/domain segments', () => {
      // Too short (<5 chars)
      expect(validateEmail('a@b')).toBe(false);
      // Too long (>254 chars)
      expect(validateEmail('a'.repeat(250) + '@example.com')).toBe(false);
      // Leading dot or trailing dot in local part
      expect(validateEmail('.user@example.com')).toBe(false);
      expect(validateEmail('user.@example.com')).toBe(false);
      // Double dot in local part
      expect(validateEmail('user..name@example.com')).toBe(false);
      // Leading dot or trailing dot in domain part
      expect(validateEmail('user@.example.com')).toBe(false);
      expect(validateEmail('user@example.com.')).toBe(false);
      // Double dot in domain part
      expect(validateEmail('user@example..com')).toBe(false);
      // Local part exceeding 64 chars
      expect(validateEmail('a'.repeat(65) + '@example.com')).toBe(false);
      // Domain part exceeding 253 chars
      expect(validateEmail('user@' + 'a'.repeat(250) + '.com')).toBe(false);
      // TLD with digits or special characters
      expect(validateEmail('user@example.c1')).toBe(false);
      expect(validateEmail('user@example.c_m')).toBe(false);
      // Disallowed chars in local part
      expect(validateEmail('user space@example.com')).toBe(false);
      expect(validateEmail('user[test]@example.com')).toBe(false);
    });
  });

  describe('CSV edge cases coverage', () => {
    it('handles numeric edge cases for isPlainNumeric', () => {
      expect(isPlainNumeric('')).toBe(false);
      expect(isPlainNumeric('+')).toBe(false);
      expect(isPlainNumeric('-')).toBe(false);
      expect(isPlainNumeric('   ')).toBe(false);
      expect(isPlainNumeric('123.456')).toBe(true);
      expect(isPlainNumeric('-99.9')).toBe(true);
      expect(isPlainNumeric('+42')).toBe(true);
      expect(isPlainNumeric('12a34')).toBe(false);
    });

    it('neutralizes all formula injection characters properly', () => {
      expect(neutralizeCSVCell('')).toEqual({ value: '', neutralized: false });
      // Non-string input safety
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(neutralizeCSVCell(null as any)).toEqual({ value: null, neutralized: false });

      // Formula triggers
      expect(neutralizeCSVCell('=2+2')).toEqual({ value: "'=2+2", neutralized: true });
      expect(neutralizeCSVCell('@SUM(A1:A5)')).toEqual({ value: "'@SUM(A1:A5)", neutralized: true });
      expect(neutralizeCSVCell('\tTAB_INJECT')).toEqual({ value: "'\tTAB_INJECT", neutralized: true });
      expect(neutralizeCSVCell('\rRET_INJECT')).toEqual({ value: "'\rRET_INJECT", neutralized: true });

      // Plain negative and positive numbers should not be neutralized
      expect(neutralizeCSVCell('-42')).toEqual({ value: '-42', neutralized: false });
      expect(neutralizeCSVCell('+100')).toEqual({ value: '+100', neutralized: false });
    });

    it('handles empty CSV input safely', () => {
      const res = sanitizeCSV('');
      expect(res.totalCells).toBe(0);
      expect(res.rows).toEqual([]);
      expect(res.headers).toEqual([]);
    });
  });
});
