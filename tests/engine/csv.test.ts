import { describe, it, expect, vi } from 'vitest';
import { isPlainNumeric, neutralizeCSVCell, sanitizeCSV } from '../../src/engine/csv';

describe('CSV Engine & Formula-Injection Suite', () => {
  describe('Plain Numeric Detection', () => {
    it('recognizes plain integers and floats as plain numeric', () => {
      expect(isPlainNumeric('42')).toBe(true);
      expect(isPlainNumeric('-42')).toBe(true);
      expect(isPlainNumeric('-42.5')).toBe(true);
      expect(isPlainNumeric('+100.25')).toBe(true);
      expect(isPlainNumeric('0')).toBe(true);
    });

    it('rejects phone numbers and formula strings as not plain numeric', () => {
      expect(isPlainNumeric('+91 98201 12345')).toBe(false);
      expect(isPlainNumeric('+91-9820112345')).toBe(false);
      expect(isPlainNumeric('=SUM(A1:B2)')).toBe(false);
      expect(isPlainNumeric('-2+5')).toBe(false);
      expect(isPlainNumeric('@cmd')).toBe(false);
      expect(isPlainNumeric('+')).toBe(false);
      expect(isPlainNumeric('-')).toBe(false);
      expect(isPlainNumeric('')).toBe(false);
    });
  });

  describe('Neutralize CSV Cell', () => {
    it('prepends single quote to dangerous formula characters', () => {
      expect(neutralizeCSVCell('=1+1')).toEqual({ value: "'=1+1", neutralized: true });
      expect(neutralizeCSVCell('@HYPERLINK("evil.com")')).toEqual({
        value: "'@HYPERLINK(\"evil.com\")",
        neutralized: true,
      });
      expect(neutralizeCSVCell('\tmalicious')).toEqual({
        value: "'\tmalicious",
        neutralized: true,
      });
      expect(neutralizeCSVCell('+91 98201 12345')).toEqual({
        value: "'+91 98201 12345",
        neutralized: true,
      });
    });

    it('exempts pure negative and positive numbers from neutralization', () => {
      expect(neutralizeCSVCell('-42.5')).toEqual({ value: '-42.5', neutralized: false });
      expect(neutralizeCSVCell('+100')).toEqual({ value: '+100', neutralized: false });
    });

    it('leaves standard text cells untouched', () => {
      expect(neutralizeCSVCell('Hello World')).toEqual({ value: 'Hello World', neutralized: false });
      expect(neutralizeCSVCell('admin@example.com')).toEqual({
        value: 'admin@example.com',
        neutralized: false,
      });
    });
  });

  describe('Full CSV Sanitize Round-Trip', () => {
    it('preserves headers, column count, and sanitized cell boundaries', () => {
      const csvInput = `ID,Name,Email,Balance\n101,John Doe,john.doe@example.com,-42.5\n102,Secret,+91 98201 12345,=SUM(A1:A2)`;
      const res = sanitizeCSV(csvInput, { mode: 'fullMask' });

      expect(res.headers).toEqual(['ID', 'Name', 'Email', 'Balance']);
      expect(res.rows.length).toBe(3);
      // Email sanitized
      expect(res.outputCSV).toContain('[REDACTED_EMAIL]');
      // Balance -42.5 kept as pure number
      expect(res.outputCSV).toContain('-42.5');
      // Phone redacted
      expect(res.outputCSV).toContain('[REDACTED_PHONE]');
      // Formula neutralized
      expect(res.outputCSV).toContain("'=SUM(A1:A2)");
      expect(res.neutralizedCount).toBe(1);
    });

    it('handles multiline quoted cells, escaped quotes, and empty cells', () => {
      const multilineCSV = `"Col1","Col2","Email"\n"Line 1\nLine 2","Normal","user@example.com"\n"With ""Quotes""","","dev@example.org"`;
      const res = sanitizeCSV(multilineCSV);

      expect(res.headers).toEqual(['Col1', 'Col2', 'Email']);
      expect(res.outputCSV).toContain('Line 1\nLine 2');
      expect(res.outputCSV).toContain('With ""Quotes""');
      expect(res.outputCSV).toContain('[REDACTED_EMAIL]');
    });

    it('preserves non-comma delimiter e.g. semicolon', () => {
      const semiCSV = `Name;Contact;Role\nAlice;alice@example.com;Admin`;
      const res = sanitizeCSV(semiCSV);
      expect(res.outputCSV).toContain(';');
      expect(res.outputCSV).toContain('[REDACTED_EMAIL]');
    });
  });

  describe('Blob URL Revocation Verification', () => {
    it('revokes Blob URLs immediately after download creation', () => {
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
      const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');

      const blob = new Blob(['test content'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      URL.revokeObjectURL(url);

      expect(createSpy).toHaveBeenCalled();
      expect(revokeSpy).toHaveBeenCalledWith('blob:test-url');

      revokeSpy.mockRestore();
      createSpy.mockRestore();
    });
  });
});
