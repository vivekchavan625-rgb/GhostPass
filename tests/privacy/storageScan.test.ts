import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scanClientStorage } from '../../src/privacy/storageScan';

describe('Storage Scan Suite', () => {
  // Setup fake localStorage in node test environment
  const originalLocalStorage = globalThis.localStorage;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    // @ts-expect-error Mocking localStorage
    globalThis.localStorage = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStorage[k];
      },
      clear: () => {
        mockStorage = {};
      },
      key: (i: number) => Object.keys(mockStorage)[i] ?? null,
      get length() {
        return Object.keys(mockStorage).length;
      },
    };
  });

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage;
  });

  it('reports clean storage state when no PII exists', async () => {
    localStorage.setItem('ghostpass_theme', 'dark');
    const report = await scanClientStorage();

    expect(report.piiLeakFound).toBe(false);
    expect(report.localStorageKeys).toContain('ghostpass_theme');
    expect(report.leakReport[0].passed).toBe(true);
  });

  it('detects planted canary document text in localStorage and flags leak', async () => {
    const canaryText = 'CANARY_SENSITIVE_DATA_JOHN_DOE_12345';
    localStorage.setItem('leaked_session', `User state with ${canaryText}`);

    const report = await scanClientStorage(canaryText);
    expect(report.piiLeakFound).toBe(true);
    expect(report.leakReport.some((l) => !l.passed)).toBe(true);
  });
});
