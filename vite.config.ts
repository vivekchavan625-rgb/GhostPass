/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const cspMetaPlugin = (): Plugin => ({
  name: 'html-csp-meta-plugin',
  apply: 'build', // Only inject meta CSP on production build, preserving unrestricted HMR in dev
  transformIndexHtml(html) {
    // Omits frame-ancestors (not allowed in meta tags per W3C specification)
    const cspContent = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'self' blob:;";
    const metaTag = `<meta http-equiv="Content-Security-Policy" content="${cspContent}">`;
    return html.replace('</head>', `  ${metaTag}\n  </head>`);
  }
});

export default defineConfig({
  plugins: [react(), cspMetaPlugin()],
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/engine/**'],
      exclude: ['src/engine/**/*.d.ts']
    }
  }
});
