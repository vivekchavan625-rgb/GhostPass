import { describe, it, expect } from 'vitest';
import { sanitize } from '../../src/engine';

describe('XSS Safety Suite', () => {
  it('treats dangerous HTML injection strings strictly as inert text without evaluation', () => {
    const maliciousInput = `<script>alert(1)</script><img src=x onerror=alert(1)> and user email test@example.com`;
    const res = sanitize(maliciousInput, { mode: 'fullMask' });

    // PII was redacted
    expect(res.output).toContain('[REDACTED_EMAIL]');
    // Malicious script tag remains as pure string characters, not executed or parsed into DOM
    expect(res.output).toContain('<script>alert(1)</script>');
    expect(res.output).toContain('<img src=x onerror=alert(1)>');
  });

  it('preserves symbols, quotes, and brackets accurately without entity escaping errors', () => {
    const codeSnippet = `const el = <div className="test">{val < 5 ? 'yes' : 'no'}</div>;`;
    const res = sanitize(codeSnippet);
    expect(res.output).toBe(codeSnippet);
  });
});
