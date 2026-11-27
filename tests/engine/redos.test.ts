import { describe, it, expect } from 'vitest';
import { ALL_DETECTORS } from '../../src/engine/detectors';

describe('ReDoS Resilience Suite', () => {
  it('completes detection on adversarial long string patterns within 200ms', () => {
    // 1. 100k repeated characters
    const repeatedDigits = '9'.repeat(100_000);
    // 2. Pathological repeated "a@a." pattern
    const pathologicalEmail = 'a@' + 'a.'.repeat(5_000) + 'com';
    // 3. Repeated separators
    const repeatedSeparators = '4111' + '- - '.repeat(5_000) + '1111';

    for (const detector of ALL_DETECTORS) {
      // Test 100k digits
      const start1 = performance.now();
      detector.pattern.lastIndex = 0;
      detector.pattern.test(repeatedDigits);
      const elapsed1 = performance.now() - start1;
      expect(elapsed1).toBeLessThan(200);

      // Test pathological email
      const start2 = performance.now();
      detector.pattern.lastIndex = 0;
      detector.pattern.test(pathologicalEmail);
      const elapsed2 = performance.now() - start2;
      expect(elapsed2).toBeLessThan(200);

      // Test repeated separators
      const start3 = performance.now();
      detector.pattern.lastIndex = 0;
      detector.pattern.test(repeatedSeparators);
      const elapsed3 = performance.now() - start3;
      expect(elapsed3).toBeLessThan(200);
    }
  });
});
