import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Production CSP & Security Headers Config Suite', () => {
  it('verifies vercel.json contains connect-src \'none\' and security headers', () => {
    const vercelPath = path.resolve(__dirname, '../../vercel.json');
    expect(fs.existsSync(vercelPath)).toBe(true);

    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf-8'));
    const headers = vercelConfig.headers[0].headers;

    const csp = headers.find((h: { key: string }) => h.key === 'Content-Security-Policy')?.value;
    expect(csp).toBeDefined();
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");

    const nosniff = headers.find((h: { key: string }) => h.key === 'X-Content-Type-Options')?.value;
    expect(nosniff).toBe('nosniff');
  });

  it('verifies vite.config.ts configures html CSP meta plugin for production build', () => {
    const viteConfigPath = path.resolve(__dirname, '../../vite.config.ts');
    const viteContent = fs.readFileSync(viteConfigPath, 'utf-8');

    expect(viteContent).toContain('html-csp-meta-plugin');
    expect(viteContent).toContain("connect-src 'none'");
    expect(viteContent).toContain("apply: 'build'");
  });
});
