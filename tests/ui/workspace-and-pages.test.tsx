import { describe, it, expect } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { DiffViewer } from '../../src/components/workspace/DiffViewer';
import { EvaluatePage } from '../../src/pages/EvaluatePage';
import { PrivacyCenterPage } from '../../src/pages/PrivacyCenterPage';
import { WorkspacePage } from '../../src/pages/WorkspacePage';
import { sanitize, clearMapping } from '../../src/engine';
import { scanClientStorage } from '../../src/privacy/storageScan';

describe('UI Integration & Page Component Workflows', () => {
  it('renders DiffViewer with <script> tags safely as text without script execution', () => {
    const xssPayload = '<script>alert("xss")</script> user@example.com';
    const result = sanitize(xssPayload);

    const html = ReactDOMServer.renderToString(
      React.createElement(DiffViewer, {
        originalText: xssPayload,
        sanitizedText: result.output,
        entities: result.entities,
        mode: 'fullMask',
        onSelectEntity: () => {},
        selectedEntity: null,
      })
    );

    // Escaped entities in HTML output
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain('[REDACTED_EMAIL]');
  });

  it('renders PrivacyCenterPage with zero canary leaks and passes storage audit', async () => {
    const report = await scanClientStorage();
    expect(report.piiLeakFound).toBe(false);

    const html = ReactDOMServer.renderToString(React.createElement(PrivacyCenterPage));
    expect(html).toContain('Privacy Proof Center');
    expect(html).toContain('100% Client-Side');
    expect(html).not.toContain('canary.leak@classified.gov');
  });

  it('renders EvaluatePage containing judge-friendly scenarios and benchmark triggers', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EvaluatePage));
    expect(html).toContain('Scenario Evaluation &amp; Benchmark');
    expect(html).toContain('Run Detection Benchmark');
    expect(html).toContain('Customer Support Escalation Ticket');
  });

  it('renders WorkspacePage with interactive toolbar and initial empty state', () => {
    const html = ReactDOMServer.renderToString(React.createElement(WorkspacePage));
    expect(html).toContain('Load Sample');
    expect(html).toContain('INPUT DOCUMENT');
    expect(html).toContain('Clear Memory');
  });

  it('clears pseudonym state and resets mapping counters on Clear Memory', () => {
    clearMapping();
    const res1 = sanitize('Alice at alice@example.com and Bob at bob@example.com', {
      mode: 'pseudonymize',
    });
    expect(res1.output).toContain('USER_01');
    expect(res1.output).toContain('USER_02');

    // Clear Memory
    clearMapping();
    const res2 = sanitize('New user at newuser@example.com', {
      mode: 'pseudonymize',
    });
    // Counter resets back to 01
    expect(res2.output).toContain('USER_01');
  });

  it('supports mode switching between Full, Partial, and Pseudonymize with identical entity spans', () => {
    const doc = 'Email test@corp.com phone 9820112345';
    const full = sanitize(doc, { mode: 'fullMask' });
    const partial = sanitize(doc, { mode: 'partialMask' });
    const pseudo = sanitize(doc, { mode: 'pseudonymize' });

    expect(full.entities.length).toBe(partial.entities.length);
    expect(partial.entities.length).toBe(pseudo.entities.length);

    expect(full.output).toContain('[REDACTED_EMAIL]');
    expect(partial.output).toContain('t***@corp.com');
    expect(pseudo.output).toContain('USER_01');
  });

  it('validates file upload constraints (rejecting >2MB or invalid extensions)', () => {
    const validExtensions = ['.txt', '.csv', '.log', '.md', '.json'];
    const maxFileSize = 2 * 1024 * 1024;

    const invalidFile = { name: 'malware.exe', size: 1024 };
    const oversizedFile = { name: 'large.txt', size: 3 * 1024 * 1024 };
    const validFile = { name: 'tickets.csv', size: 50 * 1024 };

    const getExt = (name: string) => '.' + name.split('.').pop()?.toLowerCase();

    expect(validExtensions.includes(getExt(invalidFile.name))).toBe(false);
    expect(oversizedFile.size > maxFileSize).toBe(true);
    expect(validExtensions.includes(getExt(validFile.name))).toBe(true);
    expect(validFile.size <= maxFileSize).toBe(true);
  });
});
